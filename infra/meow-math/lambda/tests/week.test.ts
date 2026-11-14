import { describe, it, expect } from 'vitest';
import { getWeekId } from '../shared/week';

describe('getWeekId', () => {
  it('returns the Monday of the current week (America/Denver)', () => {
    // 2026-11-14 is a Saturday; Monday of that week is 2026-11-09
    const sat = new Date('2026-11-14T15:00:00Z'); // 08:00 MST
    expect(getWeekId(sat)).toBe('2026-11-09');
  });

  it('returns the same Monday for every day in a week', () => {
    const days = [
      '2026-11-09T12:00:00Z', // Mon
      '2026-11-10T12:00:00Z', // Tue
      '2026-11-11T12:00:00Z', // Wed
      '2026-11-12T12:00:00Z', // Thu
      '2026-11-13T12:00:00Z', // Fri
      '2026-11-14T12:00:00Z', // Sat
      '2026-11-15T12:00:00Z', // Sun
    ];
    const weeks = days.map(d => getWeekId(new Date(d)));
    expect(new Set(weeks).size).toBe(1);
    expect(weeks[0]).toBe('2026-11-09');
  });

  it('advances on the following Monday (Denver midnight)', () => {
    // Monday 2026-11-16 00:00 MST = 07:00 UTC
    const nextMon = new Date('2026-11-16T07:01:00Z');
    expect(getWeekId(nextMon)).toBe('2026-11-16');
  });

  it('handles Sunday correctly (previous Monday)', () => {
    const sun = new Date('2026-11-15T20:00:00Z'); // Sunday evening Denver
    expect(getWeekId(sun)).toBe('2026-11-09');
  });
});
