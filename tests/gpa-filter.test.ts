import { describe, it, expect } from 'vitest';
import { isReachableByGpa, gpaCutoffs } from '@/data/gpa-cutoffs';
import { universities } from '@/data/universities';
import { theses } from '@/data/theses';
import { buildUserVector, rankReachableUniversities } from '@/lib/scoring';
import type { Answer, AnswerValue } from '@/lib/types';

function answerAll(value: AnswerValue): Answer[] {
  return theses.map(t => ({ thesisId: t.id, value }));
}

describe('isReachableByGpa', () => {
  it('no cutoff data → always reachable', () => {
    expect(isReachableByGpa('some-uni-without-data', 5.0)).toBe(true);
    expect(isReachableByGpa('some-uni-without-data', 9.9)).toBe(true);
  });

  it('user far below cutoff → not reachable', () => {
    // Berkeley cutoff is 9.43
    expect(isReachableByGpa('uc-berkeley', 8.0)).toBe(false);
    expect(isReachableByGpa('uc-berkeley', 9.0)).toBe(false);
  });

  it('user at or above cutoff → reachable', () => {
    expect(isReachableByGpa('uc-berkeley', 9.43)).toBe(true);
    expect(isReachableByGpa('uc-berkeley', 9.5)).toBe(true);
    expect(isReachableByGpa('uc-berkeley', 10.0)).toBe(true);
  });

  it('user within 0.2 tolerance of cutoff → reachable', () => {
    // Berkeley cutoff 9.43, with 0.2 tolerance → 9.23 is OK
    expect(isReachableByGpa('uc-berkeley', 9.23)).toBe(true);
    expect(isReachableByGpa('uc-berkeley', 9.22)).toBe(false);
  });
});

describe('rankReachableUniversities: low GPA user', () => {
  it('user at 6.0 does not see top-tier unis', () => {
    const user = buildUserVector(answerAll(2), theses);
    const ranked = rankReachableUniversities(user, universities, 6.0);
    const ids = ranked.map(r => r.university.id);
    // Top-tier: Berkeley, CBS, UNSW, Stellenbosch, Sydney, IE Madrid — filtered out
    expect(ids).not.toContain('uc-berkeley');
    expect(ids).not.toContain('copenhagen-bs');
    expect(ids).not.toContain('unsw');
    expect(ids).not.toContain('stellenbosch');
    expect(ids).not.toContain('sydney-uni');
    expect(ids).not.toContain('ie-madrid');
  });

  it('user at 6.0 can still see low-cutoff unis', () => {
    const user = buildUserVector(answerAll(0), theses);
    const ranked = rankReachableUniversities(user, universities, 6.0);
    const ids = ranked.map(r => r.university.id);
    // Low-cutoff: Innsbruck (5.86), LMU (5.0), Sabanci (4.93), UBA (5.5), HEM (5.21)
    expect(ids).toContain('innsbruck');
    expect(ids).toContain('hem');
    expect(ids).toContain('uba');
  });
});

describe('rankReachableUniversities: high GPA user', () => {
  it('user at 9.5 sees everything including Berkeley', () => {
    const user = buildUserVector(answerAll(0), theses);
    const ranked = rankReachableUniversities(user, universities, 9.5);
    const ids = ranked.map(r => r.university.id);
    expect(ids).toContain('uc-berkeley');
    expect(ids).toContain('copenhagen-bs');
    expect(ids).toContain('unsw');
  });

  it('user at 9.5 with ~all neutral answers: all ~100 unis remain reachable', () => {
    const user = buildUserVector(answerAll(0), theses);
    const ranked = rankReachableUniversities(user, universities, 9.5);
    expect(ranked.length).toBe(universities.length);
  });
});

describe('rankReachableUniversities: medium GPA (7.5)', () => {
  it('user at 7.5 cannot reach Berkeley or CBS but can reach Bocconi', () => {
    const user = buildUserVector(answerAll(2), theses);
    const ranked = rankReachableUniversities(user, universities, 7.5);
    const ids = ranked.map(r => r.university.id);
    expect(ids).not.toContain('uc-berkeley');
    expect(ids).not.toContain('copenhagen-bs');
    expect(ids).not.toContain('sydney-uni');
    // Bocconi cutoff is 7.5 — exactly at threshold, reachable
    expect(ids).toContain('bocconi');
    // Pompeu Fabra cutoff is 7.86 — 7.5 within tolerance? 7.5 >= 7.86-0.2=7.66 → false
    expect(ids).not.toContain('pompeu-fabra');
  });
});

describe('cutoff data integrity', () => {
  it('every cutoff id corresponds to an actual university', () => {
    const uniIds = new Set(universities.map(u => u.id));
    for (const id of Object.keys(gpaCutoffs)) {
      expect(uniIds).toContain(id);
    }
  });

  it('cutoffs are in reasonable GPA range', () => {
    for (const cutoff of Object.values(gpaCutoffs)) {
      expect(cutoff).toBeGreaterThanOrEqual(4.0);
      expect(cutoff).toBeLessThanOrEqual(10.0);
    }
  });
});
