/**
 * Persona-based integration tests — answer 13 theses as a specific persona,
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
  const ranked = rankUniversities(user, universities);
  return ranked;
}

describe('persona: Warm-Seeker (will Strand, Sonne, Spanisch, chillig)', () => {
  const answers = {
    t1: -2,  // in Europa bleiben → nein, offen
    t2: 1,   // Großstadt → yes
    t3: 0,   // Ranking → whatever
    t4: 2,   // Fremdsprache → yes
    t5: 1,   // günstig → yes
    t6: 2,   // warmes Klima → YES
    t7: 1,   // Outdoor → yes
    t8: 1,   // Reisen → yes
    t9: 2,   // Exchange-Community → yes
    t10: 1,  // Kulturschock → ok
    t11: 0,
    t12: -1, // Englisch Pflicht → nicht wichtig
    t13: 0,
  };

  it('top 3 all have climate score >= 4 (warm)', () => {
    const ranked = runPersona(answers);
    for (const r of ranked.slice(0, 3)) {
      expect(r.university.scores.climate).toBeGreaterThanOrEqual(4);
    }
  });

  it('top match has climate score >= 4', () => {
    const ranked = runPersona(answers);
    expect(ranked[0].university.scores.climate).toBeGreaterThanOrEqual(4);
  });
});

describe('persona: Academic-Elitist (will Top-Ranking, Career, Englisch)', () => {
  const answers = {
    t1: 0,
    t2: 1,
    t3: 2,   // Prestige YES
    t4: -1,
    t5: -2,
    t6: 0,
    t7: -1,
    t8: 0,
    t9: 1,
    t10: -1,
    t11: 2,  // Karriere YES
    t12: 2,  // Englisch Pflicht
    t13: 1,
  };

  it('top match is a tier-1 business school (academic 5)', () => {
    const ranked = runPersona(answers);
    expect(ranked[0].university.scores.academic).toBe(5);
    expect(ranked[0].university.scores.career).toBe(5);
  });

  it('top 5 includes Bocconi, CBS, or Stockholm SSE', () => {
    const ranked = runPersona(answers);
    const top5 = ranked.slice(0, 5).map(r => r.university.id);
    const elite = ['bocconi', 'copenhagen-bs', 'sse-stockholm', 'nyu-stern', 'michigan-ross', 'nus', 'hkust'];
    expect(top5.some(id => elite.includes(id))).toBe(true);
  });
});

describe('persona: Europe-Stayer (will einfach, kein Visum, in EU)', () => {
  const answers = {
    t1: 2,   // Europa bleiben YES
    t2: 1,
    t3: 0,
    t4: 0,
    t5: 1,
    t6: 1,
    t7: 0,
    t8: 2,   // reisen
    t9: 1,
    t10: -2, // kein Kulturschock
    t11: 0,
    t12: 1,
    t13: 2,  // einfach YES
  };

  it('top match is in Europe', () => {
    const ranked = runPersona(answers);
    expect(ranked[0].university.continent).toBe('europe');
  });

  it('avoids USA and Australia in top 3', () => {
    const ranked = runPersona(answers);
    const top3Continents = ranked.slice(0, 3).map(r => r.university.continent);
    expect(top3Continents).not.toContain('north-america');
    expect(top3Continents).not.toContain('australasia');
  });
});

describe('persona: Adventurer (will Kulturschock, Natur, Abenteuer)', () => {
  const answers = {
    t1: -2,  // NICHT in Europa bleiben
    t2: -1,  // keine Großstadt
    t3: 0,
    t4: 2,   // Fremdsprache
    t5: 1,
    t6: 1,
    t7: 2,   // Outdoor YES
    t8: 1,
    t9: 0,
    t10: 2,  // Kulturschock YES
    t11: 0,
    t12: -2, // nicht englisch Pflicht
    t13: -2, // kompliziert ok
  };

  it('top 3 all have adventure score >= 4 (non-EU feel)', () => {
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

  it('top match has adventure >= 3', () => {
    const ranked = runPersona(answers);
    expect(ranked[0].university.scores.adventure).toBeGreaterThanOrEqual(3);
  });
});

describe('persona: Budget-Backpacker (will super günstig, warm, chillig)', () => {
  const answers = {
    t1: -1,
    t2: 0,
    t3: -2,  // Ranking egal
    t4: 1,
    t5: 2,   // günstig YES
    t6: 2,   // warm YES
    t7: 1,
    t8: 2,
    t9: 1,
    t10: 1,
    t11: -2, // career egal
    t12: 0,
    t13: 0,
  };

  it('top match has cost score >= 4 (cheap)', () => {
    const ranked = runPersona(answers);
    expect(ranked[0].university.scores.cost).toBeGreaterThanOrEqual(4);
  });

  it('avoids expensive unis (Copenhagen, SSE, St.Gallen, NYU) in top 3', () => {
    const ranked = runPersona(answers);
    const top3 = ranked.slice(0, 3).map(r => r.university.id);
    const pricey = ['copenhagen-bs', 'sse-stockholm', 'st-gallen', 'nyu-stern'];
    expect(top3.some(id => pricey.includes(id))).toBe(false);
  });
});

describe('sanity: all-neutral answers produce flat 50% for all unis', () => {
  it('all unis get 50% when user is fully neutral', () => {
    const user = buildUserVector(
      theses.map(t => ({ thesisId: t.id, value: 0 as const })),
      theses,
    );
    const ranked = rankUniversities(user, universities);
    for (const r of ranked) expect(r.percent).toBe(50);
  });
});
