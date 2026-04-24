/**
 * AUDIT3-3: Ranking stability under single-answer perturbation.
 */
import { theses } from '../src/data/theses';
import { universities } from '../src/data/universities';
import { buildUserVector, rankUniversities } from '../src/lib/scoring';
import type { Answer, AnswerValue } from '../src/lib/types';

let seed = 7;
function rand(): number { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
function randAnswer(): AnswerValue { return (Math.floor(rand() * 5) - 2) as AnswerValue; }

const N = 500;
let top1Flips = 0, top5Changes = 0, totalPerturbations = 0;

for (let p = 0; p < N; p++) {
  const base: AnswerValue[] = theses.map(() => randAnswer());
  const baseAns: Answer[] = theses.map((t, i) => ({ thesisId: t.id, value: base[i] }));
  const baseRank = rankUniversities(buildUserVector(baseAns, theses), universities);
  const baseTop1 = baseRank[0].university.id;
  const baseTop5 = new Set(baseRank.slice(0, 5).map(r => r.university.id));

  for (let t = 0; t < theses.length; t++) {
    const perturbed = [...base];
    const delta = rand() < 0.5 ? -1 : 1;
    const newVal = Math.max(-2, Math.min(2, base[t] + delta)) as AnswerValue;
    if (newVal === base[t]) continue;
    perturbed[t] = newVal;
    totalPerturbations++;

    const ans: Answer[] = theses.map((th, i) => ({ thesisId: th.id, value: perturbed[i] }));
    const r = rankUniversities(buildUserVector(ans, theses), universities);
    if (r[0].university.id !== baseTop1) top1Flips++;
    const newTop5 = new Set(r.slice(0, 5).map(x => x.university.id));
    if ([...newTop5].filter(x => baseTop5.has(x)).length < 5) top5Changes++;
  }
}

console.log(`\n━━━ STABILITY UNDER ±1 PERTURBATION ━━━\n`);
console.log(`Perturbations: ${totalPerturbations}`);
console.log(`Top-1 flip rate:          ${((top1Flips / totalPerturbations) * 100).toFixed(2)}%`);
console.log(`Top-5 composition change: ${((top5Changes / totalPerturbations) * 100).toFixed(2)}%`);
