/**
 * Run: npx tsx scripts/simulate-personas.ts
 * Prints the top 5 matches for each persona — so you can eyeball if results make sense.
 */
import { theses } from '../src/data/theses';
import { universities } from '../src/data/universities';
import { buildUserVector, rankUniversities } from '../src/lib/scoring';
import type { Answer, AnswerValue } from '../src/lib/types';

const personas: Array<{ name: string; answers: Record<string, AnswerValue> }> = [
  {
    name: 'Warm-Seeker (Strand, Sonne, Spanisch)',
    answers: { t1: -2, t2: 1, t3: 0, t4: 2, t5: 1, t6: 2, t7: 1, t8: 1, t9: 2, t10: 1, t11: 0, t12: -1, t13: 0 },
  },
  {
    name: 'Academic-Elitist (Top-Uni, Career, Englisch)',
    answers: { t1: 0, t2: 1, t3: 2, t4: -1, t5: -2, t6: 0, t7: -1, t8: 0, t9: 1, t10: -1, t11: 2, t12: 2, t13: 1 },
  },
  {
    name: 'Europe-Stayer (einfach, EU, kein Visum)',
    answers: { t1: 2, t2: 1, t3: 0, t4: 0, t5: 1, t6: 1, t7: 0, t8: 2, t9: 1, t10: -2, t11: 0, t12: 1, t13: 2 },
  },
  {
    name: 'Adventurer (Kulturschock, Natur, Immersion)',
    answers: { t1: -2, t2: -1, t3: 0, t4: 2, t5: 1, t6: 1, t7: 2, t8: 1, t9: 0, t10: 2, t11: 0, t12: -2, t13: -2 },
  },
  {
    name: 'Budget-Backpacker (billig, warm, chillig)',
    answers: { t1: -1, t2: 0, t3: -2, t4: 1, t5: 2, t6: 2, t7: 1, t8: 2, t9: 1, t10: 1, t11: -2, t12: 0, t13: 0 },
  },
  {
    name: 'Social-Party-Person (Großstadt, Exchange, Englisch)',
    answers: { t1: 0, t2: 2, t3: 1, t4: -1, t5: 0, t6: 1, t7: -2, t8: 2, t9: 2, t10: 0, t11: 1, t12: 2, t13: 1 },
  },
  {
    name: 'Alpen-Outdoor (Natur, Berge, klein-Stadt)',
    answers: { t1: 1, t2: -2, t3: 1, t4: 1, t5: 0, t6: -1, t7: 2, t8: 1, t9: 0, t10: 0, t11: 1, t12: 0, t13: 1 },
  },
];

for (const p of personas) {
  const answers: Answer[] = theses.map(t => ({ thesisId: t.id, value: p.answers[t.id] ?? 0 }));
  const user = buildUserVector(answers, theses);
  const ranked = rankUniversities(user, universities);
  console.log(`\n━━━ ${p.name} ━━━`);
  for (let i = 0; i < 5; i++) {
    const r = ranked[i];
    console.log(
      `  #${i + 1}  ${Math.round(r.percent).toString().padStart(3)}%  ${r.university.flag}  ${r.university.name.padEnd(48)}  ${r.university.city}`,
    );
  }
}
