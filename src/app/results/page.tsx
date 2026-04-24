'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { universities } from '@/data/universities';
import { theses } from '@/data/theses';
import { buildUserVector, rankUniversities } from '@/lib/scoring';
import { UniversityHero } from '@/components/university-hero';
import { UniversityRow } from '@/components/university-row';
import type { Answer, AnswerValue } from '@/lib/types';

function ResultsContent() {
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

  let values: (AnswerValue | null)[] = [];
  try {
    values = JSON.parse(decodeURIComponent(raw));
  } catch {
    values = [];
  }

  const answers: Answer[] = values
    .map((v, i) => (v === null ? null : { thesisId: theses[i].id, value: v }))
    .filter((a): a is Answer => a !== null);

  const user = buildUserVector(answers, theses);
  const ranked = rankUniversities(user, universities);
  const top = ranked[0];
  const runnerups = ranked.slice(1, 5);

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3">
          Dein Top-Match
        </p>
        {top && <UniversityHero result={top} />}
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

export default function ResultsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center text-zinc-400">Lädt…</main>}>
      <ResultsContent />
    </Suspense>
  );
}
