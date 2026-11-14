import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand, PutCommand, QueryCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { z } from 'zod';
import { ddb, TABLE } from '../shared/db';
import { ok, err } from '../shared/response';
import { merge, type ProgressDoc } from '../shared/merge';
import { getWeekId } from '../shared/week';
import { getSub, verifyPlayerOwnership } from './players';

const cw = new CloudWatchClient({ region: process.env.REGION ?? 'us-west-2' });

const CatSchema = z.object({
  name: z.string().max(12),
  coat: z.number().int().min(0).max(5),
  wear: z.array(z.string().max(16)),
});

const DocSchema = z.object({
  stars: z.number().int().min(0),
  solved: z.number().int().min(0),
  area: z.record(z.string().max(32), z.number().int().min(0)),
  catAreas: z.array(z.string().max(32)),
  cats: z.array(CatSchema),
  got: z.number().int().min(0),
  food: z.number().int().min(0).max(1),
  treats: z.number().int().min(0),
  water: z.number().int().min(0).max(100),
  streak: z.number().int().min(0),
  day: z.string().max(10),
});

const PutBodySchema = z.object({
  doc: DocSchema,
  baseRev: z.number().int().min(0),
}).strict();

// 30 stars per rolling 5-minute window
const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_MAX = 30;

export const getProgress = async (event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  const sub = getSub(event);
  const pid = event.pathParameters?.['playerId'];
  if (!pid) return err(400, 'missing_player_id');
  if (!await verifyPlayerOwnership(sub, pid)) return err(404, 'not_found');

  const result = await ddb.send(new GetCommand({
    TableName: TABLE,
    Key: { pk: `PL#${pid}`, sk: 'PROGRESS' },
  }));

  if (!result.Item) return ok({ doc: null, rev: 0 });
  return ok({ doc: result.Item['doc'], rev: result.Item['rev'] });
};

export const putProgress = async (event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  const sub = getSub(event);
  const pid = event.pathParameters?.['playerId'];
  if (!pid) return err(400, 'missing_player_id');
  if (!await verifyPlayerOwnership(sub, pid)) return err(404, 'not_found');

  let body: unknown;
  try { body = JSON.parse(event.body ?? '{}'); } catch { return err(400, 'invalid_json'); }

  const parsed = PutBodySchema.safeParse(body);
  if (!parsed.success) return err(400, 'validation_error');
  const { doc: clientDoc } = parsed.data;

  for (let attempt = 0; attempt < 3; attempt++) {
    const stored = await ddb.send(new GetCommand({
      TableName: TABLE,
      Key: { pk: `PL#${pid}`, sk: 'PROGRESS' },
    }));

    const storedDoc = stored.Item?.['doc'] as ProgressDoc | undefined;
    const storedRev = (stored.Item?.['rev'] as number) ?? 0;
    const lastStars = (stored.Item?.['lastStars'] as number) ?? 0;
    const rateWindowStart = (stored.Item?.['rateWindowStart'] as number) ?? 0;
    const rateWindowEarned = (stored.Item?.['rateWindowEarned'] as number) ?? 0;

    const now = Date.now();
    const updatedAt = new Date(now).toISOString();
    const clientWithTs: ProgressDoc = { ...clientDoc, updatedAt };
    const merged = storedDoc ? merge(clientWithTs, { ...storedDoc, updatedAt: stored.Item?.['updatedAt'] as string | undefined }) : clientWithTs;

    // Rate-limit check: rolling 5-min window
    const delta = Math.max(0, merged.stars - lastStars);
    let windowStart = rateWindowStart;
    let windowEarned = rateWindowEarned;
    if (now - windowStart > RATE_WINDOW_MS) {
      windowStart = now;
      windowEarned = 0;
    }
    windowEarned += delta;
    const clipped = Math.max(0, windowEarned - RATE_MAX);
    const leaderboardStars = Math.max(lastStars, merged.stars - clipped);

    if (clipped > 0) {
      cw.send(new PutMetricDataCommand({
        Namespace: 'MeowMath',
        MetricData: [{ MetricName: 'ClippedStars', Value: clipped, Unit: 'Count' }],
      })).catch(() => { /* non-critical */ });
    }

    const newRev = storedRev + 1;

    try {
      const condExpr = storedDoc ? '#rev = :oldRev' : 'attribute_not_exists(pk)';
      await ddb.send(new PutCommand({
        TableName: TABLE,
        Item: {
          pk: `PL#${pid}`, sk: 'PROGRESS',
          doc: merged, rev: newRev, updatedAt,
          lastStars: merged.stars,
          rateWindowStart: windowStart,
          rateWindowEarned: Math.min(windowEarned, RATE_MAX),
        },
        ConditionExpression: condExpr,
        ...(storedDoc ? {
          ExpressionAttributeNames: { '#rev': 'rev' },
          ExpressionAttributeValues: { ':oldRev': storedRev },
        } : {}),
      }));
    } catch (e) {
      if (e instanceof ConditionalCheckFailedException && attempt < 2) continue;
      throw e;
    }

    // Update weekly scores in clubs (best-effort, non-blocking)
    updateWeeklyScores(pid, sub, merged, leaderboardStars).catch(() => { /* non-critical */ });

    return ok({ doc: merged, rev: newRev });
  }

  return err(409, 'conflict');
};

async function updateWeeklyScores(pid: string, sub: string, doc: ProgressDoc, leaderboardStars: number): Promise<void> {
  const clubs = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
    ExpressionAttributeValues: { ':pk': `PL#${pid}`, ':prefix': 'CLUB#' },
  }));
  if (!clubs.Items?.length) return;

  const playerInfo = await ddb.send(new GetCommand({
    TableName: TABLE,
    Key: { pk: `P#${sub}`, sk: `PLAYER#${pid}` },
  }));
  const coat = (playerInfo.Item?.['coat'] as number) ?? 0;
  const wear: string[] = (playerInfo.Item?.['wear'] as string[]) ?? [];
  const displayName = (playerInfo.Item?.['displayName'] as string) ?? '';

  const weekId = getWeekId();
  const kittens = doc.cats.length;
  const paddedStars = String(leaderboardStars).padStart(6, '0');
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60; // 60 days TTL

  for (const club of clubs.Items) {
    const cid = (club['sk'] as string).replace('CLUB#', '');
    const scoreKey = { pk: `C#${cid}#W#${weekId}`, sk: `S#${paddedStars}#${pid}` };

    // Find the player's existing score row for this week (may have different padded value)
    const existing = await ddb.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
      FilterExpression: 'playerId = :pid',
      ExpressionAttributeValues: {
        ':pk': `C#${cid}#W#${weekId}`,
        ':prefix': 'S#',
        ':pid': pid,
      },
    }));

    const writes: object[] = [
      {
        Put: {
          TableName: TABLE,
          Item: { ...scoreKey, playerId: pid, displayName, coat, wear, stars: leaderboardStars, streak: doc.streak, kittens, expiresAt },
        },
      },
      {
        Put: {
          TableName: TABLE,
          Item: { pk: `C#${cid}`, sk: `M#${pid}`, displayName, coat, wear, joinedAt: club['joinedAt'], allTimeStars: leaderboardStars, kittens },
        },
      },
    ];

    for (const row of existing.Items ?? []) {
      if (row['sk'] !== scoreKey.sk) {
        writes.push({ Delete: { TableName: TABLE, Key: { pk: row['pk'], sk: row['sk'] } } });
      }
    }

    if (writes.length <= 25) {
      await ddb.send(new TransactWriteCommand({ TransactItems: writes }));
    }
  }
}
