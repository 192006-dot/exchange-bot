import type { MatchResult } from '@/lib/types';
import { reasonTemplates } from '@/data/reason-templates';

export function UniversityHero({ result }: { result: MatchResult }) {
  const { university, percent, topReasons } = result;
  return (
    <div className="rounded-3xl bg-gradient-to-b from-zinc-50 to-zinc-100 border border-zinc-200 p-9">
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
        <span>{university.flag}</span>
        <span>{university.city} · {university.country}</span>
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-zinc-950 mb-6 leading-tight">
        {university.name}
      </h2>
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-7xl font-bold tracking-tighter text-zinc-950 leading-none">
          {Math.round(percent)}%
        </span>
        <span className="text-xs uppercase tracking-widest text-zinc-500">Match</span>
      </div>
      {topReasons.length > 0 && (
        <ul className="space-y-0 divide-y divide-zinc-200">
          {topReasons.map(dim => (
            <li key={dim} className="py-3 text-[15px] text-zinc-800 flex gap-2.5">
              <span className="text-green-600 font-bold">✓</span>
              <span>{reasonTemplates[dim](university)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
