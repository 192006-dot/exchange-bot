/**
 * AUDIT3-4: Personas, contradictions, GPA progression, many-country exclusion.
 */
import { theses } from '../src/data/theses';
import { universities } from '../src/data/universities';
import { buildUserVector, rankWithFilters } from '../src/lib/scoring';
import { isReachableByGpa } from '../src/data/gpa-cutoffs';
import type { Answer, AnswerValue } from '../src/lib/types';

type BiasMap = Partial<Record<string, AnswerValue>>;
function build(b: BiasMap): Answer[] { return theses.map(t => ({ thesisId: t.id, value: (b[t.id] ?? 0) as AnswerValue })); }

function show(title: string, b: BiasMap, gpa = 8.0, excluded: string[] = []) {
  const ranked = rankWithFilters(buildUserVector(build(b), theses), universities, gpa, excluded);
  console.log(`\n── ${title}  (GPA ${gpa}, ${excluded.length} excl, reach ${ranked.length})`);
  for (let i = 0; i < Math.min(3, ranked.length); i++) {
    const r = ranked[i];
    console.log(`   ${i + 1}. ${r.percent.toFixed(1)}%  ${r.university.flag} ${r.university.name}`);
  }
}

console.log('\n━━━ CONTRADICTIONS ━━━');
show('t3=+2 AND t15=+2 (metropolis + small-town)', { t3: 2, t15: 2 });
show('t8=+2 AND t9=+2 (English + foreign-lang)', { t8: 2, t9: 2 });
show('t4=+2 AND t5=+2 (cheap + willing expensive)', { t4: 2, t5: 2 });
show('t10=+2 AND t11=+2 (non-western + EU-only)', { t10: 2, t11: 2 });

console.log('\n\n━━━ GPA PROGRESSIVE UNLOCK ━━━');
for (const g of [5.0, 6.0, 7.5, 9.0, 10.0]) {
  const n = universities.filter(u => isReachableByGpa(u.id, g)).length;
  console.log(`  GPA ${g.toFixed(1)}  →  ${n}/100 reachable`);
}

console.log('\n\n━━━ MANY-COUNTRY EXCLUSION ━━━');
const cc = new Map<string, number>();
for (const u of universities) cc.set(u.country, (cc.get(u.country) ?? 0) + 1);
const top10 = [...cc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([c]) => c);
show('exclude top-10 countries, career-user, GPA 8', { t5: 2, t6: 2, t18: 2 }, 8.0, top10);
show('exclude all countries', { t1: 2 }, 8.0, [...cc.keys()]);

console.log('\n\n━━━ PERSONA SANITY ━━━');
show('Surf-bum (warm+nature+small+no-career)', { t1: 2, t2: 2, t16: 2, t15: 2, t7: 2, t6: -2 });
show('Prestige-monk (acad+career, hates party)', { t6: 2, t18: 2, t5: 2, t14: -2 });
show('Cheap-Asia-adventure', { t4: 2, t10: 2, t12: 2, t20: 2, t5: -2 });
show('Just-English', { t8: 2 });
show('Hates-Asia/long-flights', { t13: 2, t10: -2 });
