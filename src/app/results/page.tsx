'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { universities } from '@/data/universities';
import { theses } from '@/data/theses';
import { buildUserVector, rankWithFilters } from '@/lib/scoring';
import { UniversityHero } from '@/components/university-hero';
import { UniversityRow } from '@/components/university-row';
import { NavTop } from '@/components/nav-top';
import type { Answer, AnswerValue } from '@/lib/types';
import { MAX_USER_GPA, MIN_USER_GPA } from '@/data/gpa-cutoffs';

function ResultsContent() {
  const params = useSearchParams();
  const rawAnswers = params.get('answers');
  const rawGpa = params.get('gpa');
  const rawExcluded = params.get('excluded');

  const gpa = rawGpa ? Number.parseFloat(rawGpa) : NaN;
  const gpaValid = !Number.isNaN(gpa) && gpa >= MIN_USER_GPA && gpa <= MAX_USER_GPA;

  if (!rawAnswers || !gpaValid) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-6">Keine (vollständigen) Antworten gefunden.</p>
          <Link href="/quiz" className="text-zinc-950 underline">Quiz starten</Link>
        </div>
      </main>
    );
  }

  let values: (AnswerValue | null)[] = [];
  try {
    values = JSON.parse(decodeURIComponent(rawAnswers));
  } catch {
    values = [];
  }

  let excluded: string[] = [];
  try {
    excluded = rawExcluded ? JSON.parse(decodeURIComponent(rawExcluded)) : [];
  } catch {
    excluded = [];
  }

  const answers: Answer[] = values
    .map((v, i) => (v === null ? null : { thesisId: theses[i].id, value: v }))
    .filter((a): a is Answer => a !== null);

  const user = buildUserVector(answers, theses);
  const ranked = rankWithFilters(user, universities, gpa, excluded);
  const filteredOut = universities.length - ranked.length;
  const top = ranked[0];
  const runnerups = ranked.slice(1, 5);

  return (
    <main className="min-h-screen px-6 pb-16">
      <div className="max-w-2xl mx-auto">
        <NavTop />
        <div className="flex items-baseline justify-between mt-10 mb-6">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
            Dein Top-Match
          </p>
          <p className="text-xs text-zinc-400">
            GPA {gpa.toFixed(2)} · {ranked.length} erreichbar
            {filteredOut > 0 && ` · ${filteredOut} ausgefiltert`}
            {excluded.length > 0 && ` · ${excluded.length} Länder ausgeschlossen`}
          </p>
        </div>

        {top ? (
          <UniversityHero result={top} />
        ) : (
          <div className="rounded-3xl border border-zinc-200 p-9 text-center">
            <p className="text-zinc-500 mb-4">
              Bei GPA {gpa.toFixed(2)} waren alle Unis in unserem Datensatz zu kompetitiv.
            </p>
            <Link href="/quiz" className="text-zinc-950 underline">
              GPA korrigieren
            </Link>
          </div>
        )}

        {runnerups.length > 0 && (
          <>
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mt-10 mb-3">
              Auch stark für dich
            </p>
            <div className="space-y-2">
              {runnerups.map((r, i) => (
                <UniversityRow key={r.university.id} rank={i + 2} result={r} />
              ))}
            </div>
          </>
        )}

        <div className="mt-12 text-center">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 underline">
            Nochmal
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
