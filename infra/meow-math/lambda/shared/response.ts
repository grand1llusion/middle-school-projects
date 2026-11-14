import type { APIGatewayProxyResultV2 } from 'aws-lambda';

const json = (statusCode: number, body: unknown): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

export const ok = (body: unknown): APIGatewayProxyResultV2 => json(200, body);
export const created = (body: unknown): APIGatewayProxyResultV2 => json(201, body);
export const err = (statusCode: number, code: string): APIGatewayProxyResultV2 =>
  json(statusCode, { error: code });
