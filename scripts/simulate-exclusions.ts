/**
 * Shows what happens when an Academic-Elitist at GPA 9.0 excludes USA + UK.
 */
import { theses } from '../src/data/theses';
import { universities } from '../src/data/universities';
import { buildUserVector, rankWithFilters } from '../src/lib/scoring';
import type { Answer, AnswerValue } from '../src/lib/types';

const answers: Record<string, AnswerValue> = {
  t3: 1, t4: -2, t5: 2, t6: 2, t7: -2, t8: 2, t9: -1,
  t17: 1, t18: 2, t19: 1,
};

const userAnswers: Answer[] = theses.map(t => ({
  thesisId: t.id,
  value: answers[t.id] ?? 0,
}));
const user = buildUserVector(userAnswers, theses);
const GPA = 9.0;

const scenarios = [
  { name: 'Ohne Exclusions', excluded: [] },
  { name: 'USA ausgeschlossen', excluded: ['USA'] },
  { name: 'USA + United Kingdom + China', excluded: ['USA', 'United Kingdom', 'China'] },
];

console.log(`━━━ Academic-Elitist @ GPA ${GPA} — Effekt der Ausschlüsse ━━━`);

for (const s of scenarios) {
  const ranked = rankWithFilters(user, universities, GPA, s.excluded);
  console.log(`\n▶ ${s.name} (${ranked.length} Unis übrig)`);
  for (let i = 0; i < 3; i++) {
    const r = ranked[i];
    console.log(
      `  #${i + 1}  ${Math.round(r.percent).toString().padStart(3)}%  ${r.university.flag}  ${r.university.name.padEnd(48)}  ${r.university.city}`,
    );
  }
}
