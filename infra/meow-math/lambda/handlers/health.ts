import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import { ok } from '../shared/response';

export const health = async (): Promise<APIGatewayProxyResultV2> => ok({ ok: true });
