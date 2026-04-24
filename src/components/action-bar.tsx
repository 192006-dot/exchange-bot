'use client';
import { useState } from 'react';
import { Download, Link2, Mail, Check } from 'lucide-react';
import type { University } from '@/lib/types';

const SBE_EXCHANGE_URL =
  'https://www.maastrichtuniversity.nl/support/during-your-studies/exchange-opportunities/outgoing-exchange';

type Props = {
  uni: University;
  matchPercent: number;
};

export function ActionBar({ uni, matchPercent }: Props) {
  const [copied, setCopied] = useState(false);

  function onCopyLink() {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function onPdf() {
    if (typeof window === 'undefined') return;
    window.print();
  }

  const subject = encodeURIComponent(`Mein Top-Match: ${uni.name} (${Math.round(matchPercent)}%)`);
  const body = encodeURIComponent(
    `Uni-Matcher hat mir ${uni.name} in ${uni.city} empfohlen — ${Math.round(matchPercent)}% Match.\n\nLink: ${typeof window !== 'undefined' ? window.location.href : ''}`,
  );

  return (
    <div className="px-6 md:px-10 py-5 flex flex-wrap items-center justify-between gap-3 bg-zinc-50 border-t border-zinc-200">
      <div className="flex flex-wrap gap-2.5">
        <a
          href={SBE_EXCHANGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-zinc-950 text-white px-5 h-10 rounded-full text-[13px] font-medium hover:bg-zinc-800 transition"
        >
          Bewerben auf SBE-Portal →
        </a>
      </div>
      <div className="flex gap-1">
        <button
          onClick={onPdf}
          aria-label="Als PDF speichern"
          title="Als PDF speichern"
          className="w-9 h-9 rounded-xl bg-white border border-zinc-200 grid place-items-center text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition cursor-pointer"
        >
          <Download className="h-4 w-4" strokeWidth={2} />
        </button>
        <button
          onClick={onCopyLink}
          aria-label="Link kopieren"
          title="Link kopieren"
          className="w-9 h-9 rounded-xl bg-white border border-zinc-200 grid place-items-center text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition cursor-pointer"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" strokeWidth={2.5} /> : <Link2 className="h-4 w-4" strokeWidth={2} />}
        </button>
        <a
          href={`mailto:?subject=${subject}&body=${body}`}
          aria-label="Per Email schicken"
          title="Per Email schicken"
          className="w-9 h-9 rounded-xl bg-white border border-zinc-200 grid place-items-center text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition"
        >
          <Mail className="h-4 w-4" strokeWidth={2} />
        </a>
      </div>
    </div>
  );
}
