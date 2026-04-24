/**
 * Run: npx tsx scripts/simulate-gpa.ts
 * Shows how GPA filter changes results for the same persona.
 */
import { theses } from '../src/data/theses';
import { universities } from '../src/data/universities';
import { buildUserVector, rankReachableUniversities } from '../src/lib/scoring';
import type { Answer, AnswerValue } from '../src/lib/types';

// Academic-Elitist persona (wants top-ranked, career, English)
const answers: Record<string, AnswerValue> = {
  t1: 0, t2: 1, t3: 2, t4: -1, t5: -2, t6: 0, t7: -1,
  t8: 0, t9: 1, t10: -1, t11: 2, t12: 2, t13: 1,
};

const gpaScenarios = [6.5, 7.5, 8.5, 9.5];

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Same persona (Academic-Elitist) at different GPAs');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

for (const gpa of gpaScenarios) {
  const userAnswers: Answer[] = theses.map(t => ({
    thesisId: t.id,
    value: answers[t.id] ?? 0,
  }));
  const user = buildUserVector(userAnswers, theses);
  const ranked = rankReachableUniversities(user, universities, gpa);

  console.log(`\n━━━ GPA ${gpa.toFixed(1)} ━━━`);
  console.log(`  Erreichbar: ${ranked.length} von ${universities.length} Unis`);
  console.log(`  Top 3:`);
  for (let i = 0; i < Math.min(3, ranked.length); i++) {
    const r = ranked[i];
    console.log(
      `    #${i + 1}  ${Math.round(r.percent).toString().padStart(3)}%  ${r.university.flag}  ${r.university.name.padEnd(48)}  ${r.university.city}`,
    );
  }
}
