'use client';
import { useState } from 'react';
import { MIN_USER_GPA, MAX_USER_GPA } from '@/data/gpa-cutoffs';

type Props = {
  onSubmit: (gpa: number) => void;
};

export function GpaInput({ onSubmit }: Props) {
  const [value, setValue] = useState<string>('');
  const parsed = Number.parseFloat(value.replace(',', '.'));
  const isValid =
    !Number.isNaN(parsed) && parsed >= MIN_USER_GPA && parsed <= MAX_USER_GPA;

  function handleSubmit() {
    if (isValid) onSubmit(parsed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && isValid) handleSubmit();
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-zinc-400 mb-3">
        Schritt 1 von 3
      </p>
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-zinc-950 mb-4">
        Was ist dein aktueller GPA?
      </h2>
      <p className="text-zinc-500 leading-relaxed mb-12 max-w-lg">
        In Maastricht werden Exchange-Plätze nach GPA vergeben (10-Punkte-Skala). Damit du nur Unis
        siehst, die für dich realistisch erreichbar sind, brauche ich deinen aktuellen
        Notendurchschnitt.
      </p>

      <div className="flex items-baseline gap-4 mb-8">
        <input
          type="text"
          inputMode="decimal"
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="7.5"
          aria-label="GPA eingeben"
          className="w-44 text-6xl font-bold tracking-tight text-zinc-950 bg-transparent border-b-2 border-zinc-200 focus:border-zinc-950 outline-none pb-2 transition-colors"
        />
        <span className="text-base text-zinc-400">/ 10.0</span>
      </div>

      <p className="text-sm text-zinc-400 mb-8">
        Typischer Bereich: 6.0 bis 9.5. Wenn du ihn genau kennst, gerne auf 2 Nachkommastellen
        (z.B. 7.86).
      </p>

      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 text-white px-7 h-12 text-base font-medium transition-all hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed cursor-pointer"
      >
        Weiter →
      </button>

      {value && !isValid && parsed >= 0 && (
        <p className="mt-4 text-sm text-red-600">
          Bitte einen Wert zwischen {MIN_USER_GPA.toFixed(1)} und {MAX_USER_GPA.toFixed(1)} eingeben.
        </p>
      )}
    </div>
  );
}
