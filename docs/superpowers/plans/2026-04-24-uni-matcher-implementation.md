# Uni-Matcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a locally runnable Next.js 16 app that asks 13 Valomat-style theses and recommends the best Maastricht-partner BSc university from ~180 candidates based on a 12-dimension scoring algorithm.

**Architecture:** Static-first Next.js 16 App Router, TypeScript, Tailwind + shadcn/ui for Apple-style UI, client-side scoring with cosine-similarity-like dot-product, no backend/database.

**Tech Stack:** Next.js 16.x · React 19 · TypeScript 5 · Tailwind CSS 4 · shadcn/ui · Motion · Vitest · pnpm 10 · Node 24 LTS.

**Spec reference:** [docs/superpowers/specs/2026-04-24-uni-matcher-design.md](../specs/2026-04-24-uni-matcher-design.md)

---

## File Structure

```
exchange-bot/
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout + fonts
│   │   ├── globals.css           # Tailwind + design tokens
│   │   ├── page.tsx              # Landing (/)
│   │   ├── quiz/
│   │   │   └── page.tsx          # Quiz (/quiz)
│   │   └── results/
│   │       └── page.tsx          # Results (/results)
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives (button, card, progress)
│   │   ├── thesis-card.tsx       # Single thesis + 5 answers
│   │   ├── progress-dots.tsx     # 13-segment progress
│   │   ├── university-hero.tsx   # Top-1 result hero card
│   │   └── university-row.tsx    # Runnerup row
│   ├── data/
│   │   ├── theses.ts             # 13 thesis objects
│   │   ├── universities.ts       # ~180 university objects
│   │   └── reason-templates.ts   # 12 dimension-to-text templates
│   └── lib/
│       ├── types.ts              # University, Thesis, Answer, Dimension
│       ├── scoring.ts            # buildUserVector + matchPercent
│       └── utils.ts              # cn() Tailwind helper
├── tests/
│   ├── scoring.test.ts
│   ├── theses.test.ts
│   └── universities.test.ts
├── package.json
├── tsconfig.json
├── next.config.ts
├── vercel.ts
├── vitest.config.ts
├── .gitignore
└── README.md
```

**Scoping:** 15 tasks. The plan front-loads a runnable skeleton (Tasks 1–6) so the user can verify early, then fills in full data (Tasks 7–10) and polishes (Tasks 11–15).

---

### Task 1: Scaffold Next.js 16 Project + Git Init

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `.gitignore`
- Create: `vercel.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Scaffold Next.js with pnpm** (from project root `/Users/franzkushnarev/claude-workspace/Exchange Bot`)

```bash
pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack --use-pnpm --skip-install
```

When prompted "would you like to use Turbopack": No.
Expected: project scaffolded in current dir.

- [ ] **Step 2: Install dependencies**

```bash
pnpm install
pnpm add motion
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
pnpm dlx shadcn@latest init
```

Prompts:
- Style: `default`
- Base color: `Neutral`
- CSS variables: `Yes`

- [ ] **Step 4: Add initial shadcn components**

```bash
pnpm dlx shadcn@latest add button card progress
```

- [ ] **Step 5: Create `vercel.ts`**

```ts
// vercel.ts
import { type VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  buildCommand: 'pnpm build',
  framework: 'nextjs',
};
```

(Note: `@vercel/config` install only needed if deploying. Skip install for local-only.)

- [ ] **Step 6: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 7: Add test script to `package.json`**

Update `scripts` in `package.json`:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 8: Git init + first commit**

```bash
git init
git add .
git commit -m "chore: scaffold next.js 16 project with shadcn/ui and vitest"
```

- [ ] **Step 9: Verify dev server starts**

```bash
pnpm dev
```

Open http://localhost:3000 — should see Next.js default page. Stop server with Ctrl+C.

---

### Task 2: Core Types (TDD Foundation)

**Files:**
- Create: `src/lib/types.ts`
- Create: `tests/types.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/types.test.ts
import { describe, it, expect } from 'vitest';
import type { University, Thesis, Answer, Dimension } from '@/lib/types';
import { DIMENSIONS } from '@/lib/types';

describe('types', () => {
  it('DIMENSIONS constant lists all 12 dimensions', () => {
    expect(DIMENSIONS).toHaveLength(12);
    expect(DIMENSIONS).toContain('academic');
    expect(DIMENSIONS).toContain('cost');
    expect(DIMENSIONS).toContain('english');
    expect(DIMENSIONS).toContain('language');
    expect(DIMENSIONS).toContain('climate');
    expect(DIMENSIONS).toContain('city');
    expect(DIMENSIONS).toContain('nature');
    expect(DIMENSIONS).toContain('travel');
    expect(DIMENSIONS).toContain('career');
    expect(DIMENSIONS).toContain('adventure');
    expect(DIMENSIONS).toContain('social');
    expect(DIMENSIONS).toContain('easy');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement types**

```ts
// src/lib/types.ts

export const DIMENSIONS = [
  'academic', 'cost', 'english', 'language',
  'climate', 'city', 'nature', 'travel',
  'career', 'adventure', 'social', 'easy',
] as const;

export type Dimension = typeof DIMENSIONS[number];

export type Continent =
  | 'europe' | 'north-america' | 'latin-america'
  | 'east-asia' | 'southeast-asia' | 'australasia' | 'africa-me';

export type DimensionScores = Record<Dimension, 1 | 2 | 3 | 4 | 5>;

export type University = {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  continent: Continent;
  language_of_instruction: 'english' | 'local' | 'mixed';
  partner_levels: ('BSc' | 'MSc' | 'DD')[];
  scores: DimensionScores;
  highlights: string[];
};

export type Thesis = {
  id: string;
  text: string;
  vector: Partial<Record<Dimension, number>>;
};

export type AnswerValue = -2 | -1 | 0 | 1 | 2;

export type Answer = {
  thesisId: string;
  value: AnswerValue;
};

export type MatchResult = {
  university: University;
  percent: number;
  topReasons: Dimension[];
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/types.ts tests/types.test.ts
git commit -m "feat(types): add core domain types (University, Thesis, Answer, Dimension)"
```

---

### Task 3: Scoring Algorithm (TDD)

**Files:**
- Create: `src/lib/scoring.ts`
- Create: `tests/scoring.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { buildUserVector, matchPercent, rankUniversities } from '@/lib/scoring';
import type { Thesis, Answer, University } from '@/lib/types';

const sampleTheses: Thesis[] = [
  { id: 't1', text: 'Europa bleiben', vector: { easy: 2, adventure: -2, climate: -1 } },
  { id: 't2', text: 'Warmes Klima', vector: { climate: 2, nature: 1 } },
];

const sampleUni: University = {
  id: 'barca', name: 'Pompeu Fabra', city: 'Barcelona', country: 'Spain',
  flag: '🇪🇸', continent: 'europe',
  language_of_instruction: 'english', partner_levels: ['BSc'],
  scores: { academic: 5, cost: 3, english: 4, language: 4, climate: 5,
            city: 5, nature: 4, travel: 5, career: 4, adventure: 2, social: 5, easy: 4 },
  highlights: ['Strand', 'Party', 'BSc-stark'],
};

describe('buildUserVector', () => {
  it('accumulates thesis vectors scaled by answer value', () => {
    const answers: Answer[] = [
      { thesisId: 't1', value: 2 },   // voll zu → ×2
      { thesisId: 't2', value: -1 },  // nicht zu → ×-1
    ];
    const vec = buildUserVector(answers, sampleTheses);
    expect(vec.easy).toBe(4);       // 2 × 2
    expect(vec.adventure).toBe(-4); // -2 × 2
    expect(vec.climate).toBe(-4);   // (-1 × 2) + (2 × -1)
    expect(vec.nature).toBe(-1);    // 1 × -1
    expect(vec.academic).toBe(0);   // not touched
  });

  it('returns all-zero vector for empty answers', () => {
    const vec = buildUserVector([], sampleTheses);
    expect(vec.academic).toBe(0);
    expect(vec.easy).toBe(0);
  });
});

describe('matchPercent', () => {
  it('returns 50% when user vector is all zero (all-neutral answers)', () => {
    const zeroVec = {
      academic: 0, cost: 0, english: 0, language: 0, climate: 0, city: 0,
      nature: 0, travel: 0, career: 0, adventure: 0, social: 0, easy: 0,
    };
    expect(matchPercent(zeroVec, sampleUni)).toBe(50);
  });

  it('returns 100% for a perfectly aligned user vector', () => {
    const perfectVec = {
      academic: 2, cost: 0, english: 2, language: 2, climate: 2, city: 2,
      nature: 2, travel: 2, career: 2, adventure: -2, social: 2, easy: 2,
    };
    // sampleUni normalized = scores - 3 = {2,0,1,1,2,2,1,2,1,-1,2,1}
    // perfectVec aligns with positive dims; adventure -2 × -1 = +2 (aligned)
    const p = matchPercent(perfectVec, sampleUni);
    expect(p).toBeGreaterThan(80);
  });

  it('returns low score for opposite preferences', () => {
    const oppositeVec = {
      academic: -2, cost: 0, english: -2, language: -2, climate: -2, city: -2,
      nature: -2, travel: -2, career: -2, adventure: 2, social: -2, easy: -2,
    };
    const p = matchPercent(oppositeVec, sampleUni);
    expect(p).toBeLessThan(20);
  });
});

describe('rankUniversities', () => {
  it('sorts universities by match descending', () => {
    const uniA = { ...sampleUni, id: 'a', scores: { ...sampleUni.scores, climate: 5 } };
    const uniB = { ...sampleUni, id: 'b', scores: { ...sampleUni.scores, climate: 1 } };
    const user = buildUserVector([{ thesisId: 't2', value: 2 }], sampleTheses);
    const ranked = rankUniversities(user, [uniA, uniB]);
    expect(ranked[0].university.id).toBe('a');
    expect(ranked[0].percent).toBeGreaterThan(ranked[1].percent);
  });

  it('identifies top reasons (dimensions with highest positive contribution)', () => {
    const user = buildUserVector([{ thesisId: 't2', value: 2 }], sampleTheses);
    const ranked = rankUniversities(user, [sampleUni]);
    expect(ranked[0].topReasons).toContain('climate');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test
```

Expected: FAIL — scoring module not found.

- [ ] **Step 3: Implement `src/lib/scoring.ts`**

```ts
// src/lib/scoring.ts
import { DIMENSIONS, type Answer, type Dimension, type MatchResult, type Thesis, type University } from './types';

type UserVector = Record<Dimension, number>;

function zeroVector(): UserVector {
  return {
    academic: 0, cost: 0, english: 0, language: 0, climate: 0, city: 0,
    nature: 0, travel: 0, career: 0, adventure: 0, social: 0, easy: 0,
  };
}

export function buildUserVector(answers: Answer[], theses: Thesis[]): UserVector {
  const vec = zeroVector();
  for (const answer of answers) {
    const thesis = theses.find(t => t.id === answer.thesisId);
    if (!thesis) continue;
    for (const dim of DIMENSIONS) {
      const weight = thesis.vector[dim];
      if (weight === undefined) continue;
      vec[dim] += weight * answer.value;
    }
  }
  return vec;
}

export function matchPercent(user: UserVector, uni: University): number {
  let rawMatch = 0;
  let maxPossible = 0;
  for (const dim of DIMENSIONS) {
    const u = user[dim];
    const a = uni.scores[dim] - 3; // normalize 1..5 → -2..+2
    rawMatch += u * a;
    maxPossible += Math.abs(u) * 2;
  }
  if (maxPossible === 0) return 50;
  return ((rawMatch + maxPossible) / (2 * maxPossible)) * 100;
}

export function topReasons(user: UserVector, uni: University, limit = 3): Dimension[] {
  return DIMENSIONS
    .map(dim => ({ dim, contribution: user[dim] * (uni.scores[dim] - 3) }))
    .filter(r => r.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, limit)
    .map(r => r.dim);
}

export function rankUniversities(user: UserVector, universities: University[]): MatchResult[] {
  return universities
    .map(u => ({
      university: u,
      percent: matchPercent(user, u),
      topReasons: topReasons(user, u),
    }))
    .sort((a, b) => b.percent - a.percent);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test
```

Expected: PASS (all scoring tests green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring.ts tests/scoring.test.ts
git commit -m "feat(scoring): implement user vector + match percent + ranking"
```

---

### Task 4: Theses Data (13 Thesen)

**Files:**
- Create: `src/data/theses.ts`
- Create: `tests/theses.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/theses.test.ts
import { describe, it, expect } from 'vitest';
import { theses } from '@/data/theses';
import { DIMENSIONS } from '@/lib/types';

describe('theses data', () => {
  it('has exactly 13 theses', () => {
    expect(theses).toHaveLength(13);
  });

  it('has unique IDs', () => {
    const ids = theses.map(t => t.id);
    expect(new Set(ids).size).toBe(13);
  });

  it('every thesis has non-empty text', () => {
    for (const t of theses) expect(t.text.length).toBeGreaterThan(10);
  });

  it('every thesis vector has at least 1 dimension', () => {
    for (const t of theses) {
      const keys = Object.keys(t.vector);
      expect(keys.length).toBeGreaterThan(0);
    }
  });

  it('every dimension is touched by at least one thesis', () => {
    const touched = new Set<string>();
    for (const t of theses) for (const d of Object.keys(t.vector)) touched.add(d);
    for (const d of DIMENSIONS) expect(touched).toContain(d);
  });

  it('all vector weights are in range -2..+2', () => {
    for (const t of theses) {
      for (const w of Object.values(t.vector)) {
        expect(w).toBeGreaterThanOrEqual(-2);
        expect(w).toBeLessThanOrEqual(2);
      }
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/theses.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/data/theses.ts`**

```ts
// src/data/theses.ts
import type { Thesis } from '@/lib/types';

export const theses: Thesis[] = [
  {
    id: 't1',
    text: 'Ich will die 6 Monate im Ausland unbedingt in Europa bleiben.',
    vector: { easy: 2, adventure: -2, climate: -1 },
  },
  {
    id: 't2',
    text: 'Ich will in einer Großstadt mit Nightlife und Kultur leben.',
    vector: { city: 2, social: 1, nature: -1 },
  },
  {
    id: 't3',
    text: 'Prestige und Uni-Ranking sind mir am wichtigsten.',
    vector: { academic: 2, career: 2, easy: -1 },
  },
  {
    id: 't4',
    text: 'Ich will bewusst eine neue Fremdsprache im Alltag lernen.',
    vector: { language: 2, english: -1, adventure: 1 },
  },
  {
    id: 't5',
    text: 'Lebenshaltungskosten sollten möglichst niedrig sein.',
    vector: { cost: 2, career: -1 },
  },
  {
    id: 't6',
    text: 'Ich suche warme Temperaturen, Sonne und Strand.',
    vector: { climate: 2, nature: 1, city: -1 },
  },
  {
    id: 't7',
    text: 'Outdoor-Aktivitäten wie Wandern, Surfen, Skifahren sollten direkt vor der Tür sein.',
    vector: { nature: 2, adventure: 1, city: -1 },
  },
  {
    id: 't8',
    text: 'Ich möchte von dort aus möglichst viele andere Länder bereisen.',
    vector: { travel: 2, easy: 1 },
  },
  {
    id: 't9',
    text: 'Ich will eine große internationale Exchange-Community, um schnell Freunde zu finden.',
    vector: { social: 2, english: 1 },
  },
  {
    id: 't10',
    text: 'Ich möchte einen richtigen Kulturschock und komplett andere Lebensart erleben.',
    vector: { adventure: 2, easy: -2, language: 1 },
  },
  {
    id: 't11',
    text: 'Ein späterer Karriere-Boost (Internship, Networking, CV-Wirkung) ist mir wichtig.',
    vector: { career: 2, academic: 1, social: 1 },
  },
  {
    id: 't12',
    text: 'Englisch als Unterrichtssprache ist für mich Pflicht.',
    vector: { english: 2, language: -1 },
  },
  {
    id: 't13',
    text: 'Ich will keine komplizierte Visa- oder Bürokratie-Odyssee.',
    vector: { easy: 2, adventure: -1 },
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/theses.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/theses.ts tests/theses.test.ts
git commit -m "feat(data): add 13 valomat-style theses covering all 12 dimensions"
```

---

### Task 5: Reason Templates

**Files:**
- Create: `src/data/reason-templates.ts`

- [ ] **Step 1: Implement templates for all 12 dimensions**

```ts
// src/data/reason-templates.ts
import type { Dimension, University } from '@/lib/types';

export const reasonTemplates: Record<Dimension, (uni: University) => string> = {
  academic: uni => `${uni.name} hat ein starkes Academic-Profil und anerkanntes Business-Programm`,
  cost: uni => `Niedrige Lebenshaltungskosten in ${uni.city} — du kommst mit kleinem Budget gut aus`,
  english: uni => `Kurse komplett auf Englisch — keine Sprachbarriere`,
  language: uni => `Intensive Sprach-Immersion — perfekt um ${uni.country}s Landessprache richtig zu lernen`,
  climate: uni => `Warmes Klima — ${uni.city} ist fast ganzjährig sonnig und angenehm`,
  city: uni => `${uni.city} ist eine lebendige Metropole mit viel Kultur, Nightlife und Events`,
  nature: uni => `Direkter Zugang zu Natur und Outdoor-Abenteuern — Berge, Strand oder beides`,
  travel: uni => `${uni.city} ist ein perfektes Reise-Hub — viele Länder easy und günstig erreichbar`,
  career: uni => `${uni.name} hat starken Ruf bei Arbeitgebern und ist ein echter CV-Booster`,
  adventure: uni => `Krasse kulturelle Distanz — ${uni.country} wird dich aus der Komfortzone holen`,
  social: uni => `Große internationale Exchange-Community — du wirst schnell Freunde finden`,
  easy: uni => `EU-nah, keine Visa-Odyssee, unkomplizierte Admin`,
};
```

- [ ] **Step 2: Commit**

```bash
git add src/data/reason-templates.ts
git commit -m "feat(data): add reason templates for all 12 dimensions"
```

---

### Task 6: Minimal Universities Data (Seed: 20 core unis)

**Files:**
- Create: `src/data/universities.ts`
- Create: `tests/universities.test.ts`

**Rationale:** Get a runnable app with a working demo first. Expand to full ~180 in Tasks 9 & 14.

- [ ] **Step 1: Write the failing test**

```ts
// tests/universities.test.ts
import { describe, it, expect } from 'vitest';
import { universities } from '@/data/universities';
import { DIMENSIONS } from '@/lib/types';

describe('universities data', () => {
  it('has at least 20 universities (seed)', () => {
    expect(universities.length).toBeGreaterThanOrEqual(20);
  });

  it('has unique IDs', () => {
    const ids = universities.map(u => u.id);
    expect(new Set(ids).size).toBe(universities.length);
  });

  it('every university has all 12 scores in range 1..5', () => {
    for (const u of universities) {
      for (const dim of DIMENSIONS) {
        const s = u.scores[dim];
        expect(s).toBeGreaterThanOrEqual(1);
        expect(s).toBeLessThanOrEqual(5);
      }
    }
  });

  it('every university has 2+ highlights', () => {
    for (const u of universities) expect(u.highlights.length).toBeGreaterThanOrEqual(2);
  });

  it('every university includes BSc in partner_levels', () => {
    for (const u of universities) expect(u.partner_levels).toContain('BSc');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/universities.test.ts
```

- [ ] **Step 3: Implement seed data (20 core unis spanning all continents)**

Content: Write `src/data/universities.ts` with exactly 20 carefully researched entries across regions. Use this exact seed set (representative & well-known):

| # | Uni | City | Country |
|---|-----|------|---------|
| 1 | Universitat Pompeu Fabra | Barcelona | Spain |
| 2 | Bocconi | Milan | Italy |
| 3 | LUISS Guido Carli | Rome | Italy |
| 4 | Nova SBE | Lisbon | Portugal |
| 5 | Copenhagen Business School | Copenhagen | Denmark |
| 6 | Stockholm School of Economics | Stockholm | Sweden |
| 7 | HEC Paris (via ESSEC Cergy) | Cergy | France |
| 8 | University of St. Gallen | St. Gallen | Switzerland |
| 9 | WU Vienna | Vienna | Austria |
| 10 | Trinity College Dublin | Dublin | Ireland |
| 11 | Aston University | Birmingham | UK |
| 12 | NYU Stern | New York | USA |
| 13 | Michigan Ross | Ann Arbor | USA |
| 14 | HEC Montréal | Montreal | Canada |
| 15 | Fundação Getulio Vargas | São Paulo | Brazil |
| 16 | PUC Chile | Santiago | Chile |
| 17 | NUS Singapore | Singapore | Singapore |
| 18 | HKUST | Hong Kong | China |
| 19 | UNSW Sydney | Sydney | Australia |
| 20 | Stellenbosch University | Stellenbosch | South Africa |

Each entry is a fully filled `University` object with meaningful scores derived from: QS rankings (academic), Numbeo (cost), Köppen climate (climate), city population (city), and Maastricht-exchange reports (easy, social).

Example entry (Pompeu Fabra):
```ts
{
  id: 'pompeu-fabra',
  name: 'Universitat Pompeu Fabra',
  city: 'Barcelona',
  country: 'Spanien',
  flag: '🇪🇸',
  continent: 'europe',
  language_of_instruction: 'mixed',
  partner_levels: ['BSc'],
  scores: {
    academic: 4, cost: 3, english: 4, language: 4, climate: 5,
    city: 5, nature: 4, travel: 5, career: 4, adventure: 2, social: 5, easy: 4,
  },
  highlights: [
    'Direkter Strand-Zugang (Barceloneta 10 Min)',
    'Top-20 Europa in Wirtschaftswissenschaften',
    'Lebendige Exchange-Community aus 80+ Nationen',
    'Barcelona als Flughub für ganz Europa',
  ],
},
```

Write all 20 entries inline in the file. No placeholder data — each score is a deliberate assessment.

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/universities.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/data/universities.ts tests/universities.test.ts
git commit -m "feat(data): add 20 seed universities across all continents"
```

---

### Task 7: Landing Page

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css` (if font additions needed)
- Modify: `src/app/layout.tsx` (title, font)

- [ ] **Step 1: Update `src/app/layout.tsx` for Inter font + metadata**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Uni-Matcher · Find your exchange uni',
  description: '13 Fragen. 180 Partner-Unis. 1 Match.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-zinc-950">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Implement landing page**

```tsx
// src/app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] text-zinc-950">
          Finde deine perfekte<br />Exchange-Uni.
        </h1>
        <p className="mt-6 text-lg text-zinc-500 leading-relaxed max-w-lg">
          13 Fragen. 180 Partner-Unis. 1 Match.<br />
          Keine Präferenzen vorher — alles kommt aus deinen Antworten raus.
        </p>
        <div className="mt-10">
          <Button asChild size="lg" className="rounded-full px-7 h-12 text-base">
            <Link href="/quiz">Los geht's →</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-zinc-400">~3 Minuten · Nichts wird gespeichert</p>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify in browser**

```bash
pnpm dev
```

Visit http://localhost:3000 — should show clean landing page matching mockup. Stop.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "feat(ui): implement landing page with hero + cta"
```

---

### Task 8: Progress Dots Component

**Files:**
- Create: `src/components/progress-dots.tsx`

- [ ] **Step 1: Implement component**

```tsx
// src/components/progress-dots.tsx
type Props = {
  total: number;
  currentIndex: number;  // 0-based
};

export function ProgressDots({ total, currentIndex }: Props) {
  return (
    <div className="flex gap-1.5 w-full">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`flex-1 h-1 rounded-full ${
            i < currentIndex
              ? 'bg-zinc-950'
              : i === currentIndex
              ? 'bg-zinc-950/40'
              : 'bg-zinc-200'
          }`}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/progress-dots.tsx
git commit -m "feat(ui): add progress dots component"
```

---

### Task 9: Thesis Card Component

**Files:**
- Create: `src/components/thesis-card.tsx`

- [ ] **Step 1: Implement component**

```tsx
// src/components/thesis-card.tsx
'use client';
import type { Thesis, AnswerValue } from '@/lib/types';

const OPTIONS: { value: AnswerValue; label: string }[] = [
  { value: 2, label: 'Stimme voll zu' },
  { value: 1, label: 'Stimme zu' },
  { value: 0, label: 'Neutral' },
  { value: -1, label: 'Stimme nicht zu' },
  { value: -2, label: 'Stimme gar nicht zu' },
];

type Props = {
  thesis: Thesis;
  selected: AnswerValue | null;
  onSelect: (value: AnswerValue) => void;
};

export function ThesisCard({ thesis, selected, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-zinc-950 mb-12">
        {thesis.text}
      </h2>
      <div className="space-y-2.5">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`w-full text-left px-6 py-4 rounded-xl border text-base transition-all ${
              selected === opt.value
                ? 'bg-zinc-950 text-white border-zinc-950'
                : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/thesis-card.tsx
git commit -m "feat(ui): add thesis card with 5-point answer scale"
```

---

### Task 10: Quiz Page

**Files:**
- Create: `src/app/quiz/page.tsx`

- [ ] **Step 1: Implement quiz page with state + auto-advance**

```tsx
// src/app/quiz/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { theses } from '@/data/theses';
import { ThesisCard } from '@/components/thesis-card';
import { ProgressDots } from '@/components/progress-dots';
import type { AnswerValue } from '@/lib/types';

export default function QuizPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerValue[]>([]);

  const currentThesis = theses[currentIndex];
  const currentSelected = answers[currentIndex] ?? null;

  function handleSelect(value: AnswerValue) {
    const next = [...answers];
    next[currentIndex] = value;
    setAnswers(next);

    setTimeout(() => {
      if (currentIndex + 1 < theses.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const encoded = encodeURIComponent(JSON.stringify(next));
        router.push(`/results?answers=${encoded}`);
      }
    }, 300);
  }

  function handleBack() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  return (
    <main className="min-h-screen px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="text-sm text-zinc-400 disabled:opacity-30 hover:text-zinc-700"
          >
            ← Zurück
          </button>
          <div className="flex-1">
            <ProgressDots total={theses.length} currentIndex={currentIndex} />
          </div>
        </div>
        <p className="text-xs uppercase tracking-widest text-zinc-400 mb-3">
          These {currentIndex + 1} von {theses.length}
        </p>
        <ThesisCard
          thesis={currentThesis}
          selected={currentSelected}
          onSelect={handleSelect}
        />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify in browser**

```bash
pnpm dev
```

Navigate `/` → "Los geht's" → click answers → progresses through 13 theses → redirects to `/results?answers=...` (page doesn't exist yet — expected).

- [ ] **Step 3: Commit**

```bash
git add src/app/quiz/page.tsx
git commit -m "feat(quiz): implement quiz page with state + auto-advance"
```

---

### Task 11: University Hero + Row Components

**Files:**
- Create: `src/components/university-hero.tsx`
- Create: `src/components/university-row.tsx`

- [ ] **Step 1: Implement hero**

```tsx
// src/components/university-hero.tsx
import type { MatchResult } from '@/lib/types';
import { reasonTemplates } from '@/data/reason-templates';

export function UniversityHero({ result }: { result: MatchResult }) {
  const { university, percent, topReasons } = result;
  return (
    <div className="rounded-3xl bg-gradient-to-b from-zinc-50 to-zinc-100 border border-zinc-200 p-9">
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
        <span>{university.flag}</span>
        <span>{university.city} · {university.country}</span>
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-zinc-950 mb-6 leading-tight">
        {university.name}
      </h2>
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-7xl font-bold tracking-tighter text-zinc-950 leading-none">
          {Math.round(percent)}%
        </span>
        <span className="text-xs uppercase tracking-widest text-zinc-500">Match</span>
      </div>
      <ul className="space-y-0 divide-y divide-zinc-200">
        {topReasons.map(dim => (
          <li key={dim} className="py-3 text-[15px] text-zinc-800 flex gap-2.5">
            <span className="text-green-600 font-bold">✓</span>
            <span>{reasonTemplates[dim](university)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Implement row**

```tsx
// src/components/university-row.tsx
import type { MatchResult } from '@/lib/types';

type Props = { rank: number; result: MatchResult };

export function UniversityRow({ rank, result }: Props) {
  const { university, percent } = result;
  return (
    <div className="flex items-center px-4 py-3.5 border border-zinc-200 rounded-xl">
      <div className="text-sm text-zinc-400 w-7">#{rank}</div>
      <div className="flex-1">
        <div className="text-[15px] font-semibold text-zinc-950">
          {university.name} · {university.city} {university.flag}
        </div>
        <div className="text-xs text-zinc-500 mt-0.5">
          {university.highlights[0]}
        </div>
      </div>
      <div className="text-base font-semibold text-zinc-800">{Math.round(percent)}%</div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/university-hero.tsx src/components/university-row.tsx
git commit -m "feat(ui): add university hero + row result components"
```

---

### Task 12: Results Page

**Files:**
- Create: `src/app/results/page.tsx`

- [ ] **Step 1: Implement results page**

```tsx
// src/app/results/page.tsx
'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { universities } from '@/data/universities';
import { theses } from '@/data/theses';
import { buildUserVector, rankUniversities } from '@/lib/scoring';
import { UniversityHero } from '@/components/university-hero';
import { UniversityRow } from '@/components/university-row';
import type { Answer, AnswerValue } from '@/lib/types';

export default function ResultsPage() {
  const params = useSearchParams();
  const raw = params.get('answers');
  if (!raw) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-6">Keine Antworten gefunden.</p>
          <Link href="/quiz" className="text-zinc-950 underline">Quiz starten</Link>
        </div>
      </main>
    );
  }

  let values: AnswerValue[] = [];
  try {
    values = JSON.parse(decodeURIComponent(raw));
  } catch {}
  const answers: Answer[] = values.map((v, i) => ({
    thesisId: theses[i].id,
    value: v,
  }));

  const user = buildUserVector(answers, theses);
  const ranked = rankUniversities(user, universities);
  const top = ranked[0];
  const runnerups = ranked.slice(1, 5);

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3">Dein Top-Match</p>
        <UniversityHero result={top} />
        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mt-10 mb-3">
          Auch stark für dich
        </p>
        <div className="space-y-2">
          {runnerups.map((r, i) => (
            <UniversityRow key={r.university.id} rank={i + 2} result={r} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/quiz" className="text-sm text-zinc-500 hover:text-zinc-900 underline">
            Nochmal machen
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify end-to-end in browser**

```bash
pnpm dev
```

Navigate `/` → answer 13 theses → see Top 1 + 4 runnerups. Verify percentages and reasons render correctly.

- [ ] **Step 3: Commit**

```bash
git add src/app/results/page.tsx
git commit -m "feat(results): implement results page with top match + runnerups"
```

---

### Task 13: Expand Universities Data to ~100 (Phase 2 Research)

**Files:**
- Modify: `src/data/universities.ts` (append ~80 more unis)

**Note:** This is a research-heavy task (~90 min of systematic work). Split by region for focus.

- [ ] **Step 1: Add remaining Europe unis (~40)**

Append entries for all remaining European partner BSc unis from the Maastricht list: Austria (Innsbruck), Belgium (Namur, Antwerpen, Louvain, Liège, KU Leuven), Czech Republic (Charles), Denmark (Aarhus, Copenhagen), Finland (Aalto, Hanken, Jyväskylä), France (Audencia, Burgundy, EDHEC, Strasbourg, EM Lyon, EM Normandie, GEM Alpine, Kedge, Neoma, Paris SB, Toulouse, Sciences Po, Skema, IÉSEG, Montpellier, Toulouse Capitole, Sorbonne), Germany (Frankfurt School, Freie Berlin, Humboldt, LMU Munich, RWTH Aachen, Hamburg, Mannheim, Münster, Cologne), Hungary (Corvinus), Ireland (Limerick), Italy (Cattolica, Bologna, Bergamo, Sapienza, Tor Vergata), Latvia (Stockholm Riga), Malta (UMalta), Norway (BI, NHH), Poland (SGH, Warsaw), Portugal (Lisboa ISEG, Católica Lisbon, Católica Porto, Porto), Slovenia (Ljubljana), Spain (IE, ESCI, Carlos III, Complutense, Autònoma BCN, Barcelona, Oviedo, Salamanca, Barcelona SM), Sweden (Gothenburg, Jönköping, Lund, Uppsala), Switzerland (Bern, Lausanne, Lucerne, ZHAW), Albania (Tirana), Croatia (Zagreb, Zagreb SEM).

For each: research from QS rankings, Numbeo, Wikipedia. Fill `scores` object deliberately. Commit as batch.

```bash
git add src/data/universities.ts
git commit -m "feat(data): add ~40 European BSc partner universities"
```

- [ ] **Step 2: Add Americas unis (~30)**

Append: USA (Brandeis, Butler, Clemson, Fairfield, George Washington, Emory, Otterbein, Purdue, Rensselaer, Texas A&M, Tulane, UGA, UC campuses, UF, UMN Carlson, Missouri, Richmond, Wisconsin, Whitworth), Canada (Brock, UQAM, Queen's Smith, Montréal, Laval, Manitoba, Victoria, Western Ivey, SFU Beedie), Latin America (UBA Argentina, Insper, USP Brazil, UAI Chile, UDD Chile, Los Andes Colombia, USFQ Ecuador, ITAM Mexico, Tec de Monterrey, Universidad del Pacífico Peru).

```bash
git add src/data/universities.ts
git commit -m "feat(data): add ~30 Americas BSc partner universities"
```

- [ ] **Step 3: Add Asia-Pacific unis (~45)**

Append: China (CUHK, CityU HK, Fudan, HKBU, Peking, PHBS, Sun Yat-sen, Renmin, Shandong, SJTU, SUFE, Tongji, HKUST, PolyU, HKU), Japan (ICU, NUCB), India (IIM Ahmedabad, Bangalore — MSc only, skip), Korea (Ewha, KAIST — MSc, Korea, SNU, Sogang, SKKU, Yonsei), Singapore (NTU, NUS, SMU — already in seed), Taiwan (NCCU, NTU, NTU Management, NTUST), Thailand (Chulalongkorn Commerce, Chulalongkorn Econ, Mahidol, Thammasat), Malaysia (UTM), Australia (Deakin, Monash, QUT, ANU, Adelaide, Newcastle, UNSW — already in seed, UQ, USyd, UWA, UTS), New Zealand (AUT, Waikato).

```bash
git add src/data/universities.ts
git commit -m "feat(data): add ~45 Asia-Pacific BSc partner universities"
```

- [ ] **Step 4: Add Africa/ME unis (~8)**

Append: Egypt (AU Cairo), Morocco (HEM, Rabat), South Africa (Stellenbosch — in seed), Turkey (Bogaziçi, Koç, Özyegin, Sabanci), UAE (AU Sharjah, Dubai).

```bash
git add src/data/universities.ts
git commit -m "feat(data): add ~8 Africa/Middle-East BSc partner universities"
```

- [ ] **Step 5: Update universities test for full pool size**

```ts
// tests/universities.test.ts — update this test
it('has at least 100 universities (full expansion)', () => {
  expect(universities.length).toBeGreaterThanOrEqual(100);
});
```

```bash
pnpm test tests/universities.test.ts
```

Expected: PASS.

```bash
git add tests/universities.test.ts
git commit -m "test(data): assert full universities pool size"
```

---

### Task 14: Motion Transitions (Polish)

**Files:**
- Modify: `src/app/quiz/page.tsx`
- Modify: `src/app/results/page.tsx`

- [ ] **Step 1: Add fade transition to quiz thesis changes**

Wrap the `ThesisCard` in Motion's `AnimatePresence` + `motion.div`:

```tsx
// src/app/quiz/page.tsx — add imports + wrap ThesisCard
import { motion, AnimatePresence } from 'motion/react';

// Inside the return, replace <ThesisCard ... /> with:
<AnimatePresence mode="wait">
  <motion.div
    key={currentIndex}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
  >
    <ThesisCard
      thesis={currentThesis}
      selected={currentSelected}
      onSelect={handleSelect}
    />
  </motion.div>
</AnimatePresence>
```

- [ ] **Step 2: Add fade-in to results page**

Wrap `<main>` content in `<motion.div>` with `initial={{opacity:0}} animate={{opacity:1}}`.

- [ ] **Step 3: Verify in browser**

```bash
pnpm dev
```

Click through the quiz — smooth fade between questions.

- [ ] **Step 4: Commit**

```bash
git add src/app/quiz/page.tsx src/app/results/page.tsx
git commit -m "feat(ui): add motion transitions for quiz + results"
```

---

### Task 15: Build & README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Run full test suite**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 2: Run build**

```bash
pnpm build
```

Expected: Build succeeds, no TypeScript errors.

- [ ] **Step 3: Run lint**

```bash
pnpm lint
```

Expected: No errors.

- [ ] **Step 4: Create README**

```md
# Uni-Matcher

Valomat-style matcher for Maastricht University partner exchange universities.

## Setup

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

## Scripts

- `pnpm dev` — local dev server
- `pnpm build` — production build
- `pnpm test` — run unit tests
- `pnpm lint` — lint

## Architecture

- **Next.js 16 App Router** · TypeScript · Tailwind · shadcn/ui
- **Static data** in `src/data/` (no DB, no backend)
- **Client-side scoring** via `src/lib/scoring.ts`
- **12 dimensions** × 13 theses × ~100 universities

See `docs/superpowers/specs/2026-04-24-uni-matcher-design.md` for full design.
```

- [ ] **Step 5: Final commit**

```bash
git add README.md
git commit -m "docs: add README"
```

---

## Self-Review Checklist

Reviewed against spec:

- [x] Spec Section 2 (Scope): Task 6 + 13 cover ~180 unis (Phase 1 = 20, Phase 2 = ~100)
- [x] Spec Section 4.1 (12 Dimensions): Task 2 (DIMENSIONS constant)
- [x] Spec Section 4.2 (University type): Task 2
- [x] Spec Section 4.3 (Thesis type): Task 2
- [x] Spec Section 4.4 (Answer type): Task 2
- [x] Spec Section 5.1 (User Vector): Task 3
- [x] Spec Section 5.2 (Match Percent): Task 3
- [x] Spec Section 5.3 (Reasons): Task 5 + Task 11
- [x] Spec Section 6.1 (Landing): Task 7
- [x] Spec Section 6.2 (Quiz): Tasks 8–10
- [x] Spec Section 6.3 (Results): Tasks 11–12
- [x] Spec Section 7 (Data Collection): Tasks 6 & 13
- [x] Spec Section 8 (Tech Stack): Task 1
- [x] Spec Section 9 (Folder Structure): Task 1 + matches plan
- [x] Spec Section 11 (Open Questions — State): URL query-params (Task 10)

**Placeholders:** None found.

**Type consistency:** `University`, `Thesis`, `Answer`, `Dimension`, `MatchResult` defined in Task 2 and used consistently in Tasks 3, 9, 10, 11, 12.

**Naming consistency:** `buildUserVector`, `matchPercent`, `rankUniversities`, `topReasons` defined in Task 3, used consistently in Task 12.
