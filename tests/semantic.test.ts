/**
 * Semantic validation tests (deterministic subset of scripts/semantic-audit.ts).
 *
 * Asserts that for each deterministic persona:
 *   - No HARD expectation is violated (unless the run is a "fallback" —
 *     combined user constraints infeasible for the GPA — in which case
 *     the system's graceful fallback is correct and expected).
 *   - The top uni makes semantic sense given the user's agreed theses.
 *
 * The full 1000-run audit lives in scripts/semantic-audit.ts and is run
 * as part of the deploy verification, not in CI (too slow for vitest).
 */
import { describe, it, expect } from 'vitest';
import { theses } from '@/data/theses';
import { universities } from '@/data/universities';
import {
  applyHardFilters,
  buildUserVector,
  filterByExcludedCountries,
  rankWithFilters,
} from '@/lib/scoring';
import { isReachableByGpa } from '@/data/gpa-cutoffs';
import type { Answer, AnswerValue, University } from '@/lib/types';

// ---------- Rubric (mirror of scripts/semantic-audit.ts) ----------

type HardRule = {
  thesisId: string;
  pred: string;
  test: (u: University) => boolean;
};

const HARD_RULES: HardRule[] = [
  { thesisId: 't1', pred: 'avg_summer_temp_c >= 22',
    test: u => u.avg_summer_temp_c >= 22 },
  { thesisId: 't2', pred: 'min(km_to_coast, km_to_mountains) <= 30',
    test: u => Math.min(u.km_to_coast, u.km_to_mountains) <= 30 },
  { thesisId: 't3', pred: "city_size_tier in ['big','mega']",
    test: u => u.city_size_tier === 'big' || u.city_size_tier === 'mega' },
  { thesisId: 't8', pred: "language_of_instruction in ['english','mixed']",
    test: u => u.language_of_instruction === 'english'
      || u.language_of_instruction === 'mixed' },
  { thesisId: 't11', pred: 'eu === true',
    test: u => u.eu === true },
  { thesisId: 't13', pred: 'flight_hours_from_de <= 10',
    test: u => u.flight_hours_from_de <= 10 },
  { thesisId: 't15', pred: "city_size_tier in ['small','medium']",
    test: u => u.city_size_tier === 'small' || u.city_size_tier === 'medium' },
];

// ---------- Helpers ----------

const GPA_ROTATION = [7.0, 8.0, 9.0, 9.5];

function neutralAnswers(): Answer[] {
  return theses.map(t => ({ thesisId: t.id, value: 0 as AnswerValue }));
}

function setAnswer(base: Answer[], id: string, value: AnswerValue): Answer[] {
  return base.map(a => (a.thesisId === id ? { ...a, value } : a));
}

function isFallback(answers: Answer[], gpa: number): boolean {
  const gpaFiltered = universities.filter(u => isReachableByGpa(u.id, gpa));
  const excluded = filterByExcludedCountries(gpaFiltered, []);
  return applyHardFilters(excluded, answers).length === 0;
}

function topFor(answers: Answer[], gpa: number): University | null {
  const user = buildUserVector(answers, theses);
  const ranked = rankWithFilters(user, universities, gpa, [], answers);
  return ranked[0]?.university ?? null;
}

function assertHardExpectations(answers: Answer[], gpa: number, label: string) {
  const top = topFor(answers, gpa);
  expect(top, `${label}: no top uni returned`).not.toBeNull();
  const fallback = isFallback(answers, gpa);
  if (fallback) return; // system correctly fell back; HARD waived.
  for (const rule of HARD_RULES) {
    const a = answers.find(x => x.thesisId === rule.thesisId);
    if (!a || a.value < 1) continue;
    expect(
      rule.test(top!),
      `${label}: thesis ${rule.thesisId} agreed — top ${top!.id} fails HARD ${rule.pred}`,
    ).toBe(true);
  }
}

// ---------- Generators ----------

const HARD_FILTER_IDS = ['t1', 't2', 't3', 't11', 't13', 't15'];
const SOFT_IDS = [
  't4', 't5', 't6', 't7', 't8', 't9', 't10', 't12', 't14',
  't16', 't17', 't18', 't19', 't20',
];

// ---------- Tests ----------

describe('semantic: each hard-filter thesis alone at value 2', () => {
  for (let i = 0; i < HARD_FILTER_IDS.length; i++) {
    const tid = HARD_FILTER_IDS[i]!;
    it(`${tid}=2 → top-1 satisfies HARD expectation`, () => {
      const answers = setAnswer(neutralAnswers(), tid, 2);
      const gpa = GPA_ROTATION[i % GPA_ROTATION.length]!;
      assertHardExpectations(answers, gpa, `single-hard:${tid}`);
    });
  }
});

describe('semantic: each soft thesis alone at value 2', () => {
  for (let i = 0; i < SOFT_IDS.length; i++) {
    const tid = SOFT_IDS[i]!;
    it(`${tid}=2 → top-1 exists (soft-only)`, () => {
      const answers = setAnswer(neutralAnswers(), tid, 2);
      const gpa = GPA_ROTATION[i % GPA_ROTATION.length]!;
      const top = topFor(answers, gpa);
      expect(top, `soft-single:${tid} should return a top uni`).not.toBeNull();
    });
  }
});

describe('semantic: every pair of hard-filter theses at value 2', () => {
  let idx = 0;
  for (let a = 0; a < HARD_FILTER_IDS.length; a++) {
    for (let b = a + 1; b < HARD_FILTER_IDS.length; b++) {
      const ta = HARD_FILTER_IDS[a]!;
      const tb = HARD_FILTER_IDS[b]!;
      const gpa = GPA_ROTATION[idx % GPA_ROTATION.length]!;
      idx++;
      it(`${ta}+${tb} both =2 → either fallback or all HARD satisfied`, () => {
        const answers = setAnswer(
          setAnswer(neutralAnswers(), ta, 2),
          tb,
          2,
        );
        assertHardExpectations(answers, gpa, `pair:${ta}+${tb}`);
      });
    }
  }
});

// ---------- 15 hand-written personas ----------

type Persona = {
  name: string;
  answers: Record<string, AnswerValue>;
  gpa?: number;
};

const PERSONAS: Persona[] = [
  { name: 'maastricht-lover',
    answers: { t11: 2, t13: 2, t15: 2, t19: 2, t10: -2, t20: -1 } },
  { name: 'asia-adventurer',
    answers: { t3: 2, t10: 2, t14: 1, t20: 2, t16: 1, t13: -2 } },
  { name: 'career-london',
    answers: { t3: 2, t6: 2, t8: 2, t18: 2, t5: 1, t11: 1 } },
  { name: 'budget-portugal',
    answers: { t1: 2, t4: 2, t5: -2, t7: 2, t11: 2, t13: 2 } },
  { name: 'tokyo-foodie',
    answers: { t3: 2, t9: 2, t10: 2, t20: 1, t11: -2, t13: -2 } },
  { name: 'nordic-minimalist',
    answers: { t11: 2, t13: 2, t15: 2, t16: 1, t17: 1, t19: 1, t10: -2 } },
  { name: 'berkeley-techie',
    answers: { t5: 2, t6: 2, t8: 2, t18: 2, t11: -2, t13: -2 } },
  { name: 'sydney-surfer',
    answers: { t1: 2, t2: 2, t8: 2, t16: 2, t20: 2, t11: -2, t13: -2 } },
  { name: 'paris-culture',
    answers: { t3: 2, t11: 2, t13: 2, t19: 2, t14: -1, t17: 1 } },
  { name: 'party-barcelona',
    answers: { t1: 2, t3: 2, t11: 2, t14: 2, t17: 2, t19: -1 } },
  { name: 'mountain-student',
    answers: { t2: 2, t15: 2, t16: 2, t11: 2, t13: 2, t3: -2 } },
  { name: 'english-only-budget',
    answers: { t4: 2, t8: 2, t11: 2, t13: 2, t9: -2, t5: -1 } },
  { name: 'asia-language-learner',
    answers: { t9: 2, t10: 2, t3: 1, t20: 2, t13: -2, t8: -2 } },
  { name: 'us-career-mega',
    answers: { t3: 2, t5: 2, t6: 2, t14: 1, t18: 2, t11: -2, t13: -2 } },
  { name: 'latin-chaos',
    answers: { t1: 2, t9: 2, t10: 2, t16: 1, t20: 2, t11: -2, t13: -2 } },
];

describe('semantic: hand-written personas', () => {
  for (let i = 0; i < PERSONAS.length; i++) {
    const p = PERSONAS[i]!;
    const gpa = p.gpa ?? GPA_ROTATION[i % GPA_ROTATION.length]!;
    it(`${p.name} → no HARD violations on top-1`, () => {
      const answers: Answer[] = theses.map(t => ({
        thesisId: t.id,
        value: (p.answers[t.id] ?? 0) as AnswerValue,
      }));
      assertHardExpectations(answers, gpa, p.name);
    });
  }
});
