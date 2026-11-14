import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand, PutCommand, QueryCommand, DeleteCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { z } from 'zod';
import { ddb, TABLE } from '../shared/db';
import { ok, created, err } from '../shared/response';
import { clubId as genClubId, inviteCode as genInviteCode } from '../shared/ids';
import { getWeekId } from '../shared/week';
import { getSub, verifyPlayerOwnership } from './players';

const BLOCKLIST = ['fuck','shit','ass','bitch','cunt','damn','hell','piss','cock','dick'];
function cleanName(s: string): boolean {
  const lower = s.toLowerCase();
  return !BLOCKLIST.some(w => lower.includes(w));
}

export const createClub = async (event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  const sub = getSub(event);
  let body: unknown;
  try { body = JSON.parse(event.body ?? '{}'); } catch { return err(400, 'invalid_json'); }

  const parsed = z.object({ name: z.string().min(2).max(24).regex(/^[A-Za-z0-9 ]+$/) }).strict().safeParse(body);
  if (!parsed.success) return err(400, 'validation_error');
  const { name } = parsed.data;
  if (!cleanName(name)) return err(400, 'name_not_allowed');

  // Max 5 clubs per parent (check by scanning for clubs owned by this parent is expensive;
  // instead store a simple counter in a separate item)
  const ownerClubs = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'gsi1',
    KeyConditionExpression: 'gsi1pk = :pk',
    ExpressionAttributeValues: { ':pk': `OWNER#${sub}` },
    Select: 'COUNT',
  }));
  if ((ownerClubs.Count ?? 0) >= 5) return err(400, 'max_clubs');

  const cid = genClubId();
  const now = new Date().toISOString();

  // Try up to 3 times to get a unique invite code
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = genInviteCode();
    try {
      await ddb.send(new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: TABLE,
              Item: { pk: `C#${cid}`, sk: 'META', name, inviteCode: code, ownerSub: sub, createdAt: now, gsi1pk: `OWNER#${sub}`, gsi1sk: `C#${cid}` },
              ConditionExpression: 'attribute_not_exists(pk)',
            },
          },
          {
            Put: {
              TableName: TABLE,
              Item: { pk: `INV#${code}`, sk: 'INV', clubId: cid },
              ConditionExpression: 'attribute_not_exists(pk)',
            },
          },
        ],
      }));
      return created({ clubId: cid, inviteCode: code });
    } catch (e) {
      if (e instanceof ConditionalCheckFailedException && attempt < 2) continue;
      throw e;
    }
  }
  return err(500, 'code_collision');
};

export const joinClub = async (event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  const sub = getSub(event);
  let body: unknown;
  try { body = JSON.parse(event.body ?? '{}'); } catch { return err(400, 'invalid_json'); }

  const parsed = z.object({
    inviteCode: z.string().min(6).max(6),
    playerId: z.string().min(12).max(12),
  }).strict().safeParse(body);
  if (!parsed.success) return err(400, 'validation_error');
  const { inviteCode: code, playerId: pid } = parsed.data;

  if (!await verifyPlayerOwnership(sub, pid)) return err(404, 'not_found');

  // Look up club from invite code
  const inv = await ddb.send(new GetCommand({
    TableName: TABLE,
    Key: { pk: `INV#${code.toUpperCase()}`, sk: 'INV' },
  }));
  if (!inv.Item) return err(404, 'invalid_code');
  const cid = inv.Item['clubId'] as string;

  // Check member count
  const count = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
    ExpressionAttributeValues: { ':pk': `C#${cid}`, ':prefix': 'M#' },
    Select: 'COUNT',
  }));
  if ((count.Count ?? 0) >= 30) return err(400, 'club_full');

  // Check not already a member
  const existing = await ddb.send(new GetCommand({
    TableName: TABLE,
    Key: { pk: `C#${cid}`, sk: `M#${pid}` },
  }));
  if (existing.Item) return ok({ clubId: cid }); // idempotent

  const playerInfo = await ddb.send(new GetCommand({
    TableName: TABLE,
    Key: { pk: `P#${sub}`, sk: `PLAYER#${pid}` },
  }));
  const displayName = playerInfo.Item?.['displayName'] as string ?? '';
  const coat = (playerInfo.Item?.['coat'] as number) ?? 0;
  const wear: string[] = (playerInfo.Item?.['wear'] as string[]) ?? [];
  const now = new Date().toISOString();

  await ddb.send(new TransactWriteCommand({
    TransactItems: [
      {
        Put: {
          TableName: TABLE,
          Item: { pk: `C#${cid}`, sk: `M#${pid}`, displayName, coat, wear, joinedAt: now },
        },
      },
      {
        Put: {
          TableName: TABLE,
          Item: { pk: `PL#${pid}`, sk: `CLUB#${cid}`, clubId: cid, joinedAt: now },
        },
      },
    ],
  }));

  return ok({ clubId: cid });
};

export const removeMember = async (event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  const sub = getSub(event);
  const cid = event.pathParameters?.['clubId'];
  const pid = event.pathParameters?.['playerId'];
  if (!cid || !pid) return err(400, 'missing_params');

  // Caller must own the player OR be the club owner
  const [playerCheck, clubMeta] = await Promise.all([
    ddb.send(new GetCommand({ TableName: TABLE, Key: { pk: `P#${sub}`, sk: `PLAYER#${pid}` } })),
    ddb.send(new GetCommand({ TableName: TABLE, Key: { pk: `C#${cid}`, sk: 'META' } })),
  ]);

  const ownsPlayer = !!(playerCheck.Item && !playerCheck.Item['deleted']);
  const ownsClub = clubMeta.Item?.['ownerSub'] === sub;
  if (!ownsPlayer && !ownsClub) return err(404, 'not_found');

  await ddb.send(new TransactWriteCommand({
    TransactItems: [
      { Delete: { TableName: TABLE, Key: { pk: `C#${cid}`, sk: `M#${pid}` } } },
      { Delete: { TableName: TABLE, Key: { pk: `PL#${pid}`, sk: `CLUB#${cid}` } } },
    ],
  }));

  return ok({ ok: true });
};

export const listPlayerClubs = async (event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  const sub = getSub(event);
  const pid = event.pathParameters?.['playerId'];
  if (!pid) return err(400, 'missing_player_id');
  if (!await verifyPlayerOwnership(sub, pid)) return err(404, 'not_found');

  const memberships = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
    ExpressionAttributeValues: { ':pk': `PL#${pid}`, ':prefix': 'CLUB#' },
  }));

  const clubs = await Promise.all((memberships.Items ?? []).map(async m => {
    const cid = (m['sk'] as string).replace('CLUB#', '');
    const meta = await ddb.send(new GetCommand({
      TableName: TABLE,
      Key: { pk: `C#${cid}`, sk: 'META' },
    }));
    if (!meta.Item) return null;
    return {
      clubId: cid,
      name: meta.Item['name'],
      inviteCode: meta.Item['ownerSub'] === sub ? meta.Item['inviteCode'] : undefined,
      joinedAt: m['joinedAt'],
    };
  }));

  return ok({ clubs: clubs.filter(Boolean) });
};

export const getLeaderboard = async (event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  const sub = getSub(event);
  const cid = event.pathParameters?.['clubId'];
  const pid = event.queryStringParameters?.['playerId'];
  const period = event.queryStringParameters?.['period'] ?? 'week';

  if (!cid || !pid) return err(400, 'missing_params');
  if (!await verifyPlayerOwnership(sub, pid)) return err(404, 'not_found');

  // Confirm membership
  const member = await ddb.send(new GetCommand({ TableName: TABLE, Key: { pk: `C#${cid}`, sk: `M#${pid}` } }));
  if (!member.Item) return err(404, 'not_found');

  if (period === 'all') {
    const all = await ddb.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
      ExpressionAttributeValues: { ':pk': `C#${cid}`, ':prefix': 'M#' },
    }));
    const sorted = (all.Items ?? [])
      .sort((a, b) => ((b['allTimeStars'] as number) ?? 0) - ((a['allTimeStars'] as number) ?? 0));

    const toRow = (m: Record<string, unknown>, rank: number) => ({
      rank,
      playerId: (m['sk'] as string).replace('M#', ''),
      displayName: m['displayName'],
      coat: m['coat'],
      wear: m['wear'],
      stars: m['allTimeStars'] ?? 0,
      kittens: m['kittens'] ?? 0,
    });

    const top10 = sorted.slice(0, 10).map((m, i) => toRow(m, i + 1));
    const ownIdx = sorted.findIndex(m => m['sk'] === `M#${pid}`);
    const ownRow = ownIdx >= 0 ? toRow(sorted[ownIdx], ownIdx + 1) : null;

    return ok({ period: 'all', rows: top10, ownRow });
  }

  // Weekly
  const weekId = getWeekId();
  const all = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: { ':pk': `C#${cid}#W#${weekId}` },
    ScanIndexForward: false, // highest score first (sort key descends)
    Limit: 30,
  }));

  const rows = all.Items ?? [];
  const toRow = (r: Record<string, unknown>, rank: number) => ({
    rank,
    playerId: r['playerId'],
    displayName: r['displayName'],
    coat: r['coat'],
    wear: r['wear'],
    stars: r['stars'],
    streak: r['streak'],
    kittens: r['kittens'],
  });

  const top10 = rows.slice(0, 10).map((r, i) => toRow(r, i + 1));
  const ownIdx = rows.findIndex(r => r['playerId'] === pid);
  const ownRow = ownIdx >= 0 ? toRow(rows[ownIdx], ownIdx + 1) : null;

  return ok({ period: 'week', weekId, rows: top10, ownRow });
};
