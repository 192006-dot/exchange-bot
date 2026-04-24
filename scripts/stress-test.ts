/**
 * Stress test: 50+ random + biased user profiles, checking for scoring bias.
 *
 * Detects:
 *  1. Top-1 concentration  — is one uni dominating regardless of input?
 *  2. Dead zones           — unis that NEVER appear in any top-5
 *  3. Score spread         — is scoring producing differentiated results?
 *  4. Dimension dominance  — which dimensions produce sharpest signals?
 *
 * Run: npx tsx scripts/stress-test.ts
 */
import { theses } from '../src/data/theses';
import { universities } from '../src/data/universities';
import { buildUserVector, rankUniversities } from '../src/lib/scoring';
import { DIMENSIONS, type Answer, type AnswerValue, type Dimension } from '../src/lib/types';

type Profile = { name: string; answers: AnswerValue[] };

// Seeded pseudo-random for reproducibility
let seed = 42;
function rand(): number {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}
function randAnswer(): AnswerValue {
  const r = Math.floor(rand() * 5) - 2;
  return r as AnswerValue;
}

function makeRandomProfile(i: number): Profile {
  return {
    name: `Random #${i}`,
    answers: theses.map(() => randAnswer()),
  };
}

// Biased profiles: strong preferences in specific dimensions
function biasedProfile(name: string, biases: Partial<Record<string, AnswerValue>>): Profile {
  return {
    name,
    answers: theses.map(t => biases[t.id] ?? 0),
  };
}

const profiles: Profile[] = [
  // ---- 80 fully random profiles ----
  ...Array.from({ length: 80 }, (_, i) => makeRandomProfile(i + 1)),

  // ---- Edge cases ----
  { name: 'All Neutral', answers: theses.map(() => 0 as AnswerValue) },
  { name: 'All Strong Agree (+2)', answers: theses.map(() => 2 as AnswerValue) },
  { name: 'All Strong Disagree (-2)', answers: theses.map(() => -2 as AnswerValue) },
  {
    name: 'Alternating ±2',
    answers: theses.map((_, i) => (i % 2 === 0 ? 2 : -2) as AnswerValue),
  },

  // ---- 16 biased personas targeting specific profiles ----
  biasedProfile('Warm+Beach+Spanish', { t1: 2, t6: 1, t9: 2, t10: 2, t16: 1, t12: 1 }),
  biasedProfile('Academic+Career+Prestige', { t5: 2, t6: 2, t8: 2, t18: 2, t14: -1, t7: -2 }),
  biasedProfile('Cheap+Warm+Cultural', { t4: 2, t1: 2, t10: 1, t19: 1, t5: -2, t6: -1 }),
  biasedProfile('Nature+Outdoor+SmallTown', { t2: 2, t15: 2, t16: 2, t3: -2, t14: -2 }),
  biasedProfile('Nightlife+Metropolis+Party', { t3: 2, t14: 2, t17: 2, t19: -2, t15: -2 }),
  biasedProfile('EU-Stayer+Simple', { t11: 2, t13: 2, t10: -2, t12: 1 }),
  biasedProfile('Culture-Shock-Seeker', { t10: 2, t20: 2, t11: -2, t13: -2, t9: 1 }),
  biasedProfile('Budget-Explorer', { t4: 2, t12: 2, t7: 2, t5: -2, t6: -2, t18: -1 }),
  biasedProfile('High-Prestige-No-Budget-Limit', { t5: 2, t6: 2, t18: 2, t4: -2, t7: -2 }),
  biasedProfile('Solo-Intellectual', { t19: 2, t14: -2, t17: -2, t6: 1, t18: 1 }),
  biasedProfile('Adventure-Traveler', { t12: 2, t20: 2, t10: 1, t11: -1 }),
  biasedProfile('Ski-Bro', { t16: 2, t2: 2, t1: -1, t15: 1, t14: -1 }),
  biasedProfile('Beach-Bum', { t1: 2, t2: 1, t16: 1, t12: 1, t7: 2 }),
  biasedProfile('German-ish-Nearby', { t11: 2, t13: 2, t15: 1, t8: 0, t10: -1 }),
  biasedProfile('Language-Learner', { t9: 2, t10: 1, t8: -2, t20: 1 }),
  biasedProfile('Career-at-Any-Cost', { t6: 2, t18: 2, t5: 2, t4: -2, t7: -2, t8: 2 }),
];

console.log(`\n━━━ STRESS TEST: ${profiles.length} profiles ━━━\n`);

const top1Count = new Map<string, number>();
const top5Count = new Map<string, number>();
const allScores: number[] = [];

for (const profile of profiles) {
  const answers: Answer[] = theses.map((t, i) => ({
    thesisId: t.id,
    value: profile.answers[i],
  }));
  const user = buildUserVector(answers, theses);
  const ranked = rankUniversities(user, universities);
  const top1 = ranked[0].university.id;
  const top5 = ranked.slice(0, 5).map(r => r.university.id);

  top1Count.set(top1, (top1Count.get(top1) ?? 0) + 1);
  for (const id of top5) top5Count.set(id, (top5Count.get(id) ?? 0) + 1);

  // Score spread (top-1 vs rank-50)
  allScores.push(ranked[0].percent - ranked[Math.min(49, ranked.length - 1)].percent);
}

// ---- Analysis ----

console.log('🔍 TOP-1 DISTRIBUTION (higher = more concentrated)\n');
const sortedTop1 = [...top1Count.entries()].sort((a, b) => b[1] - a[1]);
const top1Unis = sortedTop1.slice(0, 10);
for (const [id, count] of top1Unis) {
  const uni = universities.find(u => u.id === id);
  const bar = '█'.repeat(count);
  const pct = ((count / profiles.length) * 100).toFixed(0).padStart(2);
  console.log(`  ${pct}%  ${bar.padEnd(20)}  ${uni?.flag} ${uni?.name ?? id}`);
}
console.log(`  Unique top-1 unis: ${top1Count.size} / ${universities.length}`);

const topDominator = sortedTop1[0];
if (topDominator && topDominator[1] / profiles.length > 0.15) {
  console.log(`  ⚠  WARNING: '${topDominator[0]}' dominates (${topDominator[1]} / ${profiles.length} = ${((topDominator[1] / profiles.length) * 100).toFixed(0)}%)`);
} else {
  console.log(`  ✅  No dominant uni (max share = ${((topDominator[1] / profiles.length) * 100).toFixed(0)}%)`);
}

console.log('\n🎯 TOP-5 COVERAGE\n');
console.log(`  Unique unis appearing in any top-5: ${top5Count.size} / ${universities.length}`);
console.log(`  Dead zone: ${universities.length - top5Count.size} unis NEVER hit top-5`);

// List dead-zone unis (never in top-5)
const dead = universities.filter(u => !top5Count.has(u.id));
if (dead.length > 0) {
  console.log('\n  Dead-zone unis (never in top-5):');
  for (const u of dead.slice(0, 20)) {
    console.log(`    ${u.flag} ${u.name} (${u.city}, ${u.country})`);
  }
  if (dead.length > 20) console.log(`    …and ${dead.length - 20} more`);
}

console.log('\n📊 SCORE SPREAD\n');
const avgSpread = allScores.reduce((s, x) => s + x, 0) / allScores.length;
const minSpread = Math.min(...allScores);
const maxSpread = Math.max(...allScores);
console.log(`  Average spread (top1 − rank50):  ${avgSpread.toFixed(1)}%`);
console.log(`  Min spread:                      ${minSpread.toFixed(1)}%`);
console.log(`  Max spread:                      ${maxSpread.toFixed(1)}%`);
if (avgSpread < 10) {
  console.log(`  ⚠  WARNING: avg spread < 10% — scoring might be too flat`);
} else if (avgSpread > 60) {
  console.log(`  ⚠  WARNING: avg spread > 60% — scoring might be too extreme`);
} else {
  console.log(`  ✅  Healthy spread`);
}

console.log('\n🔬 DIMENSION-LEVEL ANALYSIS (over all random profiles)\n');
// For each dim, how often does it appear in topReasons?
const dimReasonCount = new Map<Dimension, number>();
const dimUserStrength = new Map<Dimension, number>(); // sum of |user[dim]|

for (const profile of profiles) {
  const answers: Answer[] = theses.map((t, i) => ({
    thesisId: t.id,
    value: profile.answers[i],
  }));
  const user = buildUserVector(answers, theses);
  for (const dim of DIMENSIONS) {
    dimUserStrength.set(dim, (dimUserStrength.get(dim) ?? 0) + Math.abs(user[dim]));
  }
}

const dimStrength = [...DIMENSIONS].map(dim => ({
  dim,
  avgStrength: (dimUserStrength.get(dim) ?? 0) / profiles.length,
}));
dimStrength.sort((a, b) => b.avgStrength - a.avgStrength);
for (const { dim, avgStrength } of dimStrength) {
  const bar = '▓'.repeat(Math.round(avgStrength));
  console.log(`  ${dim.padEnd(10)}  ${avgStrength.toFixed(1).padStart(4)}  ${bar}`);
}

const topDim = dimStrength[0];
const bottomDim = dimStrength[dimStrength.length - 1];
const ratio = topDim.avgStrength / (bottomDim.avgStrength || 1);
if (ratio > 5) {
  console.log(`\n  ⚠  WARNING: ${topDim.dim} (${topDim.avgStrength.toFixed(1)}) is ${ratio.toFixed(1)}× stronger than ${bottomDim.dim} (${bottomDim.avgStrength.toFixed(1)})`);
} else {
  console.log(`\n  ✅  Dimension strengths reasonably balanced (max ratio ${ratio.toFixed(1)}×)`);
}
