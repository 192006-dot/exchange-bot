import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Check, ArrowLeft, Globe, Languages, Thermometer, Wallet, GraduationCap, Plane, Building2, Mountain, TrendingUp, Compass, Users, Sparkles } from 'lucide-react';
import type { Dimension } from '@/lib/types';
import { universities } from '@/data/universities';
import { gpaCutoffs } from '@/data/gpa-cutoffs';
import { getGpaSafety } from '@/lib/safety';
import { NavTop } from '@/components/nav-top';
import { RadarChart } from '@/components/radar-chart';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gpa?: string; back?: string }>;
};

export async function generateStaticParams() {
  return universities.map(u => ({ id: u.id }));
}

const DIM_META: Record<Dimension, { label: string; hint: string; icon: React.ReactNode }> = {
  academic: { label: 'Academic', hint: 'Ranking & Exzellenz', icon: <GraduationCap className="h-4 w-4" /> },
  cost: { label: 'Kosten', hint: 'günstig = 5', icon: <Wallet className="h-4 w-4" /> },
  english: { label: 'English', hint: 'Englisch im Alltag', icon: <Languages className="h-4 w-4" /> },
  language: { label: 'Fremdsprache', hint: 'lokale Sprach-Immersion', icon: <Languages className="h-4 w-4" /> },
  climate: { label: 'Klima', hint: 'warm = 5', icon: <Thermometer className="h-4 w-4" /> },
  city: { label: 'Großstadt', hint: 'Metropolen-Vibe', icon: <Building2 className="h-4 w-4" /> },
  nature: { label: 'Natur', hint: 'Outdoor-Zugang', icon: <Mountain className="h-4 w-4" /> },
  travel: { label: 'Travel-Hub', hint: 'Reise-Zugang', icon: <Plane className="h-4 w-4" /> },
  career: { label: 'Career', hint: 'Karriere-Boost', icon: <TrendingUp className="h-4 w-4" /> },
  adventure: { label: 'Abenteuer', hint: 'Kulturschock', icon: <Compass className="h-4 w-4" /> },
  social: { label: 'Exchange-Vibe', hint: 'Int. Community', icon: <Users className="h-4 w-4" /> },
  easy: { label: 'Admin-Easy', hint: 'Visa / Bürokratie', icon: <Sparkles className="h-4 w-4" /> },
};

const ACADEMIC_LABELS = ['', 'Solide regional', 'Gut', 'Strong', 'Top-200 weltweit', 'Top-50 weltweit'];
const COST_LABELS = ['', 'Sehr teuer', 'Teuer', 'Mittel', 'Günstig', 'Sehr günstig'];
const CLIMATE_LABELS = ['', 'Kalt', 'Kühl', 'Mild', 'Warm', 'Heiß / Tropisch'];
const LANGUAGE_OF_INSTRUCTION_LABEL: Record<string, string> = {
  english: 'Komplett Englisch',
  mixed: 'Mixed (Englisch verfügbar)',
  local: 'Primär Landessprache',
};
const CONTINENT_LABELS: Record<string, string> = {
  europe: 'Europa',
  'north-america': 'Nordamerika',
  'latin-america': 'Lateinamerika',
  'east-asia': 'Ostasien',
  'southeast-asia': 'Südostasien',
  australasia: 'Australasien',
  'africa-me': 'Afrika & Naher Osten',
};
const SAFETY_BANNER_STYLES: Record<string, string> = {
  safe: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  stretch: 'bg-amber-50 border-amber-200 text-amber-900',
  risky: 'bg-red-50 border-red-200 text-red-900',
  unknown: 'bg-zinc-50 border-zinc-200 text-zinc-700',
};

export default async function UniDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { gpa: gpaStr, back: backParam } = await searchParams;
  const uni = universities.find(u => u.id === id);
  if (!uni) notFound();

  const gpa = gpaStr ? Number.parseFloat(gpaStr) : NaN;
  const hasGpa = !Number.isNaN(gpa);
  const safety = hasGpa ? getGpaSafety(gpa, uni.id) : null;
  const cutoff = gpaCutoffs[uni.id];

  // Use the `back` param if it's a safe same-origin path; otherwise
  // fall back to a best-effort results URL or homepage.
  const safeBack =
    backParam && backParam.startsWith('/') && !backParam.startsWith('//')
      ? backParam
      : null;
  const backHref = safeBack ?? (hasGpa ? `/results?gpa=${gpa.toFixed(2)}` : '/');

  const allDims: Dimension[] = [
    'academic', 'career', 'social', 'city', 'nature', 'climate',
    'travel', 'cost', 'english', 'language', 'adventure', 'easy',
  ];

  return (
    <main className="min-h-screen px-6 pb-20 bg-white text-zinc-950">
      <div className="max-w-5xl mx-auto">
        <NavTop />

        {/* Back link */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-zinc-500 hover:text-zinc-950 transition"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          {hasGpa ? 'Zurück zu Ergebnissen' : 'Zurück'}
        </Link>

        {/* Hero */}
        <header className="mt-8 relative overflow-hidden rounded-[28px] border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30 px-8 md:px-12 py-12 md:py-16">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600 mb-3">
                <Globe className="h-3.5 w-3.5" />
                {CONTINENT_LABELS[uni.continent]}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-[-0.03em] leading-[1.05] text-zinc-950 mb-4">
                {uni.name}
              </h1>
              <div className="flex items-center gap-2 text-base text-zinc-600">
                <span className="text-xl">{uni.flag}</span>
                <span>{uni.city} · {uni.country}</span>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {uni.partner_levels.map(level => (
                  <span
                    key={level}
                    className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold bg-zinc-950 text-white"
                  >
                    {level}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-white border border-zinc-200 text-zinc-700">
                  <Languages className="h-3.5 w-3.5" />
                  {LANGUAGE_OF_INSTRUCTION_LABEL[uni.language_of_instruction]}
                </span>
              </div>
            </div>
            <div className="text-[96px] md:text-[120px] leading-none shrink-0 select-none">
              {uni.flag}
            </div>
          </div>
        </header>

        {/* GPA Safety Banner */}
        {safety && (
          <div
            className={`mt-4 rounded-2xl border px-5 py-4 flex items-center gap-3 ${SAFETY_BANNER_STYLES[safety.tier]}`}
          >
            <div className="w-9 h-9 rounded-xl bg-white/50 grid place-items-center text-lg shrink-0">
              {safety.tier === 'safe' ? '✓' : safety.tier === 'stretch' ? '⚠' : safety.tier === 'risky' ? '⚠' : '?'}
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold">
                {safety.tier === 'safe' && 'Erreichbar bei deinem GPA'}
                {safety.tier === 'stretch' && 'Stretch — knapp am Cutoff'}
                {safety.tier === 'risky' && 'Wahrscheinlich zu kompetitiv'}
                {safety.tier === 'unknown' && 'Keine historischen Daten'}
              </div>
              <div className="text-[13px] opacity-80 mt-0.5">{safety.detail}</div>
            </div>
            <div className="text-[13px] opacity-70 font-medium shrink-0">
              GPA {gpa.toFixed(2)}
            </div>
          </div>
        )}

        {/* Key Stat Cards */}
        <section className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<GraduationCap className="h-4 w-4" />}
            label="Academic"
            value={`${uni.scores.academic}/5`}
            desc={ACADEMIC_LABELS[uni.scores.academic]}
            barValue={uni.scores.academic}
          />
          <StatCard
            icon={<Wallet className="h-4 w-4" />}
            label="Kosten"
            value={COST_LABELS[uni.scores.cost]}
            desc={uni.scores.cost >= 4 ? 'Stretch für knappes Budget' : uni.scores.cost <= 2 ? 'Teuer — plan ordentlich' : 'Durchschnittlich'}
            barValue={uni.scores.cost}
          />
          <StatCard
            icon={<Thermometer className="h-4 w-4" />}
            label="Klima"
            value={CLIMATE_LABELS[uni.scores.climate]}
            desc={uni.scores.climate >= 4 ? 'Warme Temperaturen ganzjährig' : uni.scores.climate <= 2 ? 'Kalte Winter üblich' : 'Gemäßigtes Klima'}
            barValue={uni.scores.climate}
          />
          <StatCard
            icon={<Sparkles className="h-4 w-4" />}
            label="GPA-Cutoff"
            value={cutoff !== undefined ? cutoff.toFixed(2) : '—'}
            desc={cutoff !== undefined ? 'Historisch min. GPA' : 'Keine Daten'}
            highlight
          />
        </section>

        {/* Highlights */}
        {uni.highlights.length > 0 && (
          <section className="mt-14">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600 mb-4">
              Highlights
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {uni.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-zinc-50 rounded-2xl px-5 py-4"
                >
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-emerald-500 text-white grid place-items-center mt-0.5">
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </div>
                  <div className="text-[15px] text-zinc-900 leading-[1.5]">{h}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Full 12-Dim Profile */}
        <section className="mt-14">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600 mb-4">
            Profil über alle 12 Dimensionen
          </h2>
          <div className="grid md:grid-cols-[320px_1fr] gap-10 items-center bg-zinc-50 rounded-3xl p-6 md:p-10">
            <div className="w-full max-w-[320px] mx-auto aspect-square">
              <RadarChart scores={uni.scores} size={320} />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {allDims.map(dim => (
                <DimBar key={dim} dim={dim} score={uni.scores[dim]} />
              ))}
            </div>
          </div>
        </section>

        {/* Meta Info */}
        <section className="mt-14">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600 mb-4">
            Austausch-Infos
          </h2>
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 grid md:grid-cols-2 gap-8">
            <MetaRow label="Kontinent" value={CONTINENT_LABELS[uni.continent]} />
            <MetaRow label="Stadt" value={`${uni.city} · ${uni.country} ${uni.flag}`} />
            <MetaRow
              label="Partner-Level"
              value={uni.partner_levels.join(' · ')}
            />
            <MetaRow
              label="Unterrichtssprache"
              value={LANGUAGE_OF_INSTRUCTION_LABEL[uni.language_of_instruction]}
            />
            <MetaRow
              label="GPA-Cutoff (historisch)"
              value={cutoff !== undefined ? `min. ${cutoff.toFixed(2)}` : 'Keine Daten'}
            />
            <MetaRow
              label="Uni-ID"
              value={uni.id}
              mono
            />
          </div>
        </section>

        {/* Footer CTA */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 bg-zinc-950 text-white px-7 h-12 rounded-full text-[14px] font-medium hover:bg-zinc-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            {hasGpa ? 'Zurück zu Ergebnissen' : 'Zur Homepage'}
          </Link>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 bg-white border border-zinc-200 text-zinc-900 px-7 h-12 rounded-full text-[14px] font-medium hover:border-zinc-400 transition"
          >
            Neues Quiz starten
          </Link>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon, label, value, desc, barValue, highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  desc: string;
  barValue?: number;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${highlight ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-white border-zinc-200'}`}>
      <div className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] font-semibold ${highlight ? 'text-zinc-400' : 'text-zinc-500'}`}>
        {icon}
        {label}
      </div>
      <div className={`mt-3 text-2xl md:text-[26px] font-bold tracking-[-0.02em] leading-tight ${highlight ? 'text-white' : 'text-zinc-950'}`}>
        {value}
      </div>
      <div className={`mt-1 text-[12px] ${highlight ? 'text-zinc-400' : 'text-zinc-500'}`}>{desc}</div>
      {barValue !== undefined && (
        <div className="mt-3 flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <span
              key={i}
              className={`flex-1 h-1.5 rounded-full ${i <= barValue ? 'bg-zinc-950' : 'bg-zinc-200'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DimBar({ dim, score }: { dim: Dimension; score: number }) {
  const meta = DIM_META[dim];
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0 w-7 h-7 rounded-lg bg-white border border-zinc-200 grid place-items-center text-zinc-600">
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[13px] font-semibold text-zinc-900">{meta.label}</span>
          <span className="text-[11px] text-zinc-400 tabular-nums">{score}/5</span>
        </div>
        <div className="mt-1 flex gap-[3px]">
          {[1, 2, 3, 4, 5].map(i => (
            <span
              key={i}
              className={`flex-1 h-1.5 rounded-full ${i <= score ? 'bg-emerald-500' : 'bg-zinc-200'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-zinc-500">{label}</div>
      <div className={`mt-1.5 text-[15px] text-zinc-950 ${mono ? 'font-mono text-[13px]' : ''}`}>{value}</div>
    </div>
  );
}
