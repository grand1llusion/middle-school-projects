import { randomBytes } from 'crypto';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const INVITE_ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 31 chars, no I/L/O/1/0

export const playerId = (): string =>
  Array.from(randomBytes(12)).map(b => BASE32[b % 32]).join('');

export const clubId = (): string =>
  Array.from(randomBytes(12)).map(b => BASE32[b % 32]).join('');

// Rejection sampling: 31 * 8 = 248; reject bytes ≥ 248 to avoid bias
export const inviteCode = (): string => {
  const result: string[] = [];
  while (result.length < 6) {
    const buf = randomBytes(10);
    for (const b of buf) {
      if (result.length < 6 && b < 248) result.push(INVITE_ALPHA[b % 31]);
    }
  }
  return result.join('');
};
