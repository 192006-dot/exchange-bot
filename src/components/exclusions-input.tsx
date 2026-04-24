'use client';
import { useMemo, useState } from 'react';
import { universities } from '@/data/universities';
import type { Continent } from '@/lib/types';

type Props = {
  onSubmit: (excluded: string[]) => void;
};

const CONTINENT_LABELS: Record<Continent, string> = {
  europe: 'Europa',
  'north-america': 'Nordamerika',
  'latin-america': 'Lateinamerika',
  'east-asia': 'Ostasien',
  'southeast-asia': 'Südostasien',
  australasia: 'Australasien',
  'africa-me': 'Afrika & Naher Osten',
};

export function ExclusionsInput({ onSubmit }: Props) {
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  // Extract unique countries grouped by continent, sorted alphabetically within each
  const grouped = useMemo(() => {
    const byContinent = new Map<Continent, Map<string, string>>();
    for (const u of universities) {
      if (!byContinent.has(u.continent)) byContinent.set(u.continent, new Map());
      byContinent.get(u.continent)!.set(u.country, u.flag);
    }
    const result: Array<{ continent: Continent; countries: Array<{ name: string; flag: string }> }> = [];
    const order: Continent[] = [
      'europe', 'north-america', 'latin-america',
      'east-asia', 'southeast-asia', 'australasia', 'africa-me',
    ];
    for (const continent of order) {
      const map = byContinent.get(continent);
      if (!map) continue;
      const countries = Array.from(map.entries())
        .map(([name, flag]) => ({ name, flag }))
        .sort((a, b) => a.name.localeCompare(b.name, 'de'));
      result.push({ continent, countries });
    }
    return result;
  }, []);

  function toggle(country: string) {
    const next = new Set(excluded);
    if (next.has(country)) next.delete(country);
    else next.add(country);
    setExcluded(next);
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-zinc-400 mb-3">
        Schritt 2 von 3
      </p>
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-zinc-950 mb-4">
        Gibt es Länder, die du komplett ausschließen willst?
      </h2>
      <p className="text-zinc-500 leading-relaxed mb-8 max-w-xl">
        Politische Lage, Menschenrechte, persönliche Gründe — egal warum. Angeklickte Länder werden
        <span className="text-zinc-900 font-medium"> nicht </span>
        im Ergebnis auftauchen, ganz unabhängig von Match-Prozent.
      </p>

      <div className="space-y-7 mb-8">
        {grouped.map(({ continent, countries }) => (
          <div key={continent}>
            <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-3">
              {CONTINENT_LABELS[continent]}
            </p>
            <div className="flex flex-wrap gap-2">
              {countries.map(({ name, flag }) => {
                const isExcluded = excluded.has(name);
                return (
                  <button
                    key={name}
                    onClick={() => toggle(name)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                      isExcluded
                        ? 'bg-red-50 border-red-200 text-red-700 line-through decoration-red-400'
                        : 'bg-white border-zinc-200 text-zinc-900 hover:border-zinc-400'
                    }`}
                  >
                    <span className={isExcluded ? 'opacity-60' : ''}>{flag}</span>
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-6 flex items-center gap-4 pt-4 border-t border-zinc-200 bg-white/90 backdrop-blur-sm">
        <div className="flex-1 text-sm">
          {excluded.size === 0 ? (
            <span className="text-zinc-500">Kein Land ausgeschlossen.</span>
          ) : (
            <span className="text-zinc-900 font-medium">
              {excluded.size} {excluded.size === 1 ? 'Land' : 'Länder'} ausgeschlossen
              {excluded.size > 3 && (
                <button
                  onClick={() => setExcluded(new Set())}
                  className="ml-3 text-xs text-zinc-500 underline hover:text-zinc-900"
                >
                  zurücksetzen
                </button>
              )}
            </span>
          )}
        </div>
        <button
          onClick={() => onSubmit(Array.from(excluded))}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 text-white px-7 h-12 text-base font-medium transition-all hover:bg-zinc-800 cursor-pointer"
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}
