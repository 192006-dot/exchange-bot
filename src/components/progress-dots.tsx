type Props = {
  total: number;
  currentIndex: number;
};

export function ProgressDots({ total, currentIndex }: Props) {
  return (
    <div className="flex gap-1.5 w-full">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`flex-1 h-1 rounded-full transition-colors ${
            i < currentIndex
              ? 'bg-zinc-950'
              : i === currentIndex
                ? 'bg-zinc-950/40'
                : 'bg-zinc-200'
          }`}
        />
      ))}
    </div>
  );
}
