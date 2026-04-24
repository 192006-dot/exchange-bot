import {
  DIMENSIONS,
  type Answer,
  type Dimension,
  type MatchResult,
  type Thesis,
  type University,
} from './types';

export type UserVector = Record<Dimension, number>;

function zeroVector(): UserVector {
  return {
    academic: 0, cost: 0, english: 0, language: 0, climate: 0, city: 0,
    nature: 0, travel: 0, career: 0, adventure: 0, social: 0, easy: 0,
  };
}

export function buildUserVector(answers: Answer[], theses: Thesis[]): UserVector {
  const vec = zeroVector();
  for (const answer of answers) {
    const thesis = theses.find(t => t.id === answer.thesisId);
    if (!thesis) continue;
    for (const dim of DIMENSIONS) {
      const weight = thesis.vector[dim];
      if (weight === undefined) continue;
      vec[dim] += weight * answer.value;
    }
  }
  return vec;
}

export function matchPercent(user: UserVector, uni: University): number {
  let rawMatch = 0;
  let maxPossible = 0;
  for (const dim of DIMENSIONS) {
    const u = user[dim];
    const a = uni.scores[dim] - 3;
    rawMatch += u * a;
    maxPossible += Math.abs(u) * 2;
  }
  if (maxPossible === 0) return 50;
  return ((rawMatch + maxPossible) / (2 * maxPossible)) * 100;
}

export function topReasons(user: UserVector, uni: University, limit = 3): Dimension[] {
  return DIMENSIONS
    .map(dim => ({ dim, contribution: user[dim] * (uni.scores[dim] - 3) }))
    .filter(r => r.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, limit)
    .map(r => r.dim);
}

export function rankUniversities(user: UserVector, universities: University[]): MatchResult[] {
  return universities
    .map(u => ({
      university: u,
      percent: matchPercent(user, u),
      topReasons: topReasons(user, u),
    }))
    .sort((a, b) => b.percent - a.percent);
}
