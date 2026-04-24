import { universities } from '../src/data/universities';
import { DIMENSIONS } from '../src/lib/types';
import { computeDimMeans, computeMaxShifts } from '../src/lib/scoring';
import { gpaCutoffs } from '../src/data/gpa-cutoffs';

const means = computeDimMeans(universities);
const shifts = computeMaxShifts(means);

console.log('dimension  mean   maxShift   min  max   n@5  n@1');
for (const dim of DIMENSIONS) {
  const vals = universities.map(u => u.scores[dim]);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const n5 = vals.filter(v => v === 5).length;
  const n1 = vals.filter(v => v === 1).length;
  console.log(
    `${dim.padEnd(10)} ${means[dim].toFixed(2).padStart(5)}   ${shifts[dim].toFixed(2).padStart(5)}   ${min}    ${max}   ${String(n5).padStart(3)}  ${String(n1).padStart(3)}`,
  );
}

const countries = new Set(universities.map(u => u.country));
console.log('\nAll countries (sorted):', [...countries].sort().join(' | '));

const countryCount = new Map<string, number>();
for (const u of universities) countryCount.set(u.country, (countryCount.get(u.country) ?? 0) + 1);
console.log('\nUnis per country:');
for (const [c, n] of [...countryCount.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(2)}  ${c}`);
}

// Highest sum unis
const sums = universities.map(u => ({
  id: u.id,
  name: u.name,
  country: u.country,
  sum: DIMENSIONS.reduce((s, d) => s + u.scores[d], 0),
  cutoff: gpaCutoffs[u.id],
}));
sums.sort((a, b) => b.sum - a.sum);
console.log('\nTop 15 by raw dim-sum (likely "winners" when signal is broad):');
for (const x of sums.slice(0, 15))
  console.log(`  ${x.sum}  ${x.name.padEnd(44)} (${x.country}) cutoff=${x.cutoff ?? 'none'}`);

console.log('\nBottom 10 by raw dim-sum:');
for (const x of sums.slice(-10))
  console.log(`  ${x.sum}  ${x.name.padEnd(44)} (${x.country}) cutoff=${x.cutoff ?? 'none'}`);

// Signal: how many unis have no cutoff?
const noCutoff = universities.filter(u => gpaCutoffs[u.id] === undefined);
console.log(`\nUnis with NO cutoff in table: ${noCutoff.length}/${universities.length}`);
for (const u of noCutoff) console.log(`  ${u.name} (${u.country}) — always reachable`);

// Identical-score twins
const sigMap = new Map<string, string[]>();
for (const u of universities) {
  const sig = DIMENSIONS.map(d => u.scores[d]).join('-');
  if (!sigMap.has(sig)) sigMap.set(sig, []);
  sigMap.get(sig)!.push(u.name);
}
console.log('\nIdentical-score clusters (scores exactly equal):');
for (const [sig, names] of sigMap.entries()) {
  if (names.length > 1) console.log(`  [${sig}]:\n    ${names.join(' | ')}`);
}

// Cost weirdness — check it means what it says
console.log('\nCost=5 unis (interpreted as "cheap/budget-friendly"):');
for (const u of universities.filter(x => x.scores.cost === 5)) console.log(`  ${u.name} (${u.country})`);
console.log('\nCost=1 unis (interpreted as "very expensive"):');
for (const u of universities.filter(x => x.scores.cost === 1)) console.log(`  ${u.name} (${u.country})`);
