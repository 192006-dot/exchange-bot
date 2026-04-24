import {
  DIMENSIONS,
  type Answer,
  type Dimension,
  type MatchResult,
  type Thesis,
  type University,
} from './types';
import { isReachableByGpa } from '@/data/gpa-cutoffs';

export type UserVector = Record<Dimension, number>;

function zeroVector(): UserVector {
  return {
    academic: 0, cost: 0, english: 0, language: 0, climate: 0, city: 0,
    nature: 0, travel: 0, career: 0, adventure: 0, social: 0, easy: 0,
  };
}

/**
 * Compute empirical mean per dimension across a set of universities.
 * Used to center the scoring so that "average" unis score ~neutral instead
 * of artificially positive due to rubric inflation.
 */
export function computeDimMeans(universities: University[]): Record<Dimension, number> {
  const sums = zeroVector();
  for (const uni of universities) {
    for (const dim of DIMENSIONS) sums[dim] += uni.scores[dim];
  }
  const means = zeroVector();
  for (const dim of DIMENSIONS) means[dim] = sums[dim] / universities.length;
  return means;
}

/**
 * Max shift per dimension from mean to either extreme (1 or 5).
 * Used as denominator for normalization.
 */
export function computeMaxShifts(dimMeans: Record<Dimension, number>): Record<Dimension, number> {
  const shifts = zeroVector();
  for (const dim of DIMENSIONS) {
    shifts[dim] = Math.max(Math.abs(5 - dimMeans[dim]), Math.abs(1 - dimMeans[dim]));
  }
  return shifts;
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

/**
 * Match percent using empirical dimension means for centering.
 * Uni at exactly the mean contributes 0; only deviations from the population
 * mean move the score.
 */
export function matchPercent(
  user: UserVector,
  uni: University,
  dimMeans: Record<Dimension, number>,
  maxShifts: Record<Dimension, number>,
): number {
  let rawMatch = 0;
  let maxPossible = 0;
  for (const dim of DIMENSIONS) {
    const u = user[dim];
    const a = uni.scores[dim] - dimMeans[dim];
    rawMatch += u * a;
    maxPossible += Math.abs(u) * maxShifts[dim];
  }
  if (maxPossible === 0) return 50;
  return ((rawMatch + maxPossible) / (2 * maxPossible)) * 100;
}

/**
 * Top reasons: prefer dimensions where user preference × uni deviation is positive.
 * Fallback: if fewer than `limit` positive contributions exist (e.g. neutral user),
 * fill remaining slots with the uni's highest-scoring absolute dimensions.
 */
export function topReasons(
  user: UserVector,
  uni: University,
  dimMeans: Record<Dimension, number>,
  limit = 3,
): Dimension[] {
  const positive = DIMENSIONS
    .map(dim => ({ dim, contribution: user[dim] * (uni.scores[dim] - dimMeans[dim]) }))
    .filter(r => r.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, limit)
    .map(r => r.dim);

  if (positive.length >= limit) return positive;

  // Fallback: for each missing slot, take the uni's strongest dims not yet included
  const fallback = DIMENSIONS
    .filter(dim => !positive.includes(dim))
    .map(dim => ({ dim, score: uni.scores[dim] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit - positive.length)
    .map(r => r.dim);

  return [...positive, ...fallback];
}

export function rankUniversities(user: UserVector, universities: University[]): MatchResult[] {
  const dimMeans = computeDimMeans(universities);
  const maxShifts = computeMaxShifts(dimMeans);
  return universities
    .map(u => ({
      university: u,
      percent: matchPercent(user, u, dimMeans, maxShifts),
      topReasons: topReasons(user, u, dimMeans),
    }))
    .sort((a, b) => b.percent - a.percent);
}

/**
 * Rank + filter by user GPA. Unis below user's reachable threshold are dropped.
 */
export function rankReachableUniversities(
  user: UserVector,
  universities: University[],
  userGpa: number,
): MatchResult[] {
  const reachable = universities.filter(u => isReachableByGpa(u.id, userGpa));
  return rankUniversities(user, reachable);
}

/**
 * Filter out universities in countries the user has explicitly excluded.
 */
export function filterByExcludedCountries(
  unis: University[],
  excludedCountries: string[],
): University[] {
  if (excludedCountries.length === 0) return unis;
  const excludedSet = new Set(excludedCountries);
  return unis.filter(u => !excludedSet.has(u.country));
}

/**
 * Rank with both filters: GPA reachability + country exclusion.
 */
export function rankWithFilters(
  user: UserVector,
  universities: University[],
  userGpa: number,
  excludedCountries: string[],
): MatchResult[] {
  const gpaFiltered = universities.filter(u => isReachableByGpa(u.id, userGpa));
  const excluded = filterByExcludedCountries(gpaFiltered, excludedCountries);
  return rankUniversities(user, excluded);
}

/**
 * Total magnitude of the user's preference signal. Near-zero means the user
 * answered mostly neutral — recommendations will be weak / tied.
 */
export function userSignalStrength(user: UserVector): number {
  return DIMENSIONS.reduce((s, d) => s + Math.abs(user[d]), 0);
}
