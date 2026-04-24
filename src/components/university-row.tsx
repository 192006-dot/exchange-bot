import type { MatchResult } from '@/lib/types';

type Props = { rank: number; result: MatchResult };

export function UniversityRow({ rank, result }: Props) {
  const { university, percent } = result;
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border border-zinc-200 rounded-xl">
      <div className="text-sm text-zinc-400 w-7 shrink-0">#{rank}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold text-zinc-950 truncate">
          {university.name} · {university.city} {university.flag}
        </div>
        <div className="text-xs text-zinc-500 mt-0.5 truncate">
          {university.highlights[0]}
        </div>
      </div>
      <div className="text-base font-semibold text-zinc-800 shrink-0">{Math.round(percent)}%</div>
    </div>
  );
}
