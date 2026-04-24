import { describe, it, expect } from 'vitest';
import { buildUserVector, matchPercent, rankUniversities, topReasons } from '@/lib/scoring';
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
    expect(matchPercent(zeroVec, sampleUni)).toBe(50);
  });

  it('returns high score for aligned preferences', () => {
    const alignedVec = {
      academic: 2, cost: 0, english: 2, language: 2, climate: 2, city: 2,
      nature: 2, travel: 2, career: 2, adventure: -2, social: 2, easy: 2,
    };
    const p = matchPercent(alignedVec, sampleUni);
    expect(p).toBeGreaterThan(80);
  });

  it('returns low score for opposite preferences', () => {
    const oppositeVec = {
      academic: -2, cost: 0, english: -2, language: -2, climate: -2, city: -2,
      nature: -2, travel: -2, career: -2, adventure: 2, social: -2, easy: -2,
    };
    const p = matchPercent(oppositeVec, sampleUni);
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
    const user = buildUserVector([{ thesisId: 't2', value: 2 }], sampleTheses);
    const reasons = topReasons(user, sampleUni);
    expect(reasons).toContain('climate');
  });
});
