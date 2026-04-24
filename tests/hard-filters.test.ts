import { describe, it, expect } from 'vitest';
import {
  applyHardFilters,
  buildUserVector,
  rankWithFilters,
} from '@/lib/scoring';
import { universities } from '@/data/universities';
import { theses } from '@/data/theses';
import type { Answer } from '@/lib/types';

// Hard-filter mapping under test:
//   t1  agree → avg_summer_temp_c >= 22
//   t2  agree → min(km_to_coast, km_to_mountains) <= 30
//   t3  agree → city_size_tier in ['big','mega']
//   t11 agree → eu === true
//   t13 agree → flight_hours_from_de <= 10
//   t15 agree → city_size_tier in ['small','medium']

describe('applyHardFilters', () => {
  it('no answers → no filtering', () => {
    const filtered = applyHardFilters(universities, []);
    expect(filtered.length).toBe(universities.length);
  });

  it('neutral/disagree answers → no filtering', () => {
    const answers: Answer[] = [
      { thesisId: 't11', value: 0 },
      { thesisId: 't13', value: -1 },
    ];
    const filtered = applyHardFilters(universities, answers);
    expect(filtered.length).toBe(universities.length);
  });

  it('t11 agree → only EU unis remain', () => {
    const answers: Answer[] = [{ thesisId: 't11', value: 2 }];
    const filtered = applyHardFilters(universities, answers);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(u => u.eu)).toBe(true);
    // Hong Kong unis must be gone
    expect(filtered.find(u => u.id === 'hkust')).toBeUndefined();
    expect(filtered.find(u => u.id === 'hku')).toBeUndefined();
  });

  it('t13 agree → only unis with flight ≤10h remain', () => {
    const answers: Answer[] = [{ thesisId: 't13', value: 1 }];
    const filtered = applyHardFilters(universities, answers);
    expect(filtered.every(u => u.flight_hours_from_de <= 10)).toBe(true);
    // Sydney/Melbourne (~22h) must be gone
    expect(filtered.find(u => u.id === 'unsw')).toBeUndefined();
    expect(filtered.find(u => u.id === 'monash')).toBeUndefined();
  });

  it('t15 agree → only small/medium cities remain', () => {
    const answers: Answer[] = [{ thesisId: 't15', value: 2 }];
    const filtered = applyHardFilters(universities, answers);
    expect(
      filtered.every(
        u => u.city_size_tier === 'small' || u.city_size_tier === 'medium',
      ),
    ).toBe(true);
    // Barcelona/Paris/NYC/HK are not small-medium
    expect(filtered.find(u => u.id === 'pompeu-fabra')).toBeUndefined();
    expect(filtered.find(u => u.id === 'sciences-po')).toBeUndefined();
    expect(filtered.find(u => u.id === 'nyu-stern')).toBeUndefined();
  });

  it('t3 agree → only big/mega cities remain', () => {
    const answers: Answer[] = [{ thesisId: 't3', value: 2 }];
    const filtered = applyHardFilters(universities, answers);
    expect(
      filtered.every(
        u => u.city_size_tier === 'big' || u.city_size_tier === 'mega',
      ),
    ).toBe(true);
    // ESSEC (Cergy, 65k) must be gone
    expect(filtered.find(u => u.id === 'essec')).toBeUndefined();
  });

  it('t2 agree → only unis with coast or mountains within 30km', () => {
    const answers: Answer[] = [{ thesisId: 't2', value: 2 }];
    const filtered = applyHardFilters(universities, answers);
    expect(
      filtered.every(
        u => Math.min(u.km_to_coast, u.km_to_mountains) <= 30,
      ),
    ).toBe(true);
  });

  it('t1 agree → only warm-summer unis remain (≥22°C)', () => {
    const answers: Answer[] = [{ thesisId: 't1', value: 2 }];
    const filtered = applyHardFilters(universities, answers);
    expect(filtered.every(u => u.avg_summer_temp_c >= 22)).toBe(true);
    // Bergen (18°C) and Dublin (19°C) must be gone
    expect(filtered.find(u => u.id === 'nhh')).toBeUndefined();
    expect(filtered.find(u => u.id === 'trinity-dublin')).toBeUndefined();
  });

  it('combined t11+t13+t15 (user scenario): excludes HK, keeps small EU towns', () => {
    const answers: Answer[] = [
      { thesisId: 't11', value: 2 },
      { thesisId: 't13', value: 2 },
      { thesisId: 't15', value: 2 },
    ];
    const filtered = applyHardFilters(universities, answers);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(u => u.eu)).toBe(true);
    expect(filtered.every(u => u.flight_hours_from_de <= 10)).toBe(true);
    expect(
      filtered.every(
        u => u.city_size_tier === 'small' || u.city_size_tier === 'medium',
      ),
    ).toBe(true);
    // HK must be gone
    expect(filtered.find(u => u.country.includes('Hongkong'))).toBeUndefined();
    // Expect small European student towns (Lund, Uppsala, St. Gallen excluded
    // because non-EU, but Innsbruck, Leuven, Aarhus should be in)
    const keptIds = filtered.map(u => u.id);
    expect(keptIds).toContain('lund');
    expect(keptIds).toContain('uppsala');
    expect(keptIds).toContain('innsbruck');
  });
});

describe('rankWithFilters: integration with hard filters', () => {
  it('user scenario (EU+no-long-flight+small-city) → HK not in top results', () => {
    const answers: Answer[] = [
      { thesisId: 't11', value: 2 },
      { thesisId: 't13', value: 2 },
      { thesisId: 't15', value: 2 },
    ];
    const user = buildUserVector(answers, theses);
    const ranked = rankWithFilters(user, universities, 9.0, [], answers);
    const hkIds = ranked
      .filter(r => r.university.country.includes('Hongkong'))
      .map(r => r.university.id);
    expect(hkIds).toEqual([]);
    // All remaining should be EU
    expect(ranked.every(r => r.university.eu)).toBe(true);
  });

  it('falls back when hard filters collapse to empty set', () => {
    const answers: Answer[] = [
      { thesisId: 't3', value: 2 },  // big/mega
      { thesisId: 't15', value: 2 }, // small/medium
    ];
    // t3 + t15 are contradictory → empty hard-filter set → fallback to pre-hard
    const user = buildUserVector(answers, theses);
    const ranked = rankWithFilters(user, universities, 9.0, [], answers);
    expect(ranked.length).toBeGreaterThan(0);
  });

  it('without answers param → behaves like pre-hard-filter version', () => {
    const user = buildUserVector([], theses);
    const withoutAnswers = rankWithFilters(user, universities, 9.0, []);
    const withEmptyAnswers = rankWithFilters(user, universities, 9.0, [], []);
    expect(withoutAnswers.length).toBe(withEmptyAnswers.length);
  });
});
