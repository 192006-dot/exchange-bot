import { universities } from '../src/data/universities';
import { theses } from '../src/data/theses';
import { DIMENSIONS } from '../src/lib/types';
import { buildUserVector, rankUniversities, matchPercent, computeDimMeans, computeMaxShifts } from '../src/lib/scoring';
import type { Answer, AnswerValue } from '../src/lib/types';

// 1. What's the theoretical max (all-+2) match percent against Bocconi (a "Top" uni)?
const answers: Answer[] = theses.map(t => ({ thesisId: t.id, value: 2 as AnswerValue }));
const user = buildUserVector(answers, theses);
console.log('User vector (all +2):');
for (const d of DIMENSIONS) console.log(`  ${d}: ${user[d]}`);

const means = computeDimMeans(universities);
const shifts = computeMaxShifts(means);
console.log('\nMean per dim vs max-shift:');
for (const d of DIMENSIONS) console.log(`  ${d.padEnd(10)} mean=${means[d].toFixed(2)} maxShift=${shifts[d].toFixed(2)}`);

console.log('\nAll-agree +2 top-5 and their percents:');
const ranked = rankUniversities(user, universities);
for (const r of ranked.slice(0, 5)) {
  console.log(`  ${r.percent.toFixed(1)}%  ${r.university.name}`);
}

// What % of max_possible is achievable? Check if the 100% is truly reachable.
// If we craft a *custom* user vec that's perfectly aligned to hkust (highest sum):
console.log('\n\n— Theoretical 100%: craft user vec perfectly aligned with HKUST —');
const hkust = universities.find(u => u.id === 'hkust')!;
const customVec = zeroVec();
for (const d of DIMENSIONS) {
  const dev = hkust.scores[d] - means[d];
  // user aligned with deviation: same sign & magnitude
  customVec[d] = Math.sign(dev) * shifts[d];  // user = maxShift in direction of dev
}
const pct = matchPercent(customVec, hkust, means, shifts);
console.log(`HKUST under perfectly-aligned user: ${pct.toFixed(2)}%`);

function zeroVec() {
  return DIMENSIONS.reduce((acc, d) => ({ ...acc, [d]: 0 }), {} as Record<string, number>);
}

// 2. Does GPA filter ever produce "zero" results at valid MIN?
console.log('\n\n— GPA 5.0 (minimum), all-neutral — reachable count: ', universities.filter(u => {
  const c = (require('../src/data/gpa-cutoffs') as typeof import('../src/data/gpa-cutoffs')).gpaCutoffs[u.id];
  return c === undefined || 5.0 >= c - 0.2;
}).length);

// 3. UK country string match check: universities use "United Kingdom" - fine.
// What about USA? Single uni under United Kingdom. Does the exclusion "USA" work?
const usaUnis = universities.filter(u => u.country === 'USA');
console.log(`\nUSA unis (country field match "USA"): ${usaUnis.length}`);
// Is there any ambiguity? Some unis have slashes in city names (e.g. "Berkeley / Los Angeles"). Does country field have any oddities?
const uniqueCountries = [...new Set(universities.map(u => u.country))];
console.log(`Total unique country strings: ${uniqueCountries.length}`);
for (const c of uniqueCountries) if (c.includes(' ') || c.includes('/')) console.log(`  has space/slash: "${c}"`);

// 4. Checks on t3 vs t15 — contradictory "big city" vs "small town"
// If user answers both +2, net city contribution should be 0. But t3 also adds nature:-1 and t15 adds nature:+1 → 0. Clean cancel.
// But t3 also adds social:+1 and travel:+1 and t15 adds easy:+1 → leftover: social:2 + travel:2 + easy:2
console.log('\n\n— t3=+2 AND t15=+2 (contradictory): user vector leftovers —');
const contrad = [{ thesisId: 't3', value: 2 as AnswerValue }, { thesisId: 't15', value: 2 as AnswerValue }];
const contradVec = buildUserVector(contrad, theses);
for (const d of DIMENSIONS) if (contradVec[d] !== 0) console.log(`  ${d}: ${contradVec[d]}`);

// 5. How concentrated is cost=5? If user answers t4=+2 (budget), cost*2 = +4. Match vs FGV (cost=5):
//    deviation = 5 - 2.93 = +2.07. Contribution = 4 * 2.07 = 8.28. Max = 4 * maxShift=2.07 = 8.28. So cost alone = 50%+ bump
console.log('\n\n— Single-thesis test: only t4 (budget) = +2 —');
const budgetOnly = [{ thesisId: 't4', value: 2 as AnswerValue }];
const budgetVec = buildUserVector(budgetOnly, theses);
const budgetRanked = rankUniversities(budgetVec, universities);
for (const r of budgetRanked.slice(0, 5)) console.log(`  ${r.percent.toFixed(1)}%  ${r.university.name} (cost=${r.university.scores.cost})`);
console.log('Bottom 3:');
for (const r of budgetRanked.slice(-3)) console.log(`  ${r.percent.toFixed(1)}%  ${r.university.name} (cost=${r.university.scores.cost})`);

// 6. Ski-bro sanity check — does Innsbruck/Lausanne/StGallen win?
console.log('\n\n— Ski-bro: t16=+2, t2=+2, t1=-1 —');
const skiBro = [
  { thesisId: 't16', value: 2 as AnswerValue },
  { thesisId: 't2', value: 2 as AnswerValue },
  { thesisId: 't1', value: -1 as AnswerValue },
];
const skiVec = buildUserVector(skiBro, theses);
const skiRanked = rankUniversities(skiVec, universities);
for (const r of skiRanked.slice(0, 5)) console.log(`  ${r.percent.toFixed(1)}%  ${r.university.name} nature=${r.university.scores.nature} adv=${r.university.scores.adventure}`);
