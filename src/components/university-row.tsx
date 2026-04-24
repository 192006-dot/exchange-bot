import type { MatchResult } from '@/lib/types';

type Props = { rank: number; result: MatchResult };

export function UniversityRow({ rank, result }: Props) {
  const { university, percent } = result;
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 border border-zinc-200 rounded-xl">
      <div className="text-sm text-zinc-400 w-7 shrink-0 pt-0.5">#{rank}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold text-zinc-950 leading-snug">
          {university.name}
        </div>
        <div className="text-xs text-zinc-500 mt-1 leading-snug">
          {university.flag} {university.city} · {university.country}
        </div>
        <div className="text-xs text-zinc-500 mt-1 leading-snug">
          {university.highlights[0]}
        </div>
      </div>
      <div className="text-base font-semibold text-zinc-800 shrink-0 pt-0.5">{Math.round(percent)}%</div>
    </div>
  );
}
