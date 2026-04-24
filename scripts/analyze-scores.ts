/**
 * Analyze uni score distribution per dimension.
 * Run: npx tsx scripts/analyze-scores.ts
 */
import { universities } from '../src/data/universities';
import { DIMENSIONS } from '../src/lib/types';

console.log('\n━━━ UNI SCORE DISTRIBUTION ━━━\n');
console.log('Dim        Mean   [1 , 2 , 3 , 4 , 5 ]   # at 5');
console.log('─'.repeat(60));

for (const dim of DIMENSIONS) {
  const values = universities.map(u => u.scores[dim]);
  const mean = values.reduce((s, x) => s + x, 0) / values.length;
  const dist = [1, 2, 3, 4, 5].map(v => values.filter(x => x === v).length);
  const at5 = dist[4];
  const bar = dist.map(n => n.toString().padStart(2)).join(', ');
  const warn = mean > 3.7 ? '⚠' : mean > 3.4 ? '~' : ' ';
  console.log(
    `${warn} ${dim.padEnd(9)} ${mean.toFixed(2).padStart(5)}   [${bar}]   ${at5}`,
  );
}

console.log('\n━━━ UNIS AT academic=5 ━━━');
const top5Acad = universities.filter(u => u.scores.academic === 5).map(u => u.name);
console.log(top5Acad.map((n, i) => `  ${(i + 1).toString().padStart(2)}. ${n}`).join('\n'));
console.log(`\nTotal: ${top5Acad.length}/${universities.length}`);

console.log('\n━━━ UNIS AT social=5 ━━━');
const top5Soc = universities.filter(u => u.scores.social === 5).map(u => u.name);
console.log(`Total: ${top5Soc.length}/${universities.length}`);

console.log('\n━━━ UNIS AT career=5 ━━━');
const top5Car = universities.filter(u => u.scores.career === 5).map(u => u.name);
console.log(`Total: ${top5Car.length}/${universities.length}`);

console.log('\n━━━ UNIS AT city=5 ━━━');
const top5City = universities.filter(u => u.scores.city === 5).map(u => u.name);
console.log(`Total: ${top5City.length}/${universities.length}`);

console.log('\n━━━ UNIS AT english=5 ━━━');
const top5Eng = universities.filter(u => u.scores.english === 5).map(u => u.name);
console.log(`Total: ${top5Eng.length}/${universities.length}`);
