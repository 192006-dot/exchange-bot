import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function NavTop() {
  return (
    <header className="w-full pt-4 pb-2">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-950 hover:opacity-70 transition-opacity"
        aria-label="Zur Homepage"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-zinc-950 text-white">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
        Uni-Matcher
      </Link>
    </header>
  );
}
