import type { Dimension, MatchResult } from '@/lib/types';
import { getGpaSafety } from '@/lib/safety';

const ROWS: { dim: Dimension; label: string }[] = [
  { dim: 'academic', label: 'Academic' },
  { dim: 'cost', label: 'Cost' },
  { dim: 'climate', label: 'Climate' },
  { dim: 'career', label: 'Career' },
  { dim: 'travel', label: 'Travel' },
];

type Props = {
  results: MatchResult[];
  userGpa: number;
};

function ScoreBar({ score }: { score: number }) {
  // Render 5 bars, 'score' of them filled
  return (
    <div className="flex items-center gap-[3px]">
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`w-[6px] h-4 rounded-sm ${i <= score ? 'bg-zinc-950' : 'bg-zinc-200'}`}
        />
      ))}
    </div>
  );
}

export function CompareGrid({ results, userGpa }: Props) {
  const top3 = results.slice(0, 3);
  if (top3.length < 3) return null;

  return (
    <div className="grid grid-cols-[140px_repeat(3,minmax(0,1fr))] gap-px bg-zinc-200 rounded-2xl overflow-hidden text-sm">
      {/* Header row */}
      <div className="bg-zinc-50 px-4 py-5" />
      {top3.map(r => (
        <div key={r.university.id} className="bg-zinc-50 px-4 py-5">
          <span className="text-xl block mb-1">{r.university.flag}</span>
          <span className="text-[13px] font-semibold tracking-tight text-zinc-950 block leading-tight">
            {r.university.name}
          </span>
          <span className="text-xs text-zinc-500 block mt-0.5">{r.university.city}</span>
        </div>
      ))}

      {/* Score rows */}
      {ROWS.map(row => (
        <RowFragment key={row.dim}>
          <div className="bg-zinc-50 px-4 py-3 text-[11px] uppercase tracking-wider font-medium text-zinc-600 flex items-center">
            {row.label}
          </div>
          {top3.map(r => (
            <div key={r.university.id} className="bg-white px-4 py-3 flex items-center">
              <ScoreBar score={r.university.scores[row.dim]} />
            </div>
          ))}
        </RowFragment>
      ))}

      {/* GPA Cutoff row */}
      <div className="bg-zinc-50 px-4 py-3 text-[11px] uppercase tracking-wider font-medium text-zinc-600 flex items-center">
        GPA-Cutoff
      </div>
      {top3.map(r => {
        const safety = getGpaSafety(userGpa, r.university.id);
        const colorClass =
          safety.tier === 'safe'
            ? 'text-emerald-700'
            : safety.tier === 'stretch'
              ? 'text-amber-700'
              : safety.tier === 'risky'
                ? 'text-red-700'
                : 'text-zinc-500';
        return (
          <div key={r.university.id} className={`bg-white px-4 py-3 text-[13px] font-semibold ${colorClass}`}>
            {safety.cutoff !== null ? `${safety.cutoff.toFixed(2)} · ${safety.tier}` : 'keine Daten'}
          </div>
        );
      })}
    </div>
  );
}

function RowFragment({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
