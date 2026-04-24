'use client';
import type { Thesis, AnswerValue } from '@/lib/types';

const OPTIONS: { value: AnswerValue; label: string }[] = [
  { value: 2, label: 'Stimme voll zu' },
  { value: 1, label: 'Stimme zu' },
  { value: 0, label: 'Neutral' },
  { value: -1, label: 'Stimme nicht zu' },
  { value: -2, label: 'Stimme gar nicht zu' },
];

type Props = {
  thesis: Thesis;
  selected: AnswerValue | null;
  onSelect: (value: AnswerValue) => void;
};

export function ThesisCard({ thesis, selected, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-zinc-950 mb-12">
        {thesis.text}
      </h2>
      <div className="space-y-2.5">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`w-full text-left px-6 py-4 rounded-xl border text-base transition-all cursor-pointer ${
              selected === opt.value
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
