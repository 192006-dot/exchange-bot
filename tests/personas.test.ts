/**
 * Persona-based integration tests — answer 20 theses as a specific persona,
 * then check that the top matches align with intuition.
 */
import { describe, it, expect } from 'vitest';
import { theses } from '@/data/theses';
import { universities } from '@/data/universities';
import { buildUserVector, rankUniversities } from '@/lib/scoring';
import type { Answer, AnswerValue } from '@/lib/types';

function answerAs(mapping: Record<string, AnswerValue>): Answer[] {
  return theses.map(t => ({
    thesisId: t.id,
    value: mapping[t.id] ?? 0,
  }));
}

function runPersona(mapping: Record<string, AnswerValue>) {
  const user = buildUserVector(answerAs(mapping), theses);
  return rankUniversities(user, universities);
}

describe('persona: Warm-Seeker (Strand, Spanisch, chillig)', () => {
  const answers: Record<string, AnswerValue> = {
    t1: 2, t2: 1, t4: 1, t5: -1, t6: -1, t7: 1, t8: -1, t9: 2,
    t10: 1, t11: -2, t12: 1, t13: -1, t17: 2, t18: -1, t20: 1,
  };

  it('top 3 all have climate score >= 4', () => {
    const ranked = runPersona(answers);
    for (const r of ranked.slice(0, 3)) {
      expect(r.university.scores.climate).toBeGreaterThanOrEqual(4);
    }
  });

  it('top match has climate score >= 4', () => {
    expect(runPersona(answers)[0].university.scores.climate).toBeGreaterThanOrEqual(4);
  });
});

describe('persona: Academic-Elitist (Top-Uni, Career, Englisch)', () => {
  const answers: Record<string, AnswerValue> = {
    t3: 1, t4: -2, t5: 2, t6: 2, t7: -2, t8: 2, t9: -1,
    t14: 0, t17: 1, t18: 2, t19: 1,
  };

  it('top match has academic score 5', () => {
    expect(runPersona(answers)[0].university.scores.academic).toBe(5);
  });

  it('top match has career score >= 4', () => {
    expect(runPersona(answers)[0].university.scores.career).toBeGreaterThanOrEqual(4);
  });
});

describe('persona: Europe-Stayer (einfach, EU, kein Visum)', () => {
  const answers: Record<string, AnswerValue> = {
    t1: 1, t3: 1, t10: -2, t11: 2, t12: 2, t13: 2, t14: 1,
    t17: 1, t19: 1, t20: -1,
  };

  it('top match is in Europe', () => {
    expect(runPersona(answers)[0].university.continent).toBe('europe');
  });

  it('top 3 are all in Europe', () => {
    const ranked = runPersona(answers);
    for (const r of ranked.slice(0, 3)) {
      expect(r.university.continent).toBe('europe');
    }
  });
});

describe('persona: Adventurer (Kulturschock, Natur, Immersion)', () => {
  const answers: Record<string, AnswerValue> = {
    t1: 1, t2: 2, t3: -1, t4: 1, t5: -1, t7: 1, t8: -1, t9: 2,
    t10: 2, t11: -2, t13: -2, t14: -1, t16: 2, t19: 1, t20: 2,
  };

  it('top 3 have adventure score >= 4', () => {
    const ranked = runPersona(answers);
    for (const r of ranked.slice(0, 3)) {
      expect(r.university.scores.adventure).toBeGreaterThanOrEqual(4);
    }
  });

  it('top 3 are outside Europe', () => {
    const ranked = runPersona(answers);
    for (const r of ranked.slice(0, 3)) {
      expect(r.university.continent).not.toBe('europe');
    }
  });
});

describe('persona: Budget-Backpacker (günstig, warm, chillig)', () => {
  const answers: Record<string, AnswerValue> = {
    t1: 2, t2: 1, t4: 2, t5: -2, t6: -2, t7: 2, t9: 1, t10: 1,
    t11: -1, t12: 2, t14: 1, t16: 1, t17: 1, t18: -2, t20: 1,
  };

  it('top match has cost score >= 4 (cheap)', () => {
    expect(runPersona(answers)[0].university.scores.cost).toBeGreaterThanOrEqual(4);
  });

  it('top 3 avoid expensive places (CBS, SSE, St.Gallen, NYU)', () => {
    const ranked = runPersona(answers);
    const top3Ids = ranked.slice(0, 3).map(r => r.university.id);
    expect(top3Ids).not.toContain('copenhagen-bs');
    expect(top3Ids).not.toContain('sse-stockholm');
    expect(top3Ids).not.toContain('st-gallen');
    expect(top3Ids).not.toContain('nyu-stern');
  });
});

describe('persona: Alpen-Outdoor (Berge, Klein-Stadt, Natur)', () => {
  const answers: Record<string, AnswerValue> = {
    t1: -1, t2: 2, t3: -2, t6: 1, t11: 1, t14: -2, t15: 2,
    t16: 2, t19: 1,
  };

  it('top match has nature score >= 4', () => {
    expect(runPersona(answers)[0].university.scores.nature).toBeGreaterThanOrEqual(4);
  });

  it('top match is NOT a metropolis (city <= 3)', () => {
    expect(runPersona(answers)[0].university.scores.city).toBeLessThanOrEqual(3);
  });
});

describe('sanity: all-neutral answers → 50% for everyone', () => {
  it('flat 50% when user is fully neutral', () => {
    const user = buildUserVector(
      theses.map(t => ({ thesisId: t.id, value: 0 as const })),
      theses,
    );
    const ranked = rankUniversities(user, universities);
    for (const r of ranked) expect(r.percent).toBe(50);
  });
});
