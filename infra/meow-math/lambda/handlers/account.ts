import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { QueryCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityProviderClient, AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { ddb, TABLE } from '../shared/db';
import { ok, err } from '../shared/response';
import { getSub } from './players';

const cognito = new CognitoIdentityProviderClient({ region: process.env.REGION ?? 'us-west-2' });

export const deleteAccount = async (event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  const sub = getSub(event);

  // List all players
  const players = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
    ExpressionAttributeValues: { ':pk': `P#${sub}`, ':prefix': 'PLAYER#' },
  }));

  for (const player of players.Items ?? []) {
    const pid = (player['sk'] as string).replace('PLAYER#', '');

    const clubs = await ddb.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
      ExpressionAttributeValues: { ':pk': `PL#${pid}`, ':prefix': 'CLUB#' },
    }));

    const deletes: Array<{ Delete: { TableName: string; Key: Record<string, string> } }> = [
      { Delete: { TableName: TABLE, Key: { pk: `P#${sub}`, sk: `PLAYER#${pid}` } } },
      { Delete: { TableName: TABLE, Key: { pk: `PL#${pid}`, sk: 'PROGRESS' } } },
    ];

    for (const club of clubs.Items ?? []) {
      const cid = (club['sk'] as string).replace('CLUB#', '');
      deletes.push({ Delete: { TableName: TABLE, Key: { pk: `C#${cid}`, sk: `M#${pid}` } } });
      deletes.push({ Delete: { TableName: TABLE, Key: { pk: `PL#${pid}`, sk: `CLUB#${cid}` } } });
    }

    for (let i = 0; i < deletes.length; i += 25) {
      const batch = deletes.slice(i, i + 25);
      if (batch.length) await ddb.send(new TransactWriteCommand({ TransactItems: batch }));
    }
  }

  // Delete clubs owned by this parent
  const ownedClubs = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'gsi1',
    KeyConditionExpression: 'gsi1pk = :pk',
    ExpressionAttributeValues: { ':pk': `OWNER#${sub}` },
  }));

  for (const club of ownedClubs.Items ?? []) {
    const cid = (club['gsi1sk'] as string).replace('C#', '');
    // Delete club META and INV record
    const deletes: object[] = [
      { Delete: { TableName: TABLE, Key: { pk: `C#${cid}`, sk: 'META' } } },
    ];
    if (club['inviteCode']) {
      deletes.push({ Delete: { TableName: TABLE, Key: { pk: `INV#${club['inviteCode']}`, sk: 'INV' } } });
    }
    if (deletes.length) await ddb.send(new TransactWriteCommand({ TransactItems: deletes }));
  }

  // Delete parent profile
  const profileDeletes: object[] = [
    { Delete: { TableName: TABLE, Key: { pk: `P#${sub}`, sk: 'PROFILE' } } },
  ];
  await ddb.send(new TransactWriteCommand({ TransactItems: profileDeletes })).catch(() => { /* ok if missing */ });

  // Delete Cognito user
  await cognito.send(new AdminDeleteUserCommand({
    UserPoolId: process.env.USER_POOL_ID!,
    Username: sub,
  }));

  return ok({ ok: true });
};
