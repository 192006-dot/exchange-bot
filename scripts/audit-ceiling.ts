import { universities } from '../src/data/universities';
import { theses } from '../src/data/theses';
import { DIMENSIONS } from '../src/lib/types';
import { buildUserVector, matchPercent, computeDimMeans, computeMaxShifts, rankUniversities } from '../src/lib/scoring';
import type { Answer, AnswerValue } from '../src/lib/types';

// What's the realistic *ceiling* % achievable via answers?
// We'll search the cartesian space of +2/-2 on each of 20 theses for the uni that peaks highest.

const means = computeDimMeans(universities);
const shifts = computeMaxShifts(means);

// Sample 5000 random extreme answer vectors (only +2, -2, 0 to keep it sparse)
let seed = 7;
const rand = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;

type Best = { pct: number; uniName: string; answers: number[] };
let globalBest: Best = { pct: 0, uniName: '', answers: [] };
let countAbove = { 80: 0, 85: 0, 90: 0, 95: 0 };

for (let trial = 0; trial < 5000; trial++) {
  const ans = theses.map(() => ([-2, -1, 0, 1, 2] as AnswerValue[])[Math.floor(rand() * 5)]);
  const answers: Answer[] = theses.map((t, i) => ({ thesisId: t.id, value: ans[i] }));
  const uv = buildUserVector(answers, theses);
  for (const uni of universities) {
    const p = matchPercent(uv, uni, means, shifts);
    if (p > globalBest.pct) globalBest = { pct: p, uniName: uni.name, answers: ans };
    if (p >= 80) countAbove[80]++;
    if (p >= 85) countAbove[85]++;
    if (p >= 90) countAbove[90]++;
    if (p >= 95) countAbove[95]++;
  }
}

console.log('Across 5000 random extreme profiles × 100 unis (500k samples):');
console.log(`  Best achieved: ${globalBest.pct.toFixed(2)}% @ ${globalBest.uniName}`);
console.log(`  #samples >=80%: ${countAbove[80]}`);
console.log(`  #samples >=85%: ${countAbove[85]}`);
console.log(`  #samples >=90%: ${countAbove[90]}`);
console.log(`  #samples >=95%: ${countAbove[95]}`);

// Also: top-1% distribution — what percents do top-1 matches usually produce?
const top1Percents: number[] = [];
for (let trial = 0; trial < 2000; trial++) {
  const ans = theses.map(() => ([-2, -1, 0, 1, 2] as AnswerValue[])[Math.floor(rand() * 5)]);
  const answers: Answer[] = theses.map((t, i) => ({ thesisId: t.id, value: ans[i] }));
  const uv = buildUserVector(answers, theses);
  const r = rankUniversities(uv, universities);
  top1Percents.push(r[0].percent);
}
top1Percents.sort((a, b) => a - b);
const p50 = top1Percents[Math.floor(top1Percents.length * 0.5)];
const p90 = top1Percents[Math.floor(top1Percents.length * 0.9)];
const p99 = top1Percents[Math.floor(top1Percents.length * 0.99)];
const max = top1Percents[top1Percents.length - 1];
const min = top1Percents[0];
console.log(`\nTop-1 percent distribution (2000 random users):`);
console.log(`  min=${min.toFixed(1)}  p50=${p50.toFixed(1)}  p90=${p90.toFixed(1)}  p99=${p99.toFixed(1)}  max=${max.toFixed(1)}`);
console.log(`  How often does #1 exceed 80%? ${top1Percents.filter(p => p > 80).length} / ${top1Percents.length}`);
console.log(`  How often does #1 exceed 90%? ${top1Percents.filter(p => p > 90).length} / ${top1Percents.length}`);
