/**
 * Run: npx tsx scripts/simulate-gpa.ts
 * Shows how GPA filter changes results for the same persona.
 * Updated for 20-thesis set.
 */
import { theses } from '../src/data/theses';
import { universities } from '../src/data/universities';
import { buildUserVector, rankReachableUniversities } from '../src/lib/scoring';
import type { Answer, AnswerValue } from '../src/lib/types';

// Academic-Elitist persona (wants top-ranked, career, English, prestige)
const answers: Record<string, AnswerValue> = {
  t3: 1,   // metropolis yes
  t4: -2,  // budget low no
  t5: 2,   // top-uni YES
  t6: 2,   // prestige YES
  t7: -2,  // chill no
  t8: 2,   // english YES
  t9: -1,  // new language no
  t14: 0,  // nightlife neutral
  t17: 1,  // int community yes
  t18: 2,  // internship offers YES
  t19: 1,  // culture yes
};

const gpaScenarios = [6.5, 7.5, 8.0, 8.5, 9.5];

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Academic-Elitist persona at different GPAs');
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
