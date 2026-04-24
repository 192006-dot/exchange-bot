/**
 * AUDIT3-5: Thesis weight balance + dim coverage + signed bias.
 */
import { theses } from '../src/data/theses';
import { DIMENSIONS, type Dimension } from '../src/lib/types';

console.log('\n━━━ THESIS WEIGHTS ━━━\n');
const rows = theses.map(t => ({
  id: t.id,
  l1: Object.values(t.vector).reduce((s, v) => s + Math.abs(v ?? 0), 0),
  n: Object.keys(t.vector).length,
}));
rows.sort((a, b) => b.l1 - a.l1);
console.log(`Max-L1 thesis: ${rows[0].id} (L1=${rows[0].l1})`);
console.log(`Min-L1 thesis: ${rows[rows.length - 1].id} (L1=${rows[rows.length - 1].l1})`);
console.log(`Ratio max/min: ${(rows[0].l1 / rows[rows.length - 1].l1).toFixed(2)}×`);

console.log('\nDim signed-sum (bias of all +2 answer):');
const signed = new Map<Dimension, number>();
for (const t of theses) for (const d of DIMENSIONS) {
  const v = t.vector[d]; if (v !== undefined) signed.set(d, (signed.get(d) ?? 0) + v);
}
for (const d of DIMENSIONS) console.log(`  ${d.padEnd(10)} ${(signed.get(d) ?? 0).toString().padStart(4)}`);
