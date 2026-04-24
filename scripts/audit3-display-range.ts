/**
 * AUDIT3-1: Display-percent behavior across the full input range.
 */
import { theses } from '../src/data/theses';
import { universities } from '../src/data/universities';
import {
  buildUserVector,
  rankUniversities,
  computeDimMeans,
  computeMaxShifts,
  matchPercent,
} from '../src/lib/scoring';
import type { Answer, AnswerValue } from '../src/lib/types';

let seed = 1337;
function rand(): number { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
function randAnswer(): AnswerValue { return (Math.floor(rand() * 5) - 2) as AnswerValue; }
function percentile(arr: number[], p: number): number { const s = [...arr].sort((a, b) => a - b); return s[Math.floor((s.length - 1) * p)]; }
function minArr(a: number[]): number { let m = Infinity; for (const x of a) if (x < m) m = x; return m; }
function maxArr(a: number[]): number { let m = -Infinity; for (const x of a) if (x > m) m = x; return m; }

const N = 20000;
const dimMeans = computeDimMeans(universities);
const maxShifts = computeMaxShifts(dimMeans);
const top1Percents: number[] = [];
const allPercents: number[] = [];

for (let i = 0; i < N; i++) {
  const answers: Answer[] = theses.map(t => ({ thesisId: t.id, value: randAnswer() }));
  const user = buildUserVector(answers, theses);
  const ranked = rankUniversities(user, universities);
  top1Percents.push(ranked[0].percent);
  for (const r of ranked) allPercents.push(r.percent);
}

console.log(`\n━━━ DISPLAY-PERCENT RANGE AUDIT (${N} random profiles) ━━━\n`);
console.log('TOP-1 percent distribution:');
console.log(`  min ${minArr(top1Percents).toFixed(1)}  p50 ${percentile(top1Percents, 0.5).toFixed(1)}  p95 ${percentile(top1Percents, 0.95).toFixed(1)}  p99 ${percentile(top1Percents, 0.99).toFixed(1)}  max ${maxArr(top1Percents).toFixed(1)}`);

const atCap = top1Percents.filter(p => p >= 99.9).length;
console.log(`  top-1 >= 99.9%: ${atCap}/${N}  (${((atCap / N) * 100).toFixed(2)}%)`);

console.log('\nAll-ranked (every uni, every profile):');
console.log(`  min ${minArr(allPercents).toFixed(1)}  p1 ${percentile(allPercents, 0.01).toFixed(1)}  p50 ${percentile(allPercents, 0.5).toFixed(1)}  p99 ${percentile(allPercents, 0.99).toFixed(1)}  max ${maxArr(allPercents).toFixed(1)}`);
const at0 = allPercents.filter(p => p <= 0.01).length;
const at100 = allPercents.filter(p => p >= 99.99).length;
console.log(`  at 0%: ${at0}/${allPercents.length}   at 100%: ${at100}/${allPercents.length}`);

// Neutral check
const zero = { academic: 0, cost: 0, english: 0, language: 0, climate: 0, city: 0, nature: 0, travel: 0, career: 0, adventure: 0, social: 0, easy: 0 };
console.log(`\nNeutral user → display %: ${matchPercent(zero, universities[0], dimMeans, maxShifts)} (expected 50)`);

// Single-dim scan
console.log('\nSingle-dim scan (user.academic across range, Pompeu Fabra — academic=4, mean=4.31):');
const pompeu = universities.find(u => u.id === 'pompeu-fabra')!;
for (const k of [-5, -2, -1, 0, 1, 2, 5]) {
  const u = { ...zero, academic: k };
  console.log(`  user.academic=${k.toString().padStart(3)}  →  ${matchPercent(u, pompeu, dimMeans, maxShifts).toFixed(2)}%`);
}

// Check clip frequency on both ends
let clip0 = 0, clip100 = 0;
for (const p of allPercents) { if (p <= 0.01) clip0++; if (p >= 99.99) clip100++; }
console.log(`\nClip rate: ${clip0 + clip100}/${allPercents.length} (${((clip0 + clip100) / allPercents.length * 100).toFixed(3)}%)`);
