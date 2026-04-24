import { describe, it, expect } from 'vitest';
import { universities } from '@/data/universities';
import { theses } from '@/data/theses';
import {
  buildUserVector,
  filterByExcludedCountries,
  rankWithFilters,
} from '@/lib/scoring';
import type { AnswerValue } from '@/lib/types';

function zeroUser() {
  return buildUserVector(
    theses.map(t => ({ thesisId: t.id, value: 0 as AnswerValue })),
    theses,
  );
}

describe('filterByExcludedCountries', () => {
  it('empty list → returns all unis', () => {
    const filtered = filterByExcludedCountries(universities, []);
    expect(filtered.length).toBe(universities.length);
  });

  it('removes unis from excluded country (USA)', () => {
    const filtered = filterByExcludedCountries(universities, ['USA']);
    expect(filtered.every(u => u.country !== 'USA')).toBe(true);
    expect(filtered.length).toBeLessThan(universities.length);
  });

  it('removes unis from multiple excluded countries', () => {
    const filtered = filterByExcludedCountries(universities, ['USA', 'China', 'United Kingdom']);
    expect(filtered.every(u => u.country !== 'USA' && u.country !== 'China' && u.country !== 'United Kingdom')).toBe(true);
  });

  it('unknown country in exclusion list is ignored', () => {
    const filtered = filterByExcludedCountries(universities, ['Atlantis']);
    expect(filtered.length).toBe(universities.length);
  });
});

describe('rankWithFilters', () => {
  const user = zeroUser();

  it('GPA 9.5 + no exclusions → all 100 reachable', () => {
    const ranked = rankWithFilters(user, universities, 9.5, []);
    expect(ranked.length).toBe(universities.length);
  });

  it('GPA 9.5 + exclude USA → USA unis not in results', () => {
    const ranked = rankWithFilters(user, universities, 9.5, ['USA']);
    const ids = ranked.map(r => r.university.id);
    expect(ids).not.toContain('nyu-stern');
    expect(ids).not.toContain('uc-berkeley');
    expect(ids).not.toContain('michigan-ross');
  });

  it('GPA 6.0 + exclude Türkei → no Turkish unis', () => {
    const ranked = rankWithFilters(user, universities, 6.0, ['Türkei']);
    for (const r of ranked) {
      expect(r.university.country).not.toBe('Türkei');
    }
  });

  it('combined filter: low GPA + exclude major regions → very small set', () => {
    const ranked = rankWithFilters(user, universities, 6.0, [
      'USA', 'Kanada', 'Australien', 'China', 'Singapur', 'Südkorea',
    ]);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThan(50);
    for (const r of ranked) {
      expect(['USA', 'Kanada', 'Australien', 'China', 'Singapur', 'Südkorea']).not.toContain(r.university.country);
    }
  });
});
