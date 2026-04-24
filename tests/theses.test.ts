import { describe, it, expect } from 'vitest';
import { theses } from '@/data/theses';
import { DIMENSIONS } from '@/lib/types';

describe('theses data', () => {
  it('has exactly 13 theses', () => {
    expect(theses).toHaveLength(13);
  });

  it('has unique IDs', () => {
    const ids = theses.map(t => t.id);
    expect(new Set(ids).size).toBe(13);
  });

  it('every thesis has non-empty text', () => {
    for (const t of theses) expect(t.text.length).toBeGreaterThan(10);
  });

  it('every thesis vector has at least one dimension', () => {
    for (const t of theses) {
      expect(Object.keys(t.vector).length).toBeGreaterThan(0);
    }
  });

  it('every dimension is touched by at least one thesis', () => {
    const touched = new Set<string>();
    for (const t of theses) for (const d of Object.keys(t.vector)) touched.add(d);
    for (const d of DIMENSIONS) expect(touched).toContain(d);
  });

  it('all vector weights are in range -2..+2', () => {
    for (const t of theses) {
      for (const w of Object.values(t.vector)) {
        expect(w).toBeGreaterThanOrEqual(-2);
        expect(w).toBeLessThanOrEqual(2);
      }
    }
  });
});
