import Link from 'next/link';
import { ArrowRight, Sparkles, MapPin, BarChart3, ShieldCheck, Zap } from 'lucide-react';
import { universities } from '@/data/universities';
import { theses } from '@/data/theses';

const uniCount = universities.length;
const thesisCount = theses.length;

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Subtle background accent */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-10%] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-100/40 via-sky-50/40 to-transparent blur-3xl" />
      </div>

      {/* Top nav */}
      <header className="relative z-10 w-full px-6 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-950">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-zinc-950 text-white">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            Uni-Matcher
          </span>
          <Link
            href="/quiz"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
          >
            Quiz starten →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 pt-16 md:pt-24 pb-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-xs font-medium text-zinc-600 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Für Maastricht Bachelor International Business
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.03] text-zinc-950">
            Finde deine perfekte<br />
            <span className="bg-gradient-to-br from-zinc-950 via-zinc-700 to-zinc-500 bg-clip-text text-transparent">
              Exchange-Uni.
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-zinc-600 leading-relaxed max-w-2xl mx-auto">
            {thesisCount} Fragen. {uniCount} Partner-Unis. 1 Match.<br />
            Keine Präferenzen vorher — alles ergibt sich aus deinen Antworten.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/quiz"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 text-white px-8 h-14 text-base font-medium transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-100 shadow-lg shadow-zinc-950/20"
            >
              Quiz starten
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <span className="text-sm text-zinc-400">
              ~3 Minuten · Keine Anmeldung · Lokal
            </span>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-3xl bg-zinc-200 overflow-hidden border border-zinc-200">
            <Stat value={uniCount.toString()} label="Partner-Unis" />
            <Stat value={thesisCount.toString()} label="Fragen" />
            <Stat value="12" label="Scoring-Dimensionen" />
            <Stat value="GPA" label="Hard-Filter" subtle />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 bg-zinc-50/50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold mb-3">
              Wie es funktioniert
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-950">
              In drei Schritten zum Match.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Step
              num="01"
              title="GPA eingeben"
              body="Dein aktueller Notendurchschnitt entscheidet, welche Unis für dich überhaupt erreichbar sind. Wir filtern historisch unerreichbare Unis raus."
            />
            <Step
              num="02"
              title={`${thesisCount} Thesen beantworten`}
              body="Agree/Disagree auf einer 5-Punkt-Skala. Klima, Kultur, Karriere, Kosten — 12 Dimensionen werden gleichzeitig gemessen."
            />
            <Step
              num="03"
              title="Top-Match sehen"
              body="Eine Uni mit Prozent-Match und Begründung, plus 4 Runner-Up-Empfehlungen. Alles sofort, kein Warten."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold mb-3">
              Warum dieses Tool
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-950 max-w-3xl">
              Entscheidung in Minuten, nicht Wochen.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Feature
              icon={<BarChart3 className="h-5 w-5" />}
              title="Datenbasierte GPA-Cutoffs"
              body={`Basiert auf realen Placement-Daten: ~400 historische Austauschstudenten. Wenn Berkeley nur mit 9.4+ GPA zu haben war, weißt du das vorher.`}
            />
            <Feature
              icon={<MapPin className="h-5 w-5" />}
              title={`${uniCount} Partner-Unis recherchiert`}
              body="Für jede Uni: QS-Ranking, Numbeo-Kosten, Klimadaten, Exchange-Reports. Keine generischen Antworten — spezifische Scores pro Dimension."
            />
            <Feature
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Keine Anmeldung, keine Daten"
              body="Alles läuft im Browser. Keine Server, keine Datenbank, keine Cookies. Reload = fresh start."
            />
            <Feature
              icon={<Zap className="h-5 w-5" />}
              title="Ehrliche Empfehlung"
              body="Wir bewerten nicht nach deinen expliziten Präferenzen, sondern lesen sie aus deinen Antworten. Keine Bias durch vorgefasste Meinungen."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pt-12 pb-32">
        <div className="mx-auto max-w-3xl text-center rounded-[2rem] bg-zinc-950 text-white px-8 py-20 md:px-12">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            Bereit, deine Uni<br />zu finden?
          </h2>
          <p className="mt-4 text-zinc-400 text-lg max-w-lg mx-auto">
            20 Fragen zwischen dir und deinem nächsten Semester.
          </p>
          <Link
            href="/quiz"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white text-zinc-950 px-8 h-14 text-base font-medium transition-all hover:bg-zinc-100 hover:scale-[1.02] active:scale-100"
          >
            Quiz starten
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-zinc-100">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>Uni-Matcher · Built for Maastricht University exchange selection</p>
          <p>Local-only · No tracking · Based on ~400 historical placements</p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label, subtle = false }: { value: string; label: string; subtle?: boolean }) {
  return (
    <div className="bg-white px-6 py-8 text-center">
      <div className={`text-3xl md:text-4xl font-bold tracking-tight ${subtle ? 'text-zinc-950' : 'text-zinc-950'}`}>
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-zinc-500 font-medium">
        {label}
      </div>
    </div>
  );
}

function Step({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-white border border-zinc-200 p-8 transition-all hover:border-zinc-300 hover:shadow-sm">
      <div className="text-xs font-mono text-zinc-400 mb-6">{num}</div>
      <h3 className="text-xl font-semibold tracking-tight text-zinc-950 mb-3">{title}</h3>
      <p className="text-zinc-600 leading-relaxed text-[15px]">{body}</p>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-white border border-zinc-200 p-8">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-zinc-950 mb-3">{title}</h3>
      <p className="text-zinc-600 leading-relaxed text-[15px]">{body}</p>
    </div>
  );
}
