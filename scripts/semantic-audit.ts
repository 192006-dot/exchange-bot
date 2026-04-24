/**
 * Semantic validation of the recommendation engine.
 *
 * Unlike tests/property.test.ts which verifies hard-filter invariants,
 * this audit verifies SEMANTIC match quality: when the user agrees with
 * thesis X, does the top-1 uni actually exhibit the properties X implies?
 *
 * Rubric (per-thesis expectations when user agrees value >= 1):
 *   HARD — must be satisfied (no soft tolerance)
 *   SOFT — should be satisfied; ≥70% pass-rate required for a run to PASS
 *
 * Generation strategy (≥1000 runs):
 *   - ~50 deterministic personas (singles, pairs, hand-written)
 *   - ~750 "random realistic" (5–12 theses answered, rest neutral)
 *   - ~200 "random extreme" (all 20 theses answered)
 *
 * Outputs:
 *   scripts/semantic-audit-results.json  (per-run detail)
 *   scripts/semantic-audit-report.md     (summary + failure clusters)
 *
 * Exit code: non-zero if any HARD violation occurred.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { universities } from '../src/data/universities';
import { theses } from '../src/data/theses';
import {
  applyHardFilters,
  buildUserVector,
  filterByExcludedCountries,
  rankWithFilters,
} from '../src/lib/scoring';
import { isReachableByGpa } from '../src/data/gpa-cutoffs';
import type {
  Answer,
  AnswerValue,
  University,
} from '../src/lib/types';

// ---------- Seeded PRNG (Mulberry32) ----------

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ALL_ANSWER_VALUES: AnswerValue[] = [-2, -1, 0, 1, 2];

function neutralAnswers(): Answer[] {
  return theses.map(t => ({ thesisId: t.id, value: 0 as AnswerValue }));
}

function setAnswer(
  base: Answer[],
  id: string,
  value: AnswerValue,
): Answer[] {
  return base.map(a => (a.thesisId === id ? { ...a, value } : a));
}

// ---------- Rubric ----------

type ExpectationKind = 'HARD' | 'SOFT';

type Expectation = {
  thesisId: string;
  kind: ExpectationKind;
  /** Short descriptor e.g. "avg_summer_temp_c >= 22" */
  pred: string;
  /** Predicate evaluated against the top uni */
  test: (u: University) => boolean;
  /** "agree" when user value >= 1, "disagree" when value <= -1 */
  polarity: 'agree' | 'disagree';
};

/**
 * Rubric lookup: what properties the top-1 uni should have when the user
 * takes a particular stance on a thesis.
 *
 * Sources:
 *   - HARD rules mirror src/lib/scoring.ts::applyHardFilters
 *   - SOFT rules come from the mission rubric; thresholds picked to be tight
 *     enough to expose score drift but loose enough that the dataset mean
 *     doesn't auto-fail every run.
 *   - DISAGREE rules are all SOFT: disagreement is a weaker signal than
 *     agreement (the scoring only hard-filters on agree).
 */
const AGREE_EXPECTATIONS: Record<
  string,
  Array<Omit<Expectation, 'polarity'>>
> = {
  t1: [
    { thesisId: 't1', kind: 'HARD', pred: 'avg_summer_temp_c >= 22',
      test: u => u.avg_summer_temp_c >= 22 },
    { thesisId: 't1', kind: 'SOFT', pred: 'scores.climate >= 4',
      test: u => u.scores.climate >= 4 },
  ],
  t2: [
    { thesisId: 't2', kind: 'HARD', pred: 'min(km_to_coast, km_to_mountains) <= 30',
      test: u => Math.min(u.km_to_coast, u.km_to_mountains) <= 30 },
    { thesisId: 't2', kind: 'SOFT', pred: 'scores.nature >= 4',
      test: u => u.scores.nature >= 4 },
  ],
  t3: [
    { thesisId: 't3', kind: 'HARD', pred: "city_size_tier in ['big','mega']",
      test: u => u.city_size_tier === 'big' || u.city_size_tier === 'mega' },
    { thesisId: 't3', kind: 'SOFT', pred: 'scores.city >= 4',
      test: u => u.scores.city >= 4 },
  ],
  t4: [
    { thesisId: 't4', kind: 'SOFT', pred: 'scores.cost >= 4',
      test: u => u.scores.cost >= 4 },
  ],
  t5: [
    { thesisId: 't5', kind: 'SOFT', pred: 'scores.academic >= 4',
      test: u => u.scores.academic >= 4 },
  ],
  t6: [
    { thesisId: 't6', kind: 'SOFT', pred: 'scores.academic >= 4 AND scores.career >= 4',
      test: u => u.scores.academic >= 4 && u.scores.career >= 4 },
  ],
  t7: [
    { thesisId: 't7', kind: 'SOFT', pred: 'scores.career <= 4 (tolerance)',
      test: u => u.scores.career <= 4 },
  ],
  t8: [
    { thesisId: 't8', kind: 'HARD', pred: "language_of_instruction in ['english','mixed']",
      test: u => u.language_of_instruction === 'english'
        || u.language_of_instruction === 'mixed' },
    { thesisId: 't8', kind: 'SOFT', pred: 'scores.english >= 4',
      test: u => u.scores.english >= 4 },
  ],
  t9: [
    // t9 user wants to learn a new language; a pure-English uni defeats that.
    // "mixed" still lets you learn it in daily life, so allow mixed.
    { thesisId: 't9', kind: 'SOFT',
      pred: "language_of_instruction != 'english' AND scores.language >= 3",
      test: u => u.language_of_instruction !== 'english' && u.scores.language >= 3 },
  ],
  t10: [
    { thesisId: 't10', kind: 'SOFT',
      pred: "continent != 'europe' AND scores.adventure >= 3",
      test: u => u.continent !== 'europe' && u.scores.adventure >= 3 },
  ],
  t11: [
    { thesisId: 't11', kind: 'HARD', pred: 'eu === true',
      test: u => u.eu === true },
  ],
  t12: [
    { thesisId: 't12', kind: 'SOFT', pred: 'scores.travel >= 4',
      test: u => u.scores.travel >= 4 },
  ],
  t13: [
    { thesisId: 't13', kind: 'HARD', pred: 'flight_hours_from_de <= 10',
      test: u => u.flight_hours_from_de <= 10 },
  ],
  t14: [
    { thesisId: 't14', kind: 'SOFT',
      pred: 'scores.social >= 4 AND scores.city >= 4',
      test: u => u.scores.social >= 4 && u.scores.city >= 4 },
  ],
  t15: [
    { thesisId: 't15', kind: 'HARD', pred: "city_size_tier in ['small','medium']",
      test: u => u.city_size_tier === 'small' || u.city_size_tier === 'medium' },
  ],
  t16: [
    { thesisId: 't16', kind: 'SOFT', pred: 'scores.nature >= 4',
      test: u => u.scores.nature >= 4 },
  ],
  t17: [
    { thesisId: 't17', kind: 'SOFT', pred: 'scores.social >= 4',
      test: u => u.scores.social >= 4 },
  ],
  t18: [
    { thesisId: 't18', kind: 'SOFT', pred: 'scores.career >= 4',
      test: u => u.scores.career >= 4 },
  ],
  t19: [
    { thesisId: 't19', kind: 'SOFT', pred: 'scores.social <= 4 (not party-extreme)',
      test: u => u.scores.social <= 4 },
  ],
  t20: [
    { thesisId: 't20', kind: 'SOFT', pred: 'scores.adventure >= 3',
      test: u => u.scores.adventure >= 3 },
  ],
};

/**
 * Inverted SOFT expectations fired when user DISAGREES (value <= -1).
 * These are treated as a weaker signal — not counted toward HARD, and
 * contribute to a separate "disagree-soft" stat so they don't fail the
 * run by themselves.
 */
const DISAGREE_EXPECTATIONS: Record<
  string,
  Array<Omit<Expectation, 'polarity'>>
> = {
  t1: [{ thesisId: 't1', kind: 'SOFT', pred: 'avg_summer_temp_c < 25 preferred',
    test: u => u.avg_summer_temp_c < 25 }],
  t3: [{ thesisId: 't3', kind: 'SOFT',
    pred: "city_size_tier in ['small','medium'] preferred",
    test: u => u.city_size_tier === 'small' || u.city_size_tier === 'medium' }],
  t11: [{ thesisId: 't11', kind: 'SOFT', pred: 'eu === false preferred',
    test: u => u.eu === false }],
  t13: [{ thesisId: 't13', kind: 'SOFT', pred: 'flight_hours_from_de > 7 preferred',
    test: u => u.flight_hours_from_de > 7 }],
  t15: [{ thesisId: 't15', kind: 'SOFT',
    pred: "city_size_tier in ['big','mega'] preferred",
    test: u => u.city_size_tier === 'big' || u.city_size_tier === 'mega' }],
};

/** Collect all expectations that apply to a set of answers. */
function collectExpectations(answers: Answer[]): Expectation[] {
  const list: Expectation[] = [];
  for (const a of answers) {
    if (a.value >= 1) {
      const group = AGREE_EXPECTATIONS[a.thesisId];
      if (group) {
        for (const e of group) list.push({ ...e, polarity: 'agree' });
      }
    } else if (a.value <= -1) {
      const group = DISAGREE_EXPECTATIONS[a.thesisId];
      if (group) {
        for (const e of group) list.push({ ...e, polarity: 'disagree' });
      }
    }
  }
  return list;
}

// ---------- Run evaluation ----------

type EvaluatedExpectation = {
  thesisId: string;
  kind: ExpectationKind;
  polarity: 'agree' | 'disagree';
  pred: string;
  met: boolean;
};

type RunResult = {
  id: string;
  group: string;
  answers: Answer[];
  gpa: number;
  top_uni_id: string | null;
  top_uni_name: string | null;
  top_uni_country: string | null;
  top_uni_percent: number | null;
  expectations: EvaluatedExpectation[];
  hard_total: number;
  hard_met: number;
  soft_total: number;
  soft_met: number;
  soft_met_pct: number;
  disagree_soft_total: number;
  disagree_soft_met: number;
  pass: boolean;
  hard_failed: string[];
  /** True when the combined hard-filter intersection on the GPA/excluded
   *  set was empty — rankWithFilters fell back and hard expectations are
   *  not enforceable. */
  fallback: boolean;
};

/**
 * Detect whether rankWithFilters had to fall back. The rule is: if the
 * hard-filter set applied on top of the GPA+excluded set is empty, the
 * caller falls back to the GPA+excluded set ignoring hard filters. In that
 * case HARD expectations are not the scoring engine's fault — the user's
 * combined constraints were infeasible for their GPA.
 */
function detectFallback(
  answers: Answer[],
  gpa: number,
  excluded: string[],
): boolean {
  const gpaFiltered = universities.filter(u => isReachableByGpa(u.id, gpa));
  const excludedSet = filterByExcludedCountries(gpaFiltered, excluded);
  const hard = applyHardFilters(excludedSet, answers);
  return hard.length === 0;
}

function runOne(
  id: string,
  group: string,
  answers: Answer[],
  gpa: number,
): RunResult {
  const user = buildUserVector(answers, theses);
  const ranked = rankWithFilters(user, universities, gpa, [], answers);
  const top = ranked[0];
  const fallback = detectFallback(answers, gpa, []);

  const expectations = collectExpectations(answers);
  const evaluated: EvaluatedExpectation[] = expectations.map(e => ({
    thesisId: e.thesisId,
    kind: e.kind,
    polarity: e.polarity,
    pred: e.pred,
    met: top ? e.test(top.university) : false,
  }));

  const hard = evaluated.filter(e => e.kind === 'HARD' && e.polarity === 'agree');
  const soft = evaluated.filter(e => e.kind === 'SOFT' && e.polarity === 'agree');
  const disagreeSoft = evaluated.filter(e => e.polarity === 'disagree');

  const hard_met = hard.filter(e => e.met).length;
  const soft_met = soft.filter(e => e.met).length;
  const disagree_soft_met = disagreeSoft.filter(e => e.met).length;
  const soft_met_pct = soft.length === 0 ? 1 : soft_met / soft.length;

  // When fallback triggered, HARD expectations are waived — the user gave
  // infeasible combined constraints for their GPA.
  const hard_failed_raw = hard.filter(e => !e.met).map(e => `${e.thesisId}:${e.pred}`);
  const hard_failed = fallback ? [] : hard_failed_raw;
  const allHardMet = fallback ? true : hard.length === hard_met;
  const softOk = soft.length === 0 || soft_met_pct >= 0.7;
  const pass = allHardMet && softOk;

  return {
    id,
    group,
    answers,
    gpa,
    top_uni_id: top?.university.id ?? null,
    top_uni_name: top?.university.name ?? null,
    top_uni_country: top?.university.country ?? null,
    top_uni_percent: top ? Math.round(top.percent) : null,
    expectations: evaluated,
    hard_total: hard.length,
    hard_met,
    soft_total: soft.length,
    soft_met,
    soft_met_pct,
    disagree_soft_total: disagreeSoft.length,
    disagree_soft_met,
    pass,
    hard_failed,
    fallback,
  };
}

// ---------- Run generation ----------

const HARD_FILTER_IDS = ['t1', 't2', 't3', 't11', 't13', 't15'];
const SOFT_IDS = [
  't4', 't5', 't6', 't7', 't8', 't9', 't10', 't12', 't14',
  't16', 't17', 't18', 't19', 't20',
];
const GPA_ROTATION = [7.0, 8.0, 9.0, 9.5];

function gpaFor(i: number): number {
  return GPA_ROTATION[i % GPA_ROTATION.length]!;
}

// ---------- Deterministic personas ----------

/**
 * Build the deterministic persona set:
 *   - Each hard-filter thesis at value 2 alone (6 runs)
 *   - Each soft thesis at value 2 alone (14 runs)
 *   - Every pair of hard-filter theses at value 2 (15 runs)
 *   - 15 hand-written realistic personas
 * Total: 50 runs.
 */
function generateDeterministicRuns(): Array<{
  id: string;
  group: string;
  answers: Answer[];
  gpa: number;
}> {
  const out: Array<{
    id: string; group: string; answers: Answer[]; gpa: number;
  }> = [];
  let i = 0;

  for (const t of HARD_FILTER_IDS) {
    out.push({
      id: `det-hard-single-${t}`,
      group: 'deterministic:hard-single',
      answers: setAnswer(neutralAnswers(), t, 2),
      gpa: gpaFor(i++),
    });
  }

  for (const t of SOFT_IDS) {
    out.push({
      id: `det-soft-single-${t}`,
      group: 'deterministic:soft-single',
      answers: setAnswer(neutralAnswers(), t, 2),
      gpa: gpaFor(i++),
    });
  }

  for (let a = 0; a < HARD_FILTER_IDS.length; a++) {
    for (let b = a + 1; b < HARD_FILTER_IDS.length; b++) {
      const ta = HARD_FILTER_IDS[a]!;
      const tb = HARD_FILTER_IDS[b]!;
      // t3+t15 is self-contradictory (megacity AND small town);
      // include it anyway — fallback kicks in so top-1 is NOT required to
      // satisfy either hard filter. We mark the pair and tolerate it.
      out.push({
        id: `det-hard-pair-${ta}-${tb}`,
        group: ta === 't3' && tb === 't15'
          ? 'deterministic:hard-pair-contradiction'
          : 'deterministic:hard-pair',
        answers: setAnswer(setAnswer(neutralAnswers(), ta, 2), tb, 2),
        gpa: gpaFor(i++),
      });
    }
  }

  // 15 hand-written realistic personas.
  const personas: Array<{ name: string; answers: Record<string, AnswerValue> }> = [
    {
      name: 'maastricht-lover',
      answers: { t11: 2, t13: 2, t15: 2, t19: 2, t10: -2, t20: -1 },
    },
    {
      name: 'asia-adventurer',
      answers: { t3: 2, t10: 2, t14: 1, t20: 2, t16: 1, t13: -2 },
    },
    {
      name: 'career-london',
      answers: { t3: 2, t6: 2, t8: 2, t18: 2, t5: 1, t11: 1 },
    },
    {
      name: 'budget-portugal',
      answers: { t1: 2, t4: 2, t5: -2, t7: 2, t11: 2, t13: 2 },
    },
    {
      name: 'tokyo-foodie',
      answers: { t3: 2, t9: 2, t10: 2, t20: 1, t11: -2, t13: -2 },
    },
    {
      name: 'nordic-minimalist',
      answers: { t11: 2, t13: 2, t15: 2, t16: 1, t17: 1, t19: 1, t10: -2 },
    },
    {
      name: 'berkeley-techie',
      answers: { t5: 2, t6: 2, t8: 2, t18: 2, t11: -2, t13: -2 },
    },
    {
      name: 'sydney-surfer',
      answers: { t1: 2, t2: 2, t8: 2, t16: 2, t20: 2, t11: -2, t13: -2 },
    },
    {
      name: 'paris-culture',
      answers: { t3: 2, t11: 2, t13: 2, t19: 2, t14: -1, t17: 1 },
    },
    {
      name: 'latin-chaos',
      answers: { t1: 2, t9: 2, t10: 2, t16: 1, t20: 2, t11: -2, t13: -2 },
    },
    {
      name: 'party-barcelona',
      answers: { t1: 2, t3: 2, t11: 2, t14: 2, t17: 2, t19: -1 },
    },
    {
      name: 'mountain-student',
      answers: { t2: 2, t15: 2, t16: 2, t11: 2, t13: 2, t3: -2 },
    },
    {
      name: 'english-only-budget',
      answers: { t4: 2, t8: 2, t11: 2, t13: 2, t9: -2, t5: -1 },
    },
    {
      name: 'asia-language-learner',
      answers: { t9: 2, t10: 2, t3: 1, t20: 2, t13: -2, t8: -2 },
    },
    {
      name: 'us-career-mega',
      answers: { t3: 2, t5: 2, t6: 2, t14: 1, t18: 2, t11: -2, t13: -2 },
    },
  ];

  for (const p of personas) {
    const answers: Answer[] = theses.map(t => ({
      thesisId: t.id,
      value: (p.answers[t.id] ?? 0) as AnswerValue,
    }));
    out.push({
      id: `det-persona-${p.name}`,
      group: 'deterministic:persona',
      answers,
      gpa: gpaFor(i++),
    });
  }

  return out;
}

// ---------- Random runs ----------

function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  const take = Math.min(n, pool.length);
  for (let k = 0; k < take; k++) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0]!);
  }
  return out;
}

function randomRealistic(rng: () => number, idx: number): {
  id: string; group: string; answers: Answer[]; gpa: number;
} {
  const nAnswered = 5 + Math.floor(rng() * 8); // 5..12
  const thesisIds = pickN(theses.map(t => t.id), nAnswered, rng);
  let answers = neutralAnswers();
  for (const tid of thesisIds) {
    const v = ALL_ANSWER_VALUES[Math.floor(rng() * 5)]!;
    answers = setAnswer(answers, tid, v);
  }
  return {
    id: `rand-real-${idx.toString().padStart(4, '0')}`,
    group: 'random:realistic',
    answers,
    gpa: gpaFor(idx),
  };
}

function randomExtreme(rng: () => number, idx: number): {
  id: string; group: string; answers: Answer[]; gpa: number;
} {
  const answers: Answer[] = theses.map(t => ({
    thesisId: t.id,
    value: ALL_ANSWER_VALUES[Math.floor(rng() * 5)]!,
  }));
  return {
    id: `rand-ext-${idx.toString().padStart(4, '0')}`,
    group: 'random:extreme',
    answers,
    gpa: gpaFor(idx),
  };
}

// ---------- Main ----------

function main() {
  const deterministic = generateDeterministicRuns();
  const rng = makeRng(42);
  const realistic = Array.from({ length: 750 }, (_, i) => randomRealistic(rng, i));
  const extreme = Array.from({ length: 200 }, (_, i) => randomExtreme(rng, i));
  const plan = [...deterministic, ...realistic, ...extreme];

  // Ensure ≥1000 total.
  if (plan.length < 1000) {
    throw new Error(`Planned only ${plan.length} runs, need >= 1000`);
  }

  const results: RunResult[] = plan.map(p =>
    runOne(p.id, p.group, p.answers, p.gpa),
  );

  // ---------- Aggregate stats ----------
  const total = results.length;
  const hardViolations = results.filter(r => r.hard_failed.length > 0);
  const fallbacks = results.filter(r => r.fallback);
  const passes = results.filter(r => r.pass);
  const fails = results.filter(r => !r.pass);

  /**
   * Detect internally-contradictory user answers that make some SOFT
   * expectations physically unsatisfiable. These are a *diagnostic* signal
   * for the operator, not a pass/fail tweak: a run can still PASS if the
   * scoring finds the best compromise. But the diagnostic helps understand
   * clusters of SOFT failures that are caused by the user, not the engine.
   */
  const conflictPairs: Array<[string, string, string]> = [
    ['t4', 't5', 'cheap-vs-top-uni-worth-cost'],
    ['t4', 't6', 'cheap-vs-career-elite'],
    ['t4', 't18', 'cheap-vs-career-offers'],
    ['t10', 't11', 'radical-culture-vs-eu'],
    ['t10', 't13', 'radical-culture-vs-short-flight'],
    ['t8', 't9', 'english-vs-learn-language'],
    ['t3', 't15', 'megacity-vs-small-town'],
    ['t3', 't16', 'megacity-vs-outdoor-nature'],
    ['t14', 't19', 'nightlife-vs-culture'],
    ['t14', 't15', 'nightlife-vs-small-town'],
    ['t7', 't18', 'career-egal-vs-career-offers'],
    ['t7', 't6', 'career-egal-vs-career-elite'],
  ];
  function conflicts(answers: Answer[]): string[] {
    const v = (id: string) => answers.find(a => a.thesisId === id)?.value ?? 0;
    const out: string[] = [];
    for (const [a, b, label] of conflictPairs) {
      if (v(a) >= 1 && v(b) >= 1) out.push(label);
    }
    return out;
  }
  const contradictedRuns = results.filter(r => conflicts(r.answers).length > 0);

  // Per-thesis HARD breakdown
  const hardByThesis: Record<string, { total: number; failed: number }> = {};
  // Per-thesis SOFT breakdown
  const softByThesis: Record<string, { total: number; failed: number }> = {};
  // Disagree-SOFT breakdown
  const disagreeByThesis: Record<string, { total: number; failed: number }> = {};

  for (const r of results) {
    for (const e of r.expectations) {
      const bucket = e.polarity === 'disagree'
        ? disagreeByThesis
        : e.kind === 'HARD' ? hardByThesis : softByThesis;
      const key = `${e.thesisId}:${e.pred}`;
      if (!bucket[key]) bucket[key] = { total: 0, failed: 0 };
      // Skip HARD failures on fallback runs — infeasible combined constraints
      if (e.kind === 'HARD' && e.polarity === 'agree' && r.fallback) continue;
      bucket[key].total++;
      if (!e.met) bucket[key].failed++;
    }
  }

  const softPassRate = (() => {
    let total = 0, met = 0;
    for (const r of results) {
      total += r.soft_total;
      met += r.soft_met;
    }
    return total === 0 ? 1 : met / total;
  })();

  const coherentRuns = results.filter(r => conflicts(r.answers).length === 0);
  const coherentSoftPassRate = (() => {
    let total = 0, met = 0;
    for (const r of coherentRuns) {
      total += r.soft_total;
      met += r.soft_met;
    }
    return total === 0 ? 1 : met / total;
  })();

  // ---------- Write JSON ----------
  const here = path.dirname(fileURLToPath(import.meta.url));
  const jsonPath = path.join(here, 'semantic-audit-results.json');
  const mdPath = path.join(here, 'semantic-audit-report.md');

  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        summary: {
          total_runs: total,
          passes: passes.length,
          fails: fails.length,
          hard_violations: hardViolations.length,
          fallback_runs: fallbacks.length,
          soft_pass_rate: softPassRate,
          soft_pass_rate_coherent: coherentSoftPassRate,
          contradicted_runs: contradictedRuns.length,
          coherent_runs: coherentRuns.length,
          groups: {
            deterministic: results.filter(r => r.group.startsWith('deterministic')).length,
            realistic: results.filter(r => r.group === 'random:realistic').length,
            extreme: results.filter(r => r.group === 'random:extreme').length,
          },
        },
        hard_by_thesis: hardByThesis,
        soft_by_thesis: softByThesis,
        disagree_by_thesis: disagreeByThesis,
        runs: results,
      },
      null,
      2,
    ),
  );

  // ---------- Write Markdown report ----------

  const sortBy = (
    obj: Record<string, { total: number; failed: number }>,
  ) => Object.entries(obj)
    .map(([k, v]) => ({
      key: k,
      total: v.total,
      failed: v.failed,
      rate: v.total === 0 ? 0 : v.failed / v.total,
    }))
    .sort((a, b) => b.rate - a.rate);

  const worstOffenders = results
    .filter(r => !r.pass)
    .sort((a, b) => {
      if (b.hard_failed.length !== a.hard_failed.length)
        return b.hard_failed.length - a.hard_failed.length;
      return a.soft_met_pct - b.soft_met_pct;
    })
    .slice(0, 20);

  const lines: string[] = [];
  lines.push('# Semantic Audit Report');
  lines.push('');
  lines.push(`**Runs**: ${total}`);
  lines.push(`**Passes**: ${passes.length} (${Math.round(passes.length / total * 100)}%)`);
  lines.push(`**Fails**: ${fails.length} (${Math.round(fails.length / total * 100)}%)`);
  lines.push(`**Runs with HARD violations**: ${hardViolations.length}`);
  lines.push(`**Fallback runs (infeasible combined constraints)**: ${fallbacks.length}`);
  lines.push(`**Contradicted runs (user gave opposing answers)**: ${contradictedRuns.length}`);
  lines.push(`**Overall SOFT pass rate**: ${(softPassRate * 100).toFixed(1)}%`);
  lines.push(`**SOFT pass rate (coherent runs only)**: ${(coherentSoftPassRate * 100).toFixed(1)}%`);
  lines.push('');
  lines.push('## HARD expectations by thesis');
  lines.push('');
  lines.push('| Thesis | Predicate | Total | Failed | Fail-rate |');
  lines.push('|---|---|---|---|---|');
  for (const row of sortBy(hardByThesis)) {
    lines.push(
      `| ${row.key.split(':')[0]} | \`${row.key.split(':').slice(1).join(':')}\` | ${row.total} | ${row.failed} | ${(row.rate * 100).toFixed(1)}% |`,
    );
  }
  lines.push('');
  lines.push('## SOFT expectations by thesis (agree)');
  lines.push('');
  lines.push('| Thesis | Predicate | Total | Failed | Fail-rate |');
  lines.push('|---|---|---|---|---|');
  for (const row of sortBy(softByThesis)) {
    lines.push(
      `| ${row.key.split(':')[0]} | \`${row.key.split(':').slice(1).join(':')}\` | ${row.total} | ${row.failed} | ${(row.rate * 100).toFixed(1)}% |`,
    );
  }
  lines.push('');
  lines.push('## Disagree-SOFT expectations');
  lines.push('');
  lines.push('| Thesis | Predicate | Total | Failed | Fail-rate |');
  lines.push('|---|---|---|---|---|');
  for (const row of sortBy(disagreeByThesis)) {
    lines.push(
      `| ${row.key.split(':')[0]} | \`${row.key.split(':').slice(1).join(':')}\` | ${row.total} | ${row.failed} | ${(row.rate * 100).toFixed(1)}% |`,
    );
  }
  lines.push('');
  lines.push('## Top-20 worst offenders');
  lines.push('');
  lines.push('| Run ID | Group | GPA | Top uni | HARD failed | SOFT pass | Failed HARD preds |');
  lines.push('|---|---|---|---|---|---|---|');
  for (const r of worstOffenders) {
    lines.push(
      `| ${r.id} | ${r.group} | ${r.gpa} | ${r.top_uni_id ?? '—'} | ${r.hard_failed.length}/${r.hard_total} | ${(r.soft_met_pct * 100).toFixed(0)}% | ${r.hard_failed.join('; ') || '—'} |`,
    );
  }
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  if (hardViolations.length === 0) {
    lines.push('- No HARD violations found.');
  } else {
    lines.push(`- **${hardViolations.length} runs with HARD violations** — investigate above tables.`);
  }
  if (softPassRate >= 0.85) {
    lines.push(`- SOFT pass rate ${(softPassRate * 100).toFixed(1)}% >= 85% target.`);
  } else {
    lines.push(`- SOFT pass rate ${(softPassRate * 100).toFixed(1)}% below 85% target — inspect failing clusters.`);
  }

  fs.writeFileSync(mdPath, lines.join('\n'));

  // ---------- Console summary ----------
  console.log('=== Semantic Audit ===');
  console.log(`Runs:              ${total}`);
  console.log(`Passes:            ${passes.length} (${(passes.length / total * 100).toFixed(1)}%)`);
  console.log(`Fails:             ${fails.length} (${(fails.length / total * 100).toFixed(1)}%)`);
  console.log(`HARD violations:   ${hardViolations.length}`);
  console.log(`Fallback runs:     ${fallbacks.length}`);
  console.log(`Contradicted runs: ${contradictedRuns.length} (${(contradictedRuns.length / total * 100).toFixed(1)}%)`);
  console.log(`SOFT pass rate:    ${(softPassRate * 100).toFixed(1)}%`);
  console.log(`SOFT (coherent):   ${(coherentSoftPassRate * 100).toFixed(1)}%`);
  console.log(`JSON:              ${jsonPath}`);
  console.log(`Report:            ${mdPath}`);

  if (hardViolations.length > 0) {
    console.log('\nTop 10 HARD violations:');
    for (const r of hardViolations.slice(0, 10)) {
      console.log(
        `  ${r.id} (${r.group}) gpa=${r.gpa} top=${r.top_uni_id} — failed: ${r.hard_failed.join('; ')}`,
      );
    }
    process.exit(1);
  }

  if (softPassRate < 0.85) {
    console.log('\nSOFT pass rate below 85% target.');
    // Not a hard failure but surface for the operator.
  }

  process.exit(0);
}

main();
