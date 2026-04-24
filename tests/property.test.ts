/**
 * Property-based tests using a seeded PRNG (Mulberry32).
 *
 * Why a hand-rolled PRNG: `fast-check` is not installed, and per project
 * conventions we avoid adding deps just for tests. Mulberry32 gives us
 * deterministic iteration so a failure is reproducible from the seed.
 *
 * Covered invariants:
 *   1. Single hard-filter invariant (100 runs per filter × 6 filters)
 *   2. Multi-filter combination (200 runs)
 *   3. Fallback invariant (150 runs)
 *   4. Disagree-does-not-filter (100 runs)
 *   5. GPA no-regression (150 runs)
 *   6. Country-exclusion no-regression (150 runs)
 *   7. Determinism (50 runs)
 *   8. Soft-only queries (150 runs)
 *   9. 10 hand-written personas
 */
import { describe, it, expect } from 'vitest';
import { theses } from '@/data/theses';
import { universities } from '@/data/universities';
import {
  applyHardFilters,
  buildUserVector,
  rankUniversities,
  rankWithFilters,
} from '@/lib/scoring';
import { isReachableByGpa } from '@/data/gpa-cutoffs';
import type { Answer, AnswerValue } from '@/lib/types';

// ---------- Seeded PRNG (Mulberry32) ----------

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ANSWER_VALUES: AnswerValue[] = [-2, -1, 0, 1, 2];

function randomAnswers(rng: () => number): Answer[] {
  return theses.map(t => ({
    thesisId: t.id,
    value: ANSWER_VALUES[Math.floor(rng() * 5)]!,
  }));
}

function forceAnswer(
  answers: Answer[],
  id: string,
  value: AnswerValue,
): Answer[] {
  return answers.map(a => (a.thesisId === id ? { ...a, value } : a));
}

// ---------- Predicates matching src/lib/scoring.ts::applyHardFilters ----------

const FILTER_PREDICATES: Record<string, (u: (typeof universities)[number]) => boolean> = {
  t1: u => u.avg_summer_temp_c >= 22,
  t2: u => Math.min(u.km_to_coast, u.km_to_mountains) <= 30,
  t3: u => u.city_size_tier === 'big' || u.city_size_tier === 'mega',
  t11: u => u.eu,
  t13: u => u.flight_hours_from_de <= 10,
  t15: u => u.city_size_tier === 'small' || u.city_size_tier === 'medium',
};

const ALL_COUNTRIES = Array.from(new Set(universities.map(u => u.country)));

// ============================================================
// 1. Single-filter invariant
// ============================================================

describe('property: single-filter invariant', () => {
  for (const filterId of Object.keys(FILTER_PREDICATES)) {
    it(`${filterId}: agree → every result satisfies predicate (100 runs)`, () => {
      const predicate = FILTER_PREDICATES[filterId]!;
      const rng = makeRng(0xA1 ^ filterId.charCodeAt(1) ^ (filterId.length << 8));
      for (let i = 0; i < 100; i++) {
        const base = randomAnswers(rng);
        // Force the target filter to agree; everything else random.
        const val = (rng() < 0.5 ? 1 : 2) as AnswerValue;
        const answers = forceAnswer(base, filterId, val);
        const filtered = applyHardFilters(universities, answers);
        expect(
          filtered.every(predicate),
          `seed=${i} filter=${filterId} val=${val}`,
        ).toBe(true);
      }
    });
  }
});

// ============================================================
// 2. Multi-filter combination invariant
// ============================================================

describe('property: multi-filter combination', () => {
  it('random subsets of hard-filter theses at value=2 → all predicates hold (200 runs)', () => {
    const filterIds = Object.keys(FILTER_PREDICATES);
    const rng = makeRng(0x51A7);
    for (let i = 0; i < 200; i++) {
      // Start neutral
      let answers: Answer[] = theses.map(t => ({ thesisId: t.id, value: 0 }));
      const active: string[] = [];
      for (const fid of filterIds) {
        if (rng() < 0.5) {
          answers = forceAnswer(answers, fid, 2);
          active.push(fid);
        }
      }
      // Skip contradictory t3+t15 pairs (handled by fallback test)
      if (active.includes('t3') && active.includes('t15')) continue;

      const filtered = applyHardFilters(universities, answers);
      // Each active filter's predicate must hold on the whole set
      for (const fid of active) {
        const pred = FILTER_PREDICATES[fid]!;
        expect(
          filtered.every(pred),
          `seed=${i} active=${active.join(',')} failing=${fid}`,
        ).toBe(true);
      }
    }
  });
});

// ============================================================
// 3. Fallback invariant (contradictory filters)
// ============================================================

describe('property: fallback on empty hard-filter set', () => {
  it('t3 + t15 contradiction → rankWithFilters still returns non-empty (150 runs)', () => {
    const rng = makeRng(0xFA11);
    for (let i = 0; i < 150; i++) {
      const gpa = 6.0 + rng() * 4.0; // 6.0..10.0
      const base: Answer[] = theses.map(t => ({ thesisId: t.id, value: 0 }));
      const answers = forceAnswer(forceAnswer(base, 't3', 2), 't15', 2);
      const user = buildUserVector(answers, theses);
      const ranked = rankWithFilters(user, universities, gpa, [], answers);
      expect(ranked.length, `seed=${i} gpa=${gpa}`).toBeGreaterThan(0);
    }
  });
});

// ============================================================
// 4. Disagree must not filter
// ============================================================

describe('property: disagree does not activate filter', () => {
  it('value <= 0 on filter theses → no filter applied (100 runs)', () => {
    const rng = makeRng(0xD15A);
    for (let i = 0; i < 100; i++) {
      const answers: Answer[] = theses.map(t => {
        // For hard-filter theses: random in {-2, -1, 0}
        if (t.id in FILTER_PREDICATES) {
          const idx = Math.floor(rng() * 3);
          return { thesisId: t.id, value: [-2, -1, 0][idx]! as AnswerValue };
        }
        return {
          thesisId: t.id,
          value: ANSWER_VALUES[Math.floor(rng() * 5)]!,
        };
      });
      const filtered = applyHardFilters(universities, answers);
      expect(filtered.length, `seed=${i}`).toBe(universities.length);
    }
  });
});

// ============================================================
// 5. GPA no-regression
// ============================================================

describe('property: GPA filter is respected alongside hard filters', () => {
  it('all results satisfy isReachableByGpa (150 runs)', () => {
    const rng = makeRng(0x6A4);
    for (let i = 0; i < 150; i++) {
      const gpa = 6.0 + rng() * 4.0;
      const answers = randomAnswers(rng);
      const user = buildUserVector(answers, theses);
      const ranked = rankWithFilters(user, universities, gpa, [], answers);
      for (const r of ranked) {
        expect(
          isReachableByGpa(r.university.id, gpa),
          `seed=${i} gpa=${gpa} failing=${r.university.id}`,
        ).toBe(true);
      }
    }
  });
});

// ============================================================
// 6. Country exclusion no-regression
// ============================================================

describe('property: excluded countries never appear', () => {
  it('random exclusion list → no result from those countries (150 runs)', () => {
    const rng = makeRng(0xC0F);
    for (let i = 0; i < 150; i++) {
      // 1-4 random countries
      const n = 1 + Math.floor(rng() * 4);
      const excluded: string[] = [];
      const pool = [...ALL_COUNTRIES];
      for (let k = 0; k < n && pool.length > 0; k++) {
        const idx = Math.floor(rng() * pool.length);
        excluded.push(pool.splice(idx, 1)[0]!);
      }
      const answers = randomAnswers(rng);
      const user = buildUserVector(answers, theses);
      const ranked = rankWithFilters(user, universities, 9.5, excluded, answers);
      for (const r of ranked) {
        expect(
          excluded.includes(r.university.country),
          `seed=${i} excluded=${excluded.join(',')} leaked=${r.university.id}`,
        ).toBe(false);
      }
    }
  });
});

// ============================================================
// 7. Determinism
// ============================================================

describe('property: same input → same output', () => {
  it('50 random inputs produce identical outputs on repeated runs', () => {
    const rng = makeRng(0xDE7);
    for (let i = 0; i < 50; i++) {
      const gpa = 6.0 + rng() * 4.0;
      const answers = randomAnswers(rng);
      const user = buildUserVector(answers, theses);
      const run1 = rankWithFilters(user, universities, gpa, [], answers);
      const run2 = rankWithFilters(user, universities, gpa, [], answers);
      expect(run1.length).toBe(run2.length);
      for (let k = 0; k < run1.length; k++) {
        expect(run1[k]!.university.id).toBe(run2[k]!.university.id);
        expect(run1[k]!.percent).toBe(run2[k]!.percent);
      }
    }
  });
});

// ============================================================
// 8. Soft-only queries (no hard-filter theses at agree)
// ============================================================

describe('property: soft-only answers', () => {
  it('no hard filters active → ranked list = GPA-reachable set (150 runs)', () => {
    const rng = makeRng(0x50F7);
    const hardIds = new Set(Object.keys(FILTER_PREDICATES));
    for (let i = 0; i < 150; i++) {
      const gpa = 6.0 + rng() * 4.0;
      const reachableCount = universities.filter(u =>
        isReachableByGpa(u.id, gpa),
      ).length;
      const answers: Answer[] = theses.map(t => {
        if (hardIds.has(t.id)) {
          // Force neutral on hard-filter theses
          return { thesisId: t.id, value: 0 };
        }
        return {
          thesisId: t.id,
          value: ANSWER_VALUES[Math.floor(rng() * 5)]!,
        };
      });
      const user = buildUserVector(answers, theses);
      const ranked = rankWithFilters(user, universities, gpa, [], answers);
      // With no hard filters, ranked set must equal GPA-reachable set
      expect(ranked.length, `seed=${i} gpa=${gpa}`).toBe(reachableCount);
      expect(ranked.length, `seed=${i} gpa=${gpa}`).toBeGreaterThan(0);
    }
  });
});

// ============================================================
// 9. 10 hand-written persona cases
// ============================================================

function answerAs(mapping: Record<string, AnswerValue>): Answer[] {
  return theses.map(t => ({
    thesisId: t.id,
    value: mapping[t.id] ?? 0,
  }));
}

function topForPersona(
  mapping: Record<string, AnswerValue>,
  gpa = 9.0,
  excluded: string[] = [],
) {
  const answers = answerAs(mapping);
  const user = buildUserVector(answers, theses);
  return rankWithFilters(user, universities, gpa, excluded, answers);
}

describe('persona: Maastricht lover (small EU town, no long flight, culture)', () => {
  const persona: Record<string, AnswerValue> = {
    t11: 2, t13: 2, t15: 2, t19: 2, t10: -2, t20: -1,
  };
  it('top-5 all EU, small/medium, no long flight', () => {
    const top5 = topForPersona(persona).slice(0, 5);
    for (const r of top5) {
      expect(r.university.eu).toBe(true);
      expect(r.university.flight_hours_from_de).toBeLessThanOrEqual(10);
      expect(['small', 'medium']).toContain(r.university.city_size_tier);
    }
  });
  it('excludes HK and Sydney', () => {
    const ids = topForPersona(persona).slice(0, 10).map(r => r.university.id);
    expect(ids).not.toContain('hkust');
    expect(ids).not.toContain('hku');
    expect(ids).not.toContain('unsw');
    expect(ids).not.toContain('sydney-uni');
  });
});

describe('persona: Asia adventurer (megacity + adventure + long flights OK)', () => {
  const persona: Record<string, AnswerValue> = {
    t3: 2, t10: 2, t14: 1, t20: 2, t16: 1, t13: -2,
  };
  it('top-5 contain at least one Asian megacity', () => {
    const top5 = topForPersona(persona).slice(0, 5);
    const continents = top5.map(r => r.university.continent);
    const asian = continents.filter(c => c === 'east-asia' || c === 'southeast-asia').length;
    expect(asian).toBeGreaterThan(0);
  });
  it('top match is big or mega city', () => {
    const top = topForPersona(persona)[0]!;
    expect(['big', 'mega']).toContain(top.university.city_size_tier);
  });
});

describe('persona: Career London / Career-focused English-speaker', () => {
  // NOTE: London (UK) isn't a partner uni, but Aston/Edinburgh-style career-focused
  // English-language unis with strong career + big city should dominate.
  const persona: Record<string, AnswerValue> = {
    t3: 2, t6: 2, t8: 2, t18: 2, t5: 1, t11: 1,
  };
  it('top match is English-instruction', () => {
    const top = topForPersona(persona)[0]!;
    expect(['english', 'mixed']).toContain(top.university.language_of_instruction);
  });
  it('top match has career score >= 4', () => {
    const top = topForPersona(persona)[0]!;
    expect(top.university.scores.career).toBeGreaterThanOrEqual(4);
  });
});

describe('persona: Budget Portugal (cheap + warm + EU)', () => {
  const persona: Record<string, AnswerValue> = {
    t1: 2, t4: 2, t5: -2, t7: 2, t11: 2, t13: 2,
  };
  it('top-5 all EU', () => {
    const top5 = topForPersona(persona).slice(0, 5);
    for (const r of top5) expect(r.university.eu).toBe(true);
  });
  it('top match has cost score >= 3 (not expensive)', () => {
    const top = topForPersona(persona)[0]!;
    expect(top.university.scores.cost).toBeGreaterThanOrEqual(3);
  });
});

describe('persona: Tokyo foodie (big city + language learn + Asia)', () => {
  const persona: Record<string, AnswerValue> = {
    t3: 2, t9: 2, t10: 2, t20: 1, t11: -2, t13: -2,
  };
  it('top match is Asian', () => {
    const top = topForPersona(persona)[0]!;
    expect(['east-asia', 'southeast-asia']).toContain(top.university.continent);
  });
  it('top 3 all have city_size_tier big or mega', () => {
    const top3 = topForPersona(persona).slice(0, 3);
    for (const r of top3) {
      expect(['big', 'mega']).toContain(r.university.city_size_tier);
    }
  });
});

describe('persona: Nordic minimalist (small town + easy + EU)', () => {
  const persona: Record<string, AnswerValue> = {
    t11: 2, t13: 2, t15: 2, t16: 1, t17: 1, t19: 1, t10: -2,
  };
  it('top-5 all EU and small/medium', () => {
    const top5 = topForPersona(persona).slice(0, 5);
    for (const r of top5) {
      expect(r.university.eu).toBe(true);
      expect(['small', 'medium']).toContain(r.university.city_size_tier);
    }
  });
});

describe('persona: Berkeley techie (USA + career + academic)', () => {
  // Exclude Europe to hone in on USA
  const persona: Record<string, AnswerValue> = {
    t5: 2, t6: 2, t8: 2, t18: 2, t11: -2, t13: -2,
  };
  it('top 5 contain at least one US uni when no exclusions', () => {
    const top5 = topForPersona(persona).slice(0, 5);
    const usCount = top5.filter(r => r.university.country === 'USA').length;
    expect(usCount).toBeGreaterThan(0);
  });
});

describe('persona: Sydney surfer (coast + adventure + English)', () => {
  const persona: Record<string, AnswerValue> = {
    t1: 2, t2: 2, t8: 2, t16: 2, t20: 2, t11: -2, t13: -2,
  };
  it('top match satisfies t2 filter (coast or mountains <= 30)', () => {
    const top = topForPersona(persona)[0]!;
    const u = top.university;
    expect(Math.min(u.km_to_coast, u.km_to_mountains)).toBeLessThanOrEqual(30);
  });
  it('top match is English or mixed instruction', () => {
    const top = topForPersona(persona)[0]!;
    expect(['english', 'mixed']).toContain(top.university.language_of_instruction);
  });
});

describe('persona: Paris culture (big city + culture + EU)', () => {
  const persona: Record<string, AnswerValue> = {
    t3: 2, t11: 2, t13: 2, t19: 2, t14: -1, t17: 1,
  };
  it('top-5 all EU, big/mega', () => {
    const top5 = topForPersona(persona).slice(0, 5);
    for (const r of top5) {
      expect(r.university.eu).toBe(true);
      expect(['big', 'mega']).toContain(r.university.city_size_tier);
    }
  });
});

describe('persona: Latin chaos (adventure + warm + Spanish/Portuguese)', () => {
  // User explicitly excludes Africa/ME to target Latin America specifically.
  // Without exclusion, Morocco's HEM legitimately tops (t9 "new language" is
  // not Spanish-specific; French+Arabic also satisfies).
  const persona: Record<string, AnswerValue> = {
    t1: 2, t9: 2, t10: 2, t16: 1, t20: 2, t11: -2, t13: -2,
  };
  const excludedCountries = ['Marokko', 'Ägypten', 'VAE', 'Türkei', 'Südafrika'];
  it('top match is in latin-america (with africa-me excluded)', () => {
    const top = topForPersona(persona, 9.0, excludedCountries)[0]!;
    expect(top.university.continent).toBe('latin-america');
  });
  it('top match has language score >= 4', () => {
    const top = topForPersona(persona, 9.0, excludedCountries)[0]!;
    expect(top.university.scores.language).toBeGreaterThanOrEqual(4);
  });
});
