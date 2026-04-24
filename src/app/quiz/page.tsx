'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { theses } from '@/data/theses';
import { ThesisCard } from '@/components/thesis-card';
import { ProgressDots } from '@/components/progress-dots';
import type { AnswerValue } from '@/lib/types';

export default function QuizPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(AnswerValue | null)[]>(
    Array.from({ length: theses.length }, () => null),
  );

  const currentThesis = theses[currentIndex];
  const currentSelected = answers[currentIndex];

  function handleSelect(value: AnswerValue) {
    const next = [...answers];
    next[currentIndex] = value;
    setAnswers(next);

    setTimeout(() => {
      if (currentIndex + 1 < theses.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const encoded = encodeURIComponent(JSON.stringify(next));
        router.push(`/results?answers=${encoded}`);
      }
    }, 280);
  }

  function handleBack() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  return (
    <main className="min-h-screen px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="text-sm text-zinc-400 disabled:opacity-30 hover:text-zinc-700 cursor-pointer disabled:cursor-not-allowed"
          >
            ← Zurück
          </button>
          <div className="flex-1">
            <ProgressDots total={theses.length} currentIndex={currentIndex} />
          </div>
        </div>
        <p className="text-xs uppercase tracking-widest text-zinc-400 mb-3">
          These {currentIndex + 1} von {theses.length}
        </p>
        <ThesisCard
          thesis={currentThesis}
          selected={currentSelected}
          onSelect={handleSelect}
        />
      </div>
    </main>
  );
}
