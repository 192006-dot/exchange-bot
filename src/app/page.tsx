import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] text-zinc-950">
          Finde deine perfekte<br />Exchange-Uni.
        </h1>
        <p className="mt-6 text-lg text-zinc-500 leading-relaxed max-w-lg">
          13 Fragen. 180 Partner-Unis. 1 Match.<br />
          Keine Präferenzen vorher — alles kommt aus deinen Antworten raus.
        </p>
        <div className="mt-10">
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 text-white px-7 h-12 text-base font-medium transition-colors hover:bg-zinc-800"
          >
            Los geht&apos;s →
          </Link>
        </div>
        <p className="mt-6 text-sm text-zinc-400">~3 Minuten · Nichts wird gespeichert</p>
      </div>
    </main>
  );
}
