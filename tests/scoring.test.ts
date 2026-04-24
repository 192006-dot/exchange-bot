import { describe, it, expect } from 'vitest';
import {
  buildUserVector,
  matchPercent,
  rankUniversities,
  topReasons,
  computeDimMeans,
  computeMaxShifts,
} from '@/lib/scoring';
import type { Thesis, Answer, University } from '@/lib/types';

const sampleTheses: Thesis[] = [
  { id: 't1', text: 'Europa bleiben', vector: { easy: 2, adventure: -2, climate: -1 } },
  { id: 't2', text: 'Warmes Klima', vector: { climate: 2, nature: 1 } },
];

const sampleUni: University = {
  id: 'barca',
  name: 'Pompeu Fabra',
  city: 'Barcelona',
  country: 'Spain',
  flag: '🇪🇸',
  continent: 'europe',
  language_of_instruction: 'english',
  partner_levels: ['BSc'],
  scores: {
    academic: 5, cost: 3, english: 4, language: 4, climate: 5,
    city: 5, nature: 4, travel: 5, career: 4, adventure: 2, social: 5, easy: 4,
  },
  highlights: ['Strand', 'Party', 'BSc-stark'],
};

// Helper — compute means/shifts from a single-uni pool for deterministic tests
function meanSetup(unis: University[]) {
  const dimMeans = computeDimMeans(unis);
  const maxShifts = computeMaxShifts(dimMeans);
  return { dimMeans, maxShifts };
}

describe('buildUserVector', () => {
  it('accumulates thesis vectors scaled by answer value', () => {
    const answers: Answer[] = [
      { thesisId: 't1', value: 2 },
      { thesisId: 't2', value: -1 },
    ];
    const vec = buildUserVector(answers, sampleTheses);
    expect(vec.easy).toBe(4);
    expect(vec.adventure).toBe(-4);
    expect(vec.climate).toBe(-4);
    expect(vec.nature).toBe(-1);
    expect(vec.academic).toBe(0);
  });

  it('returns all-zero vector for empty answers', () => {
    const vec = buildUserVector([], sampleTheses);
    expect(vec.academic).toBe(0);
    expect(vec.easy).toBe(0);
  });
});

describe('matchPercent', () => {
  it('returns 50% when user vector is all zero', () => {
    const zeroVec = {
      academic: 0, cost: 0, english: 0, language: 0, climate: 0, city: 0,
      nature: 0, travel: 0, career: 0, adventure: 0, social: 0, easy: 0,
    };
    const { dimMeans, maxShifts } = meanSetup([sampleUni]);
    expect(matchPercent(zeroVec, sampleUni, dimMeans, maxShifts)).toBe(50);
  });

  it('returns ~100% for a uni at extreme end of every dim', () => {
    // Uni at all-5 vs uni at all-1 → mean = 3 → extreme uni hits maxShift on every dim
    const maxUni: University = {
      ...sampleUni,
      id: 'max',
      scores: {
        academic: 5, cost: 5, english: 5, language: 5, climate: 5, city: 5,
        nature: 5, travel: 5, career: 5, adventure: 5, social: 5, easy: 5,
      },
    };
    const minUni: University = {
      ...sampleUni,
      id: 'min',
      scores: {
        academic: 1, cost: 1, english: 1, language: 1, climate: 1, city: 1,
        nature: 1, travel: 1, career: 1, adventure: 1, social: 1, easy: 1,
      },
    };
    const { dimMeans, maxShifts } = meanSetup([maxUni, minUni]);
    const alignedVec = {
      academic: 5, cost: 5, english: 5, language: 5, climate: 5, city: 5,
      nature: 5, travel: 5, career: 5, adventure: 5, social: 5, easy: 5,
    };
    expect(matchPercent(alignedVec, maxUni, dimMeans, maxShifts)).toBe(100);
  });

  it('returns low score when user opposes sampleUni profile', () => {
    const otherUni: University = {
      ...sampleUni,
      id: 'other',
      scores: {
        academic: 1, cost: 5, english: 1, language: 1, climate: 1, city: 1,
        nature: 1, travel: 1, career: 1, adventure: 5, social: 1, easy: 1,
      },
    };
    const { dimMeans, maxShifts } = meanSetup([sampleUni, otherUni]);
    const oppositeVec = {
      academic: -5, cost: 0, english: -5, language: -5, climate: -5, city: -5,
      nature: -5, travel: -5, career: -5, adventure: 5, social: -5, easy: -5,
    };
    const p = matchPercent(oppositeVec, sampleUni, dimMeans, maxShifts);
    expect(p).toBeLessThan(20);
  });
});

describe('rankUniversities', () => {
  it('sorts universities by match descending', () => {
    const uniA = { ...sampleUni, id: 'a', scores: { ...sampleUni.scores, climate: 5 as const } };
    const uniB = { ...sampleUni, id: 'b', scores: { ...sampleUni.scores, climate: 1 as const } };
    const user = buildUserVector([{ thesisId: 't2', value: 2 }], sampleTheses);
    const ranked = rankUniversities(user, [uniA, uniB]);
    expect(ranked[0].university.id).toBe('a');
    expect(ranked[0].percent).toBeGreaterThan(ranked[1].percent);
  });

  it('identifies top reasons (dimensions with highest positive contribution)', () => {
    const uniHi = { ...sampleUni, id: 'hi', scores: { ...sampleUni.scores, climate: 5 as const } };
    const uniLo = { ...sampleUni, id: 'lo', scores: { ...sampleUni.scores, climate: 1 as const } };
    const user = buildUserVector([{ thesisId: 't2', value: 2 }], sampleTheses);
    const { dimMeans } = meanSetup([uniHi, uniLo]);
    const reasons = topReasons(user, uniHi, dimMeans);
    expect(reasons).toContain('climate');
  });
});
