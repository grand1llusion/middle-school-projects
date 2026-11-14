import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand, PutCommand, QueryCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLE } from '../shared/db';
import { playerId as genPlayerId } from '../shared/ids';
import { ok, created, err } from '../shared/response';

const ADJECTIVES = ['Sparkly','Fluffy','Bouncy','Wiggly','Snuggly','Silly','Cozy','Zippy','Happy','Fuzzy','Bubbly','Jolly'];
const ANIMALS = ['Otter','Penguin','Bunny','Kitten','Puppy','Panda','Koala','Hedgehog','Hamster','Duckling'];

function generateName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${adj} ${animal} ${num}`;
}

export const getSub = (event: APIGatewayProxyEventV2WithJWTAuthorizer): string =>
  event.requestContext.authorizer.jwt.claims['sub'] as string;

export const verifyPlayerOwnership = async (sub: string, pid: string): Promise<boolean> => {
  const result = await ddb.send(new GetCommand({
    TableName: TABLE,
    Key: { pk: `P#${sub}`, sk: `PLAYER#${pid}` },
  }));
  return !!(result.Item && !result.Item['deleted']);
};

export const createPlayer = async (event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  const sub = getSub(event);

  const existing = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
    ExpressionAttributeValues: { ':pk': `P#${sub}`, ':prefix': 'PLAYER#' },
    Select: 'COUNT',
  }));
  if ((existing.Count ?? 0) >= 6) return err(400, 'max_players');

  const pid = genPlayerId();
  const coat = Math.floor(Math.random() * 6);
  const displayName = generateName();
  const now = new Date().toISOString();

  await ddb.send(new PutCommand({
    TableName: TABLE,
    Item: { pk: `P#${sub}`, sk: `PLAYER#${pid}`, displayName, coat, wear: [], createdAt: now },
  }));

  // Also ensure a parent profile row exists
  await ddb.send(new PutCommand({
    TableName: TABLE,
    Item: { pk: `P#${sub}`, sk: 'PROFILE', createdAt: now },
    ConditionExpression: 'attribute_not_exists(pk)',
  })).catch(() => { /* already exists */ });

  return created({ playerId: pid, displayName, coat, wear: [] });
};

export const listPlayers = async (event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  const sub = getSub(event);
  const result = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
    FilterExpression: 'attribute_not_exists(#del)',
    ExpressionAttributeNames: { '#del': 'deleted' },
    ExpressionAttributeValues: { ':pk': `P#${sub}`, ':prefix': 'PLAYER#' },
  }));

  const players = (result.Items ?? []).map(item => ({
    playerId: (item['sk'] as string).replace('PLAYER#', ''),
    displayName: item['displayName'],
    coat: item['coat'],
    wear: item['wear'],
  }));

  return ok({ players });
};

export const deletePlayer = async (event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  const sub = getSub(event);
  const pid = event.pathParameters?.['playerId'];
  if (!pid) return err(400, 'missing_player_id');
  if (!await verifyPlayerOwnership(sub, pid)) return err(404, 'not_found');

  // Find clubs this player belongs to
  const clubMemberships = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
    ExpressionAttributeValues: { ':pk': `PL#${pid}`, ':prefix': 'CLUB#' },
  }));

  // Build delete items in batches of 25 (DynamoDB TransactWrite limit)
  const deletes: Array<{ Delete: { TableName: string; Key: Record<string, string> } }> = [
    { Delete: { TableName: TABLE, Key: { pk: `P#${sub}`, sk: `PLAYER#${pid}` } } },
    { Delete: { TableName: TABLE, Key: { pk: `PL#${pid}`, sk: 'PROGRESS' } } },
  ];

  for (const club of clubMemberships.Items ?? []) {
    const cid = (club['sk'] as string).replace('CLUB#', '');
    deletes.push({ Delete: { TableName: TABLE, Key: { pk: `C#${cid}`, sk: `M#${pid}` } } });
    deletes.push({ Delete: { TableName: TABLE, Key: { pk: `PL#${pid}`, sk: `CLUB#${cid}` } } });
    // Weekly score rows are cleaned up by TTL
  }

  for (let i = 0; i < deletes.length; i += 25) {
    const batch = deletes.slice(i, i + 25);
    if (batch.length) await ddb.send(new TransactWriteCommand({ TransactItems: batch }));
  }

  return ok({ ok: true });
};
