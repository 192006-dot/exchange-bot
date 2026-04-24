import { describe, it, expect } from 'vitest';
import { universities } from '@/data/universities';
import { DIMENSIONS } from '@/lib/types';

describe('universities data', () => {
  it('has at least 20 universities (seed)', () => {
    expect(universities.length).toBeGreaterThanOrEqual(20);
  });

  it('has unique IDs', () => {
    const ids = universities.map(u => u.id);
    expect(new Set(ids).size).toBe(universities.length);
  });

  it('every university has all 12 scores in range 1..5', () => {
    for (const u of universities) {
      for (const dim of DIMENSIONS) {
        const s = u.scores[dim];
        expect(s).toBeGreaterThanOrEqual(1);
        expect(s).toBeLessThanOrEqual(5);
      }
    }
  });

  it('every university has at least 3 highlights', () => {
    for (const u of universities) expect(u.highlights.length).toBeGreaterThanOrEqual(3);
  });

  it('every university includes BSc in partner_levels', () => {
    for (const u of universities) expect(u.partner_levels).toContain('BSc');
  });

  it('covers multiple continents', () => {
    const continents = new Set(universities.map(u => u.continent));
    expect(continents.size).toBeGreaterThanOrEqual(4);
  });
});
