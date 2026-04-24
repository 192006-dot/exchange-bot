'use client';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

type Props = {
  /** If provided, renders a "Zurück" button on the right that calls this handler. */
  onBack?: () => void;
};

export function NavTop({ onBack }: Props) {
  return (
    <header className="w-full flex items-center justify-between py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-950 hover:opacity-60 transition-opacity"
        aria-label="Zur Homepage"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-zinc-950 text-white">
          <Sparkles className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <span className="text-[15px]">Home</span>
      </Link>
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-950 hover:opacity-60 transition-opacity cursor-pointer"
          aria-label="Zurück zum vorherigen Schritt"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          <span>Zurück</span>
        </button>
      )}
    </header>
  );
}
