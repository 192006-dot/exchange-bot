/**
 * Run: npx tsx scripts/simulate-personas.ts
 * Prints the top 5 matches per persona using the new 20-thesis set.
 */
import { theses } from '../src/data/theses';
import { universities } from '../src/data/universities';
import { buildUserVector, rankUniversities } from '../src/lib/scoring';
import type { Answer, AnswerValue } from '../src/lib/types';

const personas: Array<{ name: string; answers: Record<string, AnswerValue> }> = [
  {
    name: 'Warm-Seeker (Strand, Spanisch, chillig)',
    answers: {
      t1: 2, t2: 1, t4: 1, t5: -1, t6: -1, t7: 1, t8: -1, t9: 2,
      t10: 1, t11: -2, t12: 1, t13: -1, t17: 2, t18: -1, t20: 1,
    },
  },
  {
    name: 'Academic-Elitist (Top-Uni, Career, Englisch)',
    answers: {
      t3: 1, t4: -2, t5: 2, t6: 2, t7: -2, t8: 2, t9: -1,
      t14: 0, t17: 1, t18: 2, t19: 1,
    },
  },
  {
    name: 'Europe-Stayer (einfach, EU, kein Visum)',
    answers: {
      t1: 1, t3: 1, t10: -2, t11: 2, t12: 2, t13: 2, t14: 1,
      t17: 1, t19: 1, t20: -1,
    },
  },
  {
    name: 'Adventurer (Kulturschock, Natur, Immersion)',
    answers: {
      t1: 1, t2: 2, t3: -1, t4: 1, t5: -1, t7: 1, t8: -1, t9: 2,
      t10: 2, t11: -2, t13: -2, t14: -1, t16: 2, t19: 1, t20: 2,
    },
  },
  {
    name: 'Budget-Backpacker (günstig, warm, chillig)',
    answers: {
      t1: 2, t2: 1, t4: 2, t5: -2, t6: -2, t7: 2, t9: 1, t10: 1,
      t11: -1, t12: 2, t14: 1, t16: 1, t17: 1, t18: -2, t20: 1,
    },
  },
  {
    name: 'Social-Party-Person (Großstadt, Exchange, Englisch)',
    answers: {
      t1: 1, t2: -1, t3: 2, t5: 1, t6: 1, t8: 2, t12: 2, t13: 1,
      t14: 2, t15: -2, t16: -1, t17: 2, t18: 1, t20: 1,
    },
  },
  {
    name: 'Alpen-Outdoor (Berge, Klein-Stadt, Natur)',
    answers: {
      t1: -1, t2: 2, t3: -2, t6: 1, t11: 1, t14: -2, t15: 2,
      t16: 2, t19: 1,
    },
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
