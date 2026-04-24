'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { theses } from '@/data/theses';
import { ThesisCard } from '@/components/thesis-card';
import { ProgressDots } from '@/components/progress-dots';
import { GpaInput } from '@/components/gpa-input';
import type { AnswerValue } from '@/lib/types';

type Phase = 'gpa' | 'theses';

export default function QuizPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('gpa');
  const [userGpa, setUserGpa] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(AnswerValue | null)[]>(
    Array.from({ length: theses.length }, () => null),
  );

  const currentThesis = theses[currentIndex];
  const currentSelected = answers[currentIndex];

  function handleGpaSubmit(gpa: number) {
    setUserGpa(gpa);
    setPhase('theses');
  }

  function handleSelect(value: AnswerValue) {
    const next = [...answers];
    next[currentIndex] = value;
    setAnswers(next);

    setTimeout(() => {
      if (currentIndex + 1 < theses.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const encodedAnswers = encodeURIComponent(JSON.stringify(next));
        router.push(`/results?gpa=${userGpa}&answers=${encodedAnswers}`);
      }
    }, 280);
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setPhase('gpa');
    }
  }

  if (phase === 'gpa') {
    return (
      <main className="min-h-screen px-6 py-16 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key="gpa"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <GpaInput onSubmit={handleGpaSubmit} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={handleBack}
            className="text-sm text-zinc-400 hover:text-zinc-700 cursor-pointer"
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
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <ThesisCard
              thesis={currentThesis}
              selected={currentSelected}
              onSelect={handleSelect}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
