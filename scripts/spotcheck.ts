import { universities } from '../src/data/universities';
import { theses } from '../src/data/theses';
import { buildUserVector, rankWithFilters } from '../src/lib/scoring';
import type { Answer } from '../src/lib/types';

const answers: Answer[] = [
  { thesisId: 't11', value: 2 },
  { thesisId: 't13', value: 2 },
  { thesisId: 't15', value: 2 },
];
const user = buildUserVector(answers, theses);
const ranked = rankWithFilters(user, universities, 9.0, [], answers);
console.log('Top-5 for user scenario (EU + no long flight + small city):');
for (const r of ranked.slice(0, 5)) {
  const u = r.university;
  console.log(
    `  ${Math.round(r.percent)}%  ${u.name} (${u.city}, ${u.country}) — eu=${u.eu} fh=${u.flight_hours_from_de} tier=${u.city_size_tier}`,
  );
}
console.log(`\nTotal matched: ${ranked.length}/100`);
console.log(`HK in results: ${ranked.some(r => r.university.country.includes('Hongkong'))}`);
