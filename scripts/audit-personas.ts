/**
 * Independent auditor tests — fresh-eyes persona battery.
 *
 * Goals:
 *  1. Low-GPA stress: does GPA filter actually do useful work at 6.0?
 *  2. Country exclusion: are 3-5 common exclusions (USA/China/UK) removing what they should?
 *  3. Tension persona: warm+social vs. budget-strict — who wins?
 *  4. Career obsessive across GPA levels
 *  5. Auditor's own 5 intuition-check personas
 *
 * Prints rich diagnostic output — what rank, what percent, what reasons.
 */
import { theses } from '../src/data/theses';
import { universities } from '../src/data/universities';
import { buildUserVector, rankWithFilters, rankUniversities, userSignalStrength } from '../src/lib/scoring';
import type { Answer, AnswerValue } from '../src/lib/types';

type BiasMap = Partial<Record<string, AnswerValue>>;

function build(bias: BiasMap): Answer[] {
  return theses.map(t => ({ thesisId: t.id, value: (bias[t.id] ?? 0) as AnswerValue }));
}

function show(title: string, answers: Answer[], gpa: number, excluded: string[] = []) {
  const user = buildUserVector(answers, theses);
  const sig = userSignalStrength(user);
  const ranked = rankWithFilters(user, universities, gpa, excluded);
  const unfiltered = rankUniversities(user, universities);

  console.log(`\n── ${title}`);
  console.log(`   GPA ${gpa}  |  excluded [${excluded.join(',') || 'none'}]  |  signal ${sig.toFixed(1)}`);
  console.log(`   Reachable: ${ranked.length}/${universities.length}`);
  if (ranked.length === 0) {
    console.log('   (NO RESULTS AFTER FILTERING)');
    return;
  }
  console.log('   Top 5 (filtered):');
  for (let i = 0; i < Math.min(5, ranked.length); i++) {
    const r = ranked[i];
    console.log(
      `     ${String(i + 1).padStart(2)}  ${r.percent.toFixed(1).padStart(5)}%  ${r.university.flag} ${r.university.name.padEnd(44)}  [${r.topReasons.join(', ')}]`,
    );
  }
  // Leak check: is #1 unfiltered dropped by filters?
  const top1Unfiltered = unfiltered[0];
  if (!ranked.find(r => r.university.id === top1Unfiltered.university.id)) {
    console.log(
      `   (note) unfiltered #1 was ${top1Unfiltered.university.flag} ${top1Unfiltered.university.name} — dropped by filters`,
    );
  }
  // Spread info
  const spread = ranked[0].percent - ranked[Math.min(4, ranked.length - 1)].percent;
  console.log(`   Spread #1 → #5: ${spread.toFixed(1)}pp`);
}

console.log('╔═══ AUDIT: INDEPENDENT PERSONAS ═══╗');

// ───── 1. Low-GPA user (6.0) — does GPA filter do work? ─────
console.log('\n## 1. LOW-GPA (6.0) STRESS — is filter aggressive enough?');
const lowGpa = 6.0;
// Neutral user first to see baseline reachability
show('1a. Low-GPA 6.0 / all-neutral user', build({}), lowGpa);
// Strong career signal at low GPA — should most prestigious unis be filtered?
show('1b. Low-GPA 6.0 / career-obsessive', build({ t5: 2, t6: 2, t18: 2 }), lowGpa);
// Very low GPA
show('1c. GPA 5.0 / all-neutral', build({}), 5.0);
// Compare at GPA 9.5
show('1d. GPA 9.5 / career-obsessive (elites unlocked)', build({ t5: 2, t6: 2, t18: 2 }), 9.5);

// ───── 2. Country exclusion ─────
console.log('\n\n## 2. COUNTRY EXCLUSION — USA/China/UK removed?');
const common = ['USA', 'China', 'United Kingdom'];
show('2a. USA+China+UK excluded, career-obsessive, GPA 8.5', build({ t5: 2, t6: 2, t18: 2 }), 8.5, common);
// Exclude 5 countries
const wider = ['USA', 'China', 'United Kingdom', 'Südkorea', 'Japan'];
show('2b. Exclude 5 Asian+US countries, adventurer', build({ t10: 2, t20: 2, t12: 2 }), 8.0, wider);
// Exclude Germany+Netherlands to ensure no sneak-through (they don't have Germany direct…)
show('2c. Exclude Deutschland, Austria-lover', build({ t11: 2, t13: 2 }), 8.0, ['Deutschland']);

// ───── 3. Tension: warm-seeker × budget-cheap ─────
console.log('\n\n## 3. WARM-SEEKER × BUDGET-CHEAP tension');
show(
  '3. t1=+2 (warm), t10=+2 (non-western), t4=+2 (<€900), t5=-2 (no €1500+)',
  build({ t1: 2, t10: 2, t4: 2, t5: -2 }),
  8.0,
);

// ───── 4. Career obsessive across GPA tiers ─────
console.log('\n\n## 4. CAREER-OBSESSIVE across GPA TIERS (t5, t6, t18 all +2)');
const careerObs = { t5: 2 as AnswerValue, t6: 2 as AnswerValue, t18: 2 as AnswerValue };
for (const g of [5.5, 7.0, 8.0, 9.0, 9.5]) {
  show(`   GPA ${g.toFixed(1)}`, build(careerObs), g);
}

// ───── 5. Auditor's own 5 personas ─────
console.log('\n\n## 5. AUDITOR PERSONAS');
// 5a. "Homebody" — wants EU, simple, easy. GPA 7.0.
show(
  '5a. Homebody (EU-stayer, risk-averse)',
  build({ t11: 2, t13: 2, t10: -2, t20: -2, t15: 1 }),
  7.0,
);
// 5b. "Tropical Surfer" — warm, nature, small-town, beach
show(
  '5b. Tropical Surfer (warm+nature+small+surf)',
  build({ t1: 2, t2: 2, t16: 2, t15: 1, t3: -2 }),
  7.0,
);
// 5c. "Prestige-only, cost-blind" — academic+career, ignores everything else.
show(
  '5c. Prestige Maximizer (nothing but rank)',
  build({ t6: 2, t18: 2, t5: 2, t4: -2 }),
  9.0,
);
// 5d. "Language immersion chaos" — wants non-western + new language + small town
show(
  '5d. Language Chaos (t9 non-english + t10 non-western + t15 small)',
  build({ t9: 2, t10: 2, t15: 2, t8: -2 }),
  6.5,
);
// 5e. "Contradictory" — agrees with both t3 big-city AND t15 small-town (user confusion)
show(
  '5e. Contradictory user (t3=+2 AND t15=+2)',
  build({ t3: 2, t15: 2, t14: 1 }),
  7.0,
);

// ───── 6. Edge sanity checks ─────
console.log('\n\n## 6. EDGE CASES');
// All 0 — percentages should be mass-tied at 50%
show('6a. All neutral (signal 0)', build({}), 8.0);
// All +2 — canceling opposites, what wins?
show('6b. All strong agree +2 (every thesis)', theses.map(t => ({ thesisId: t.id, value: 2 as AnswerValue })), 8.0);
// All -2 — inverse
show('6c. All strong disagree -2', theses.map(t => ({ thesisId: t.id, value: -2 as AnswerValue })), 8.0);

// ───── 7. Filter interaction: excluded + very-low-GPA ─────
console.log('\n\n## 7. COMBINED FILTERS');
show(
  '7a. GPA 5.5 + exclude USA+China+UK+Südkorea — left with scraps?',
  build({ t3: 2, t14: 2 }),
  5.5,
  ['USA', 'China', 'United Kingdom', 'Südkorea'],
);

// ───── 8. Percentage calibration sanity ─────
console.log('\n\n## 8. PERCENTAGE CALIBRATION');
// Strong, focused signal — does #1 get near 100?
const strong = build({ t1: 2, t2: 2, t3: -2, t12: 2, t16: 2, t15: 2 });
show('8a. Strong outdoor/nature/small-town (focused)', strong, 8.0);
// Very strong signal: all outdoor dims piled
const veryStrong = build({ t1: 2, t2: 2, t12: 2, t16: 2, t20: 2, t15: 2, t3: -2, t14: -2 });
show('8b. Very strong focused signal', veryStrong, 8.0);
