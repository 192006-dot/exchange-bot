# Uni-Matcher

Valomat-style matcher for Maastricht University partner exchange universities. Answer 13 theses, get a ranked list of partner unis with match percentage and reasoning.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript 5**
- **Tailwind CSS 4** · **shadcn/ui** (Nova preset) · **Motion** for transitions
- **Vitest** for unit tests
- **Static data** — no backend, no DB, no external APIs

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm test` | Vitest one-shot |
| `npm run test:watch` | Vitest watch mode |

## Architecture

- **12 dimensions** — scoring axes (academic, cost, english, language, climate, city, nature, travel, career, adventure, social, easy)
- **13 valomat-style theses** — each has a dimension vector; user answers on a 5-point scale
- **Client-side scoring** — dot-product style similarity between user vector and uni vector, yielding a 0–100% match
- **~20 seed universities** (Phase 1) — full ~180 expansion planned

## Project structure

```
src/
├── app/          Landing / Quiz / Results pages (Next.js App Router)
├── components/   Thesis card, progress dots, result hero + rows
├── data/         Theses, universities, reason templates
└── lib/          Types, scoring algorithm
tests/            Vitest unit tests
docs/superpowers/ Design spec + implementation plan
```

See [docs/superpowers/specs/2026-04-24-uni-matcher-design.md](docs/superpowers/specs/2026-04-24-uni-matcher-design.md) for the full design.
