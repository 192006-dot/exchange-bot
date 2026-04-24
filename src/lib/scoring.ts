import {
  DIMENSIONS,
  type Answer,
  type Dimension,
  type MatchResult,
  type Thesis,
  type University,
} from './types';
import { isReachableByGpa } from '@/data/gpa-cutoffs';

/**
 * Hard-filter mapping: specific theses encode categorical constraints (EU
 * membership, flight duration, city size, climate, outdoor proximity) that
 * cannot be faithfully represented in the 1-5 soft-dimension scoring. When
 * the user agrees (value >= 1), we apply these as hard set filters.
 *
 * Collapse behavior: if combined hard filters yield 0 unis (user gave
 * contradictory answers e.g. t3 + t15), the caller falls back to the
 * pre-hard-filter set so results are never empty due to filter over-reach.
 */
export function applyHardFilters(
  universities: University[],
  answers: Answer[],
): University[] {
  const valOf = (id: string) =>
    answers.find(a => a.thesisId === id)?.value ?? 0;
  const agrees = (id: string) => valOf(id) >= 1;

  let set = universities;
  if (agrees('t1')) set = set.filter(u => u.avg_summer_temp_c >= 22);
  if (agrees('t2')) set = set.filter(
    u => Math.min(u.km_to_coast, u.km_to_mountains) <= 30,
  );
  if (agrees('t3')) set = set.filter(
    u => u.city_size_tier === 'big' || u.city_size_tier === 'mega',
  );
  if (agrees('t11')) set = set.filter(u => u.eu);
  if (agrees('t13')) set = set.filter(u => u.flight_hours_from_de <= 10);
  if (agrees('t15')) set = set.filter(
    u => u.city_size_tier === 'small' || u.city_size_tier === 'medium',
  );
  return set;
}

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
 * Raw match percent using empirical dimension means for centering.
 * In practice caps at ~80% because theses overlap on opposing signs, so
 * no realistic user vector can simultaneously max out every dimension.
 */
function rawMatchPercent(
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
 * Empirically-observed realistic ceiling for a strongly-answering user.
 * Anchored from auditor's 500k-sample search: p99 ≈ 77%, global max ≈ 84%.
 * Using 80 as the "perfect match" anchor balances readability and honesty.
 */
const REALISTIC_MAX = 80;

/**
 * Display-facing percent. Stretches the realistic range [50, REALISTIC_MAX]
 * to [50, 100] so users see numbers that match their intuition about
 * "how strong is this match" while keeping the rank order and neutral
 * centerpoint (50%) untouched.
 */
export function matchPercent(
  user: UserVector,
  uni: University,
  dimMeans: Record<Dimension, number>,
  maxShifts: Record<Dimension, number>,
): number {
  const raw = rawMatchPercent(user, uni, dimMeans, maxShifts);
  if (raw === 50) return 50;
  if (raw > 50) {
    const stretched = 50 + ((raw - 50) * 50) / (REALISTIC_MAX - 50);
    return Math.min(100, stretched);
  }
  // Symmetric stretch below 50
  const stretched = 50 - ((50 - raw) * 50) / (REALISTIC_MAX - 50);
  return Math.max(0, stretched);
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
    .sort((a, b) => {
      if (b.percent !== a.percent) return b.percent - a.percent;
      // Stable tie-break: uni id alphabetical — prevents duplicate-score
      // clusters (e.g. HKUST/CUHK/HKU) from producing non-deterministic order
      return a.university.id.localeCompare(b.university.id);
    });
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
 * Rank with all filters: GPA reachability + country exclusion + answer-driven
 * hard filters (EU, flight duration, city size, climate, outdoor proximity).
 * Hard filters silently collapse to the pre-hard set if they would eliminate
 * everything.
 */
export function rankWithFilters(
  user: UserVector,
  universities: University[],
  userGpa: number,
  excludedCountries: string[],
  answers: Answer[] = [],
): MatchResult[] {
  const gpaFiltered = universities.filter(u => isReachableByGpa(u.id, userGpa));
  const excluded = filterByExcludedCountries(gpaFiltered, excludedCountries);
  const hard = applyHardFilters(excluded, answers);
  const finalSet = hard.length > 0 ? hard : excluded;
  return rankUniversities(user, finalSet);
}

/**
 * Total magnitude of the user's preference signal. Near-zero means the user
 * answered mostly neutral — recommendations will be weak / tied.
 */
export function userSignalStrength(user: UserVector): number {
  return DIMENSIONS.reduce((s, d) => s + Math.abs(user[d]), 0);
}
