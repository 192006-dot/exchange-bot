# Uni-Matcher — Design Spec

**Datum:** 2026-04-24
**Status:** Approved (Brainstorming-Phase abgeschlossen)
**Autor:** Franz Kushnarev · Claude (Brainstorming-Partner)

---

## 1. Kontext & Ziel

Franz studiert Bachelor *International Business* an der Maastricht University. Für das nächste Semester ist ein **verpflichtender Auslandsaufenthalt** an einer Partner-Universität vorgesehen. Die Maastricht-Partnerliste umfasst ~180 BSc-Unis über ~50 Länder — die Entscheidung ist ohne Strukturhilfe paralysierend.

**Ziel:** Eine saubere Web-App im Valomat-Stil, die basierend auf ~13 Valomat-artigen Thesen die **beste Uni** aus dem Pool der Maastricht-Partner empfiehlt — inklusive prozentualer Match-Anzeige und textueller Begründung.

**Kern-Prinzip:** *Keine* expliziten Präferenz-Inputs vorher. Alle Einsichten zu Franz' Präferenzen werden **implizit** aus den 13 Thesen-Antworten abgeleitet (analog Bundeszentrale-Wahl-O-Mat). Das Tool darf ihm nicht suggerieren, was er wollen sollte — es muss selbstständig aus den Antworten lernen.

## 2. Scope & Non-Goals

### In Scope (MVP)
- ~180 Partner-BSc-Unis als Pool
- 13 Valomat-Thesen (Agree/Disagree · 5-Punkt-Skala)
- Client-side Scoring über 12 Dimensionen
- Apple-Style UI (clean, großzügiger Whitespace, subtile Typo)
- 3 Screens: Landing, Quiz, Results
- Local Run (`pnpm dev`) + optionales Vercel-Deploy
- Statische Daten (keine DB, kein Backend)

### Non-Goals (Phase 1)
- User-Accounts, Auth, Persistenz
- Shareable Result-Links
- LLM-generierte Begründungen (Phase 2)
- Weltkarten-Visualisierung (Phase 2)
- Mobile-App / PWA-Installability
- Alumni-Erfahrungsberichte
- Multi-Language-Support (Deutsch only)
- MSc-Unis oder Double-Degree-Only-Programme

## 3. Architektur

**Typ:** Static-First Single-Page App (Next.js 16 App Router).

**Key Decisions:**
- **Kein Backend.** Alle Uni-Daten + Thesen-Katalog sind statische TypeScript-Module im Repo.
- **Client-side Scoring.** User-Antworten werden im Browser State gehalten, der Score-Algorithmus läuft synchron in `< 10 ms`.
- **Kein State-Persisting.** Reload = fresh start. Kein localStorage.
- **Deploy:** Vercel (statisch), ohne Env-Vars, ohne Datenbank, ohne externe APIs.

**Datenfluss:**
```
Landing (/)
   → User drückt "Los geht's"
     → Navigate to /quiz
        → State: answers: Answer[] (im React state oder URL query)
        → 13 Thesen der Reihe nach, nach letzter:
          → Navigate to /results
             → lib/scoring.ts berechnet User-Vektor
             → Matching gegen alle ~180 Unis
             → Render: Top 1 (Hero) + Top 5 (List)
```

## 4. Datenmodell

### 4.1 Dimensions (intern, 12 Stück)

Alle Dimensionen haben Skala **1 → 5** (für Uni-Scores) bzw. können summiert zu einem User-Vektor werden (Reell).

| Dim | Bedeutung | 1 = | 5 = |
|-----|-----------|-----|-----|
| `academic` | Akademische Exzellenz / Ranking | schwach / unbekannt | Top-100 global |
| `cost` | Günstig | sehr teuer | sehr günstig |
| `english` | Englischsprachige Kurse | fast nur Landessprache | komplett Englisch |
| `language` | Fremdsprach-Immersion | keine Sprach-Gain | volle Immersion |
| `climate` | Warmes Klima | kalt/nordisch | warm/tropisch |
| `city` | Großstadt-Vibe | Kleinstadt | Metropole mit Nightlife |
| `nature` | Outdoor-Zugang | kein Zugang | direkt Berge/Strand |
| `travel` | Reise-Hub | isoliert | viele Länder easy erreichbar |
| `career` | Career-Boost | unbekannt | Top-Ranked + Internships |
| `adventure` | Kulturschock / Exotik | EU-Komfortzone | krasse kulturelle Distanz |
| `social` | Exchange-Community | wenige Int Students | große Int-Community |
| `easy` | Organisatorische Einfachheit | komplex (Visum, Bürokratie) | EU-nah, kein Stress |

### 4.2 University

```ts
// data/universities.ts

export type Continent = 'europe' | 'north-america' | 'latin-america'
  | 'east-asia' | 'southeast-asia' | 'australasia' | 'africa-me';

export type University = {
  id: string;                  // 'pompeu-fabra-barcelona'
  name: string;                // 'Universitat Pompeu Fabra'
  city: string;                // 'Barcelona'
  country: string;             // 'Spanien'
  flag: string;                // '🇪🇸'
  continent: Continent;
  language_of_instruction: 'english' | 'local' | 'mixed';
  partner_levels: ('BSc' | 'MSc' | 'DD')[];
  scores: {
    academic: 1 | 2 | 3 | 4 | 5;
    cost: 1 | 2 | 3 | 4 | 5;
    english: 1 | 2 | 3 | 4 | 5;
    language: 1 | 2 | 3 | 4 | 5;
    climate: 1 | 2 | 3 | 4 | 5;
    city: 1 | 2 | 3 | 4 | 5;
    nature: 1 | 2 | 3 | 4 | 5;
    travel: 1 | 2 | 3 | 4 | 5;
    career: 1 | 2 | 3 | 4 | 5;
    adventure: 1 | 2 | 3 | 4 | 5;
    social: 1 | 2 | 3 | 4 | 5;
    easy: 1 | 2 | 3 | 4 | 5;
  };
  highlights: string[];        // 2–4 kurze Sätze für Begründungs-Render
};
```

Nur BSc-Unis werden im Pool berücksichtigt (Franz ist Bachelor).

### 4.3 Thesis

```ts
// data/theses.ts

export type Dimension = keyof University['scores'];

export type Thesis = {
  id: string;                              // 't1'
  text: string;                            // 'Ich will die 6 Monate in Europa bleiben.'
  vector: Partial<Record<Dimension, number>>; // Werte -2..+2
};
```

**Beispiel:**
```ts
{
  id: 't1',
  text: 'Ich will die 6 Monate in Europa bleiben.',
  vector: {
    easy: +2,
    adventure: -2,
    climate: -1,
  }
}
```

### 4.4 Answer

```ts
export type AnswerValue = -2 | -1 | 0 | 1 | 2;
// Stimme gar nicht zu = -2
// Stimme nicht zu    = -1
// Neutral            =  0
// Stimme zu          = +1
// Stimme voll zu     = +2

export type Answer = { thesisId: string; value: AnswerValue };
```

## 5. Scoring-Algorithmus

### 5.1 User-Vektor aufbauen

```ts
function buildUserVector(answers: Answer[], theses: Thesis[]): Record<Dimension, number> {
  const vector: Record<Dimension, number> = {
    academic: 0, cost: 0, english: 0, language: 0, climate: 0, city: 0,
    nature: 0, travel: 0, career: 0, adventure: 0, social: 0, easy: 0,
  };
  for (const answer of answers) {
    const thesis = theses.find(t => t.id === answer.thesisId);
    if (!thesis) continue;
    for (const [dim, weight] of Object.entries(thesis.vector)) {
      vector[dim as Dimension] += weight * answer.value;
    }
  }
  return vector;
}
```

### 5.2 Match pro Uni berechnen

```ts
function matchPercent(user: Record<Dimension, number>, uni: University): number {
  let rawMatch = 0;
  let maxPossible = 0;

  for (const dim of DIMENSIONS) {
    const u = user[dim];
    const a = uni.scores[dim] - 3; // Normalisieren auf -2..+2
    rawMatch += u * a;
    maxPossible += Math.abs(u) * 2;
  }

  if (maxPossible === 0) return 50; // User hat nur Neutral geklickt → alle 50%
  return ((rawMatch + maxPossible) / (2 * maxPossible)) * 100;
}
```

### 5.3 Begründung-Templates

Für die Top-1-Uni extrahieren wir die 3 Dimensionen mit höchstem `user[dim] * (uni.scores[dim] - 3)`. Für jede Dim existiert ein Template:

```ts
const reasonTemplates: Record<Dimension, (uni: University) => string> = {
  climate: uni => `Warmes Klima & Sonnen-Garantie — ${uni.city} hat genau das`,
  cost: uni => `Niedrige Lebenshaltungskosten — du kommst gut aus`,
  academic: uni => `${uni.name} hat ein sehr starkes BIB-Programm`,
  // ... für alle 12 Dimensionen
};
```

Falls später LLM-Begründungen gewünscht: Server Action, die die Top-3-Matches + Uni-Highlights an einen LLM-Provider schickt.

## 6. UI / UX

### 6.1 Screen 1 · Landing (`/`)

- **Titel:** "Finde deine perfekte Exchange-Uni." (44px, bold, `-0.03em` letter-spacing)
- **Subtitle:** "13 Fragen. 180 Partner-Unis. 1 Match. Keine Präferenzen vorher — alles kommt aus deinen Antworten raus."
- **CTA:** Schwarzer Pill-Button "Los geht's →" (rounded-full, 14px/28px padding)
- **Meta-Line:** "~3 Minuten · Nix wird gespeichert" (klein, muted)

### 6.2 Screen 2 · Quiz (`/quiz`)

- **Top:** 13-Segment-Progress-Bar (gefüllt = done, halbtransparent = current)
- **Label:** "These 5 von 13" (uppercase, tracking, muted)
- **Thesis:** 34px, semibold, letter-spacing `-0.02em`, max 2 Zeilen
- **5 Answer-Cards vertikal gestackt:**
  - Stimme voll zu
  - Stimme zu
  - Neutral
  - Stimme nicht zu
  - Stimme gar nicht zu
- **Card-Style:** 12px border-radius, 1px border, selected = black bg + white text
- **Auto-Advance:** Nach Click automatisch 300ms später zur nächsten Thesis
- **Keyboard:** 1–5 für Antworten (optional, Nice-to-Have)
- **Zurück-Button:** oben links, ermöglicht Korrektur vorheriger Antwort

### 6.3 Screen 3 · Results (`/results`)

**Hero-Card (Top 1):**
- Country-Line: "🇪🇸 Barcelona · Spanien"
- Uni-Name: 32px, bold
- Match-Prozent: 72px, bold (genau so groß wie in Mockup)
- 3 Begründungs-Bullets mit grünem ✓

**Sub-Section "Auch stark für dich":**
- Top 2–5 als kompakte Row (Rank, Uni-Name + Stadt, kleine Meta-Zeile, Prozent rechts)

**Footer:**
- "Nochmal machen" Link

### 6.4 Design-Tokens (aus Tailwind-Default + shadcn/ui)

- **Font:** `-apple-system, Inter, system-ui, sans-serif`
- **Background:** `#ffffff` · Cards: `#ffffff` auf `#fafafa` Body
- **Text primary:** `#09090b` (near-black)
- **Text muted:** `#71717a`
- **Border:** `#e4e4e7`
- **Success accent:** `#16a34a` (für ✓-Icons)
- **Radius:** 12px (Answer-Cards), 20px (Hero-Card)

## 7. Datenerhebung für die ~180 Unis

Claude generiert die `data/universities.ts`-Datei in einem strukturierten Pass:

**Pro Uni:** Researchiere `academic`, `cost`, `english`, `climate`, `city`, `nature`, `travel`, `career`, `adventure`, `social`, `easy`, `language` basierend auf:

- **QS World Rankings 2026** & **Times Higher Education** → `academic`, `career`
- **Numbeo City-Data** → `cost` (Lebenshaltungs-Index)
- **Uni-Websites (Maastricht Exchange-Portal)** → `english`, `partner_levels`, Programm-Details
- **Klimadaten per Stadt** (Köppen-Zonen) → `climate`
- **Stadt-Einwohnerzahl + Wikipedia** → `city`, `nature`, `travel`
- **Maastricht Exchange-Erfahrungsberichte** → `social`, `easy`

Jeder Score ist eine **bewusste, dokumentierte Bewertung**, nicht zufällig. Bei Unsicherheit: 3 (neutral).

**Validierungs-Pass nach Erstgenerierung:** Franz reviewed Stichproben aus ~20 Unis, Claude passt systematische Fehler an.

## 8. Tech-Stack (endgültig)

| Layer | Technologie | Version (Stand 2026-04-24) |
|-------|-------------|----------------------------|
| Framework | Next.js (App Router) | 16.x |
| Sprache | TypeScript | 5.x |
| UI-Lib | shadcn/ui | latest |
| Styling | Tailwind CSS | 4.x |
| Motion | Motion | latest |
| Runtime | Node.js | 24 LTS |
| Package Manager | pnpm | 10.x |
| Deploy-Target | Vercel (static) | — |

**Konfiguration:** `vercel.ts` (TypeScript, nicht `vercel.json`).

**Kein:**
- Database / Storage
- Auth
- Custom API-Routes (nur Next.js Server Components für Static Render — kein Custom-Backend)
- Externe APIs

## 9. Ordnerstruktur

```
exchange-bot/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                   # Landing
│   ├── quiz/
│   │   └── page.tsx               # 13-Step Quiz (client component)
│   └── results/
│       └── page.tsx               # Results page
├── components/
│   ├── ui/                        # shadcn/ui primitives
│   ├── thesis-card.tsx
│   ├── progress-dots.tsx
│   ├── university-hero.tsx        # Top-1-Uni Hero-Card
│   └── university-row.tsx         # Runnerup-Row
├── data/
│   ├── universities.ts            # ~180 Unis
│   ├── theses.ts                  # 13 Thesen
│   └── reasons.ts                 # Begründungs-Templates
├── lib/
│   ├── scoring.ts                 # Core Matching-Algorithm
│   ├── types.ts                   # University, Thesis, Answer, Dimension
│   └── utils.ts                   # Tailwind-Helpers
├── vercel.ts
├── package.json
└── README.md
```

## 10. Implementation-Phasen (Vorschau)

1. **Scaffolding:** Next.js 16 Projekt, shadcn/ui Init, Tailwind, Ordner-Struktur
2. **Datenmodell & Types:** `lib/types.ts`, Dimension-Enum, Skeleton-Files
3. **Thesen definieren:** 13 Thesen mit Vektoren in `data/theses.ts`
4. **Scoring-Logik:** `lib/scoring.ts` mit Unit-Tests
5. **Uni-Daten generieren:** `data/universities.ts` (~180 Einträge)
6. **Landing-Screen**
7. **Quiz-Screen** (inkl. State-Management, Auto-Advance)
8. **Results-Screen** (Hero + Runnerup-Liste)
9. **Polish:** Motion-Transitions, Responsive-Feintuning
10. **Deploy-Ready-Check** (build, lint, vercel.ts)

Details kommen im Implementation-Plan.

## 11. Offene Fragen / Design-Entscheidungen für später

- **State-Handling im Quiz:** Pure React state (useState) oder URL-query-params für browser-back-Nav? → Entscheidung im Implementation-Plan.
- **Quiz-Abbruch-UX:** Was passiert, wenn der User mittendrin die Seite verlässt? (Aktuell: Reload = Neustart — OK für MVP.)
- **Barrierefreiheit:** Keyboard-Nav definitiv, Screen-Reader-Labels auch, aber keine WCAG-Level-Zertifizierung.
- **Phase-2-Erweiterungen:** LLM-Reasoning, Karten-Visualisierung, Share-Link — im Plan als "Out of Scope" vermerken.
