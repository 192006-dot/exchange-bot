'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { buildUserVector, rankWithFilters } from '@/lib/scoring';
import { theses } from '@/data/theses';
import { universities } from '@/data/universities';
import type { Answer, AnswerValue } from '@/lib/types';

const PILL_VALUES: { value: AnswerValue; label: string }[] = [
  { value: -2, label: '--' },
  { value: -1, label: '-' },
  { value: 0, label: '0' },
  { value: 1, label: '+' },
  { value: 2, label: '++' },
];

type Props = {
  initialAnswers: (AnswerValue | null)[];
  userGpa: number;
  excluded: string[];
  originalTopId: string;
  originalTopName: string;
};

/**
 * Interactive "What-if" editor. Shows the user's most strongly-answered
 * theses and lets them slide each one up/down. Re-computes the ranking
 * on change and flags if the top-1 flipped.
 */
export function WhatIfPanel({
  initialAnswers,
  userGpa,
  excluded,
  originalTopId,
  originalTopName,
}: Props) {
  const [answers, setAnswers] = useState<(AnswerValue | null)[]>(initialAnswers);

  // Pick the 3 theses where the user answered most strongly
  const impactfulIndices = useMemo(() => {
    return initialAnswers
      .map((v, i) => ({ idx: i, abs: v === null ? 0 : Math.abs(v) }))
      .sort((a, b) => b.abs - a.abs)
      .slice(0, 3)
      .map(r => r.idx);
  }, [initialAnswers]);

  // Re-compute ranking whenever answers change
  const { topId, topName, topPct } = useMemo(() => {
    const validAnswers: Answer[] = answers
      .map((v, i) => (v === null ? null : { thesisId: theses[i].id, value: v }))
      .filter((a): a is Answer => a !== null);
    const user = buildUserVector(validAnswers, theses);
    const ranked = rankWithFilters(user, universities, userGpa, excluded);
    if (ranked.length === 0) return { topId: '', topName: '', topPct: 0 };
    return {
      topId: ranked[0].university.id,
      topName: ranked[0].university.name,
      topPct: ranked[0].percent,
    };
  }, [answers, userGpa, excluded]);

  const changed = topId && topId !== originalTopId;

  function setAnswer(idx: number, value: AnswerValue) {
    const next = [...answers];
    next[idx] = value;
    setAnswers(next);
  }

  function resetAll() {
    setAnswers(initialAnswers);
  }

  return (
    <div className="space-y-2.5">
      {impactfulIndices.map(idx => {
        const thesis = theses[idx];
        const selected = answers[idx];
        return (
          <div
            key={thesis.id}
            className="flex items-center gap-5 px-5 py-4 bg-zinc-50 rounded-2xl"
          >
            <div className="flex-1 text-[14px] text-zinc-900 leading-snug">
              &ldquo;{thesis.text}&rdquo;
            </div>
            <div className="flex gap-1 shrink-0">
              {PILL_VALUES.map(p => (
                <button
                  key={p.value}
                  onClick={() => setAnswer(idx, p.value)}
                  className={`w-9 h-7 rounded-full text-[11px] font-semibold transition ${
                    selected === p.value
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-200 text-zinc-500 hover:bg-zinc-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {changed && (
        <div className="mt-4 px-5 py-4 bg-emerald-50 border border-dashed border-emerald-400 rounded-2xl flex items-center gap-3">
          <span className="text-lg">🔄</span>
          <div className="flex-1 text-[14px] text-emerald-900 font-medium leading-snug">
            Neues Top-Match:{' '}
            <strong>{topName}</strong> ({Math.round(topPct)}%)
            <div className="text-xs text-emerald-700/80 mt-0.5 font-normal">
              Ursprünglich: {originalTopName}
            </div>
          </div>
          <button
            onClick={resetAll}
            className="text-xs text-emerald-700 underline hover:text-emerald-900"
          >
            Zurücksetzen
          </button>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-zinc-200 flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          Nur die 3 stärksten Antworten sind editierbar
        </span>
        <Link
          href="/quiz"
          className="text-[13px] font-medium text-zinc-700 hover:text-zinc-950 underline"
        >
          Alle 20 nochmal beantworten →
        </Link>
      </div>
    </div>
  );
}
