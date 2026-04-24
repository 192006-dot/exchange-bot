/**
 * AUDIT3-2: Identical & near-duplicate scoring profiles.
 */
import { universities } from '../src/data/universities';
import { DIMENSIONS } from '../src/lib/types';

const byKey = new Map<string, string[]>();
for (const u of universities) {
  const key = DIMENSIONS.map(d => u.scores[d]).join(',');
  const arr = byKey.get(key) ?? [];
  arr.push(u.id);
  byKey.set(key, arr);
}

console.log(`\n━━━ DUPLICATE SCORING-PROFILE AUDIT (${universities.length} unis) ━━━\n`);
console.log(`Unique score vectors: ${byKey.size} / ${universities.length}`);
const dupGroups = [...byKey.entries()].filter(([, ids]) => ids.length > 1);
console.log(`Exact-duplicate groups: ${dupGroups.length}`);
for (const [, ids] of dupGroups) {
  console.log(`  [${ids.length} unis]: ${ids.join(', ')}`);
}

let pairs = 0;
for (let i = 0; i < universities.length; i++) {
  for (let j = i + 1; j < universities.length; j++) {
    let diff = 0;
    for (const d of DIMENSIONS) if (universities[i].scores[d] !== universities[j].scores[d]) diff++;
    if (diff <= 1) pairs++;
  }
}
console.log(`\nNear-duplicate pairs (<=1 dim differ): ${pairs}`);
