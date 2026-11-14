import { describe, it, expect } from 'vitest';
import { merge, type ProgressDoc } from '../shared/merge';

const base = (): ProgressDoc => ({
  stars: 0, solved: 0, area: {}, catAreas: [], cats: [], got: 0,
  food: 0, treats: 0, water: 0, streak: 0, day: '',
});

describe('merge', () => {
  it('takes max of stars/solved/got', () => {
    const a = { ...base(), stars: 10, solved: 8, got: 2 };
    const b = { ...base(), stars: 7, solved: 12, got: 3 };
    const r = merge(a, b);
    expect(r.stars).toBe(10);
    expect(r.solved).toBe(12);
    expect(r.got).toBe(3);
  });

  it('merges area per key with max', () => {
    const a = { ...base(), area: { 'pv-add': 5, 'pv-sub': 2 } };
    const b = { ...base(), area: { 'pv-add': 3, 'pv-mul': 7 } };
    const r = merge(a, b);
    expect(r.area).toEqual({ 'pv-add': 5, 'pv-sub': 2, 'pv-mul': 7 });
  });

  it('unions catAreas', () => {
    const a = { ...base(), catAreas: ['pv-add', 'pv-sub'] };
    const b = { ...base(), catAreas: ['pv-add', 'pv-mul'] };
    const r = merge(a, b);
    expect(r.catAreas.sort()).toEqual(['pv-add', 'pv-mul', 'pv-sub']);
  });

  it('keeps longer cats list', () => {
    const a = { ...base(), cats: [{ name: 'Luna', coat: 0, wear: ['bow'] }] };
    const b = { ...base(), cats: [{ name: 'Luna', coat: 0, wear: ['bell'] }, { name: 'Mochi', coat: 1, wear: [] }] };
    const r = merge(a, b);
    expect(r.cats).toHaveLength(2);
    expect(r.cats[0].wear.sort()).toEqual(['bell', 'bow']);
    expect(r.cats[1].name).toBe('Mochi');
  });

  it('prefers non-empty name', () => {
    const a = { ...base(), cats: [{ name: '', coat: 0, wear: [] }] };
    const b = { ...base(), cats: [{ name: 'Pepper', coat: 0, wear: [] }] };
    expect(merge(a, b).cats[0].name).toBe('Pepper');
    expect(merge(b, a).cats[0].name).toBe('Pepper');
  });

  it('takes streak/day from later day', () => {
    const a = { ...base(), day: '2026-11-10', streak: 5 };
    const b = { ...base(), day: '2026-11-14', streak: 2 };
    const r = merge(a, b);
    expect(r.day).toBe('2026-11-14');
    expect(r.streak).toBe(2);
  });

  it('takes food/treats/water from later updatedAt', () => {
    const a = { ...base(), food: 1, treats: 3, water: 80, updatedAt: '2026-11-14T10:00:00Z' };
    const b = { ...base(), food: 0, treats: 1, water: 60, updatedAt: '2026-11-14T12:00:00Z' };
    const r = merge(a, b);
    expect(r.food).toBe(0);
    expect(r.treats).toBe(1);
    expect(r.water).toBe(60);
  });

  it('two diverged saves lose nothing', () => {
    // phone A earns 10 stars, phone B earns 8 different stars
    const a = { ...base(), stars: 10, solved: 10, area: { 'pv-add': 10 }, catAreas: ['pv-add'], cats: [{ name: 'Mochi', coat: 0, wear: [] }], got: 1, day: '2026-11-14' };
    const b = { ...base(), stars: 8, solved: 8, area: { 'pv-add': 8 }, got: 0, day: '2026-11-13' };
    const r = merge(a, b);
    expect(r.stars).toBe(10);
    expect(r.area['pv-add']).toBe(10);
    expect(r.catAreas).toContain('pv-add');
    expect(r.got).toBe(1);
  });
});
