import type { MatchResult } from '@/lib/types';
import { getGpaSafety } from '@/lib/safety';

type Props = {
  rank: number;
  result: MatchResult;
  userGpa: number;
};

const SAFETY_STYLES: Record<string, string> = {
  safe: 'bg-emerald-50 text-emerald-700',
  stretch: 'bg-amber-50 text-amber-700',
  risky: 'bg-red-50 text-red-700',
  unknown: 'bg-zinc-100 text-zinc-600',
};

export function UniversityRow({ rank, result, userGpa }: Props) {
  const { university, percent } = result;
  const safety = getGpaSafety(userGpa, university.id);
  const safetyClass = SAFETY_STYLES[safety.tier];
  return (
    <div className="flex items-center gap-5 px-6 py-5 bg-white border border-zinc-200 rounded-2xl transition-colors hover:border-zinc-400">
      <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-600 grid place-items-center font-semibold text-sm shrink-0">
        #{rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-base font-semibold text-zinc-950 tracking-tight leading-tight">
          {university.name}
        </div>
        <div className="text-sm text-zinc-500 mt-1">
          {university.flag} {university.city} · {university.country}
        </div>
        <div className="text-xs text-zinc-500 mt-1 truncate">{university.highlights[0]}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-2xl font-bold tracking-[-0.02em] text-zinc-950 leading-none">
          {Math.round(percent)}%
        </div>
        <span
          className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold ${safetyClass}`}
        >
          {safety.label}
        </span>
      </div>
    </div>
  );
}
