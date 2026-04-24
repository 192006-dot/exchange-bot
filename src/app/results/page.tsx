'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { universities } from '@/data/universities';
import { theses } from '@/data/theses';
import { buildUserVector, rankWithFilters, userSignalStrength } from '@/lib/scoring';
import { getGpaSafety } from '@/lib/safety';
import { reasonTemplates } from '@/data/reason-templates';
import { UniversityRow } from '@/components/university-row';
import { NavTop } from '@/components/nav-top';
import { RadarChart } from '@/components/radar-chart';
import { CompareGrid } from '@/components/compare-grid';
import { ActionBar } from '@/components/action-bar';
import type { Answer, AnswerValue } from '@/lib/types';
import { MAX_USER_GPA, MIN_USER_GPA } from '@/data/gpa-cutoffs';

const SAFETY_HERO_STYLES: Record<string, string> = {
  safe: 'bg-emerald-50 text-emerald-700',
  stretch: 'bg-amber-50 text-amber-700',
  risky: 'bg-red-50 text-red-700',
  unknown: 'bg-zinc-100 text-zinc-600',
};

function ResultsContent() {
  const params = useSearchParams();
  const rawAnswers = params.get('answers');
  const rawGpa = params.get('gpa');
  const rawExcluded = params.get('excluded');

  const gpa = rawGpa ? Number.parseFloat(rawGpa) : NaN;
  const gpaValid = !Number.isNaN(gpa) && gpa >= MIN_USER_GPA && gpa <= MAX_USER_GPA;

  if (!rawAnswers || !gpaValid) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-zinc-500 mb-6">Keine (vollständigen) Antworten gefunden.</p>
          <Link href="/quiz" className="text-zinc-950 underline">
            Quiz starten
          </Link>
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
  const signal = userSignalStrength(user);
  const weakSignal = signal < 15;
  const ranked = rankWithFilters(user, universities, gpa, excluded);
  const filteredOut = universities.length - ranked.length;
  const top = ranked[0];
  const runnerups = ranked.slice(1, 5);

  // Encode current Results URL so Detail pages can link back to it
  // (preserves answers + excluded state on return)
  const backQuery = encodeURIComponent(`/results?${params.toString()}`);
  const detailHref = (uniId: string) =>
    `/uni/${uniId}?gpa=${gpa.toFixed(2)}&back=${backQuery}`;

  if (!top) {
    return (
      <main className="min-h-screen px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <NavTop />
          <div className="mt-12 rounded-3xl border border-zinc-200 p-10 text-center">
            <p className="text-zinc-500 mb-4">
              Bei GPA {gpa.toFixed(2)} und deinen Ausschlüssen blieb keine erreichbare Uni
              übrig.
            </p>
            <Link href="/quiz" className="text-zinc-950 underline font-medium">
              Quiz anpassen →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const safety = getGpaSafety(gpa, top.university.id);
  const safetyHeroClass = SAFETY_HERO_STYLES[safety.tier];

  return (
    <main className="min-h-screen px-6 pb-16 bg-zinc-50/50">
      <div className="max-w-5xl mx-auto">
        <NavTop />

        {/* Header */}
        <div className="mt-6 mb-8 flex flex-wrap justify-between items-baseline gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600 mb-1.5">
              Dein Ergebnis
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.035em] leading-none text-zinc-950">
              Top-Match.
            </h1>
          </div>
          <div className="text-right text-[13px] text-zinc-500 leading-relaxed">
            <div>
              <strong className="text-zinc-900">GPA {gpa.toFixed(2)}</strong> eingegeben
            </div>
            <div>
              {ranked.length} von {universities.length} Unis erreichbar
              {filteredOut > 0 && ` · ${filteredOut} ausgefiltert`}
              {excluded.length > 0 && ` · ${excluded.length} Länder ausgeschlossen`}
            </div>
          </div>
        </div>

        {weakSignal && (
          <div className="mb-5 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
            Du hast viele Thesen neutral beantwortet — die Empfehlung ist dadurch weniger
            präzise.
            <Link href="/quiz" className="ml-2 underline font-medium">
              Nochmal stärker antworten
            </Link>
          </div>
        )}

        {/* Hero match card */}
        <div className="bg-white rounded-[28px] overflow-hidden border border-zinc-200 shadow-[0_4px_30px_-8px_rgba(0,0,0,0.08)]">
          {/* Top of hero */}
          <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 justify-between items-start bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-200">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 text-sm text-zinc-500 mb-3">
                <span>{top.university.flag}</span>
                <span>
                  {top.university.city} · {top.university.country}
                </span>
              </div>
              <h2 className="text-3xl md:text-[40px] font-bold tracking-[-0.025em] leading-[1.05] text-zinc-950 mb-2">
                {top.university.name}
              </h2>
              <div
                className={`inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full text-xs font-semibold ${safetyHeroClass}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {safety.detail}
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <div className="text-[72px] md:text-[96px] font-bold tracking-[-0.05em] text-zinc-950 leading-[0.95]">
                {Math.round(top.percent)}%
              </div>
              <div className="text-[11px] uppercase tracking-[0.1em] text-zinc-500 font-semibold">
                Match
              </div>
            </div>
          </div>

          {/* Body: radar + reasons */}
          <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-10 md:gap-12 items-center">
            <div className="w-full max-w-[320px] mx-auto md:mx-0 aspect-square">
              <RadarChart scores={top.university.scores} size={320} />
            </div>
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500 mb-5">
                Warum das dein Top-Match ist
              </h3>
              <div className="space-y-2.5">
                {top.topReasons.slice(0, 3).map(dim => (
                  <div
                    key={dim}
                    className="flex items-start gap-3 px-4 py-3.5 bg-zinc-50 rounded-2xl"
                  >
                    <div className="shrink-0 w-7 h-7 rounded-lg bg-emerald-500 text-white grid place-items-center mt-0.5">
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    </div>
                    <div className="text-[14px] text-zinc-900 leading-[1.5]">
                      {reasonTemplates[dim](top.university)}
                    </div>
                  </div>
                ))}
                {/* Extra highlight from uni */}
                {top.university.highlights[0] && (
                  <div className="flex items-start gap-3 px-4 py-3.5 bg-zinc-50 rounded-2xl">
                    <div className="shrink-0 w-7 h-7 rounded-lg bg-emerald-500 text-white grid place-items-center mt-0.5">
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    </div>
                    <div className="text-[14px] text-zinc-900 leading-[1.5]">
                      {top.university.highlights[0]}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <ActionBar
            uni={top.university}
            matchPercent={top.percent}
            detailHref={detailHref(top.university.id)}
          />
        </div>

        {/* Runner-ups */}
        {runnerups.length > 0 && (
          <>
            <div className="mt-12 mb-4 flex justify-between items-baseline">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                Auch stark für dich
              </h3>
              <span className="text-[13px] text-zinc-500">
                {ranked.length} Unis erreichbar
              </span>
            </div>
            <div className="space-y-2.5">
              {runnerups.map((r, i) => (
                <Link
                  key={r.university.id}
                  href={detailHref(r.university.id)}
                  className="block"
                >
                  <UniversityRow rank={i + 2} result={r} userGpa={gpa} />
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Compare Top-3 */}
        {ranked.length >= 3 && (
          <>
            <div className="mt-12 mb-4 flex justify-between items-baseline">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                Top 3 vergleichen
              </h3>
            </div>
            <CompareGrid results={ranked} userGpa={gpa} />
          </>
        )}

        <div className="mt-16 text-center">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-900 underline"
          >
            Nochmal
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center text-zinc-400">
          Lädt…
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
