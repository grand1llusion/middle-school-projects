import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { health } from './handlers/health';
import { createPlayer, listPlayers, deletePlayer } from './handlers/players';
import { getProgress, putProgress } from './handlers/progress';
import { createClub, joinClub, removeMember, listPlayerClubs, getLeaderboard } from './handlers/clubs';
import { deleteAccount } from './handlers/account';
import { err } from './shared/response';

type Handler = (event: APIGatewayProxyEventV2WithJWTAuthorizer) => Promise<APIGatewayProxyResultV2>;

const routes: Record<string, Handler> = {
  'GET /v1/health':                                     health,
  'POST /v1/players':                                   createPlayer,
  'GET /v1/players':                                    listPlayers,
  'DELETE /v1/players/{playerId}':                      deletePlayer,
  'GET /v1/players/{playerId}/progress':                getProgress,
  'PUT /v1/players/{playerId}/progress':                putProgress,
  'GET /v1/players/{playerId}/clubs':                   listPlayerClubs,
  'POST /v1/clubs':                                     createClub,
  'POST /v1/clubs/join':                                joinClub,
  'DELETE /v1/clubs/{clubId}/members/{playerId}':       removeMember,
  'GET /v1/clubs/{clubId}/leaderboard':                 getLeaderboard,
  'DELETE /v1/account':                                 deleteAccount,
};

export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  const h = routes[event.routeKey];
  if (!h) return err(404, 'not_found');
  try {
    return await h(event);
  } catch (e) {
    console.error('unhandled error', e);
    return err(500, 'internal_error');
  }
};
