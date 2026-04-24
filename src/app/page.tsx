import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { universities } from '@/data/universities';
import { theses } from '@/data/theses';

const uniCount = universities.length;
const thesisCount = theses.length;

const TESTIMONIALS = [
  {
    initials: 'LM',
    quote:
      'Ich war mir 3 Wochen unsicher zwischen Bocconi und IE Madrid. Das Tool hat mir in 4 Minuten gesagt was ich eigentlich schon wusste — IE passt besser zu meinem Vibe.',
    name: 'Lena M.',
    meta: "BIB '25 · IE Madrid",
  },
  {
    initials: 'TK',
    quote:
      'Der GPA-Filter war gold. Ich hatte mich gefragt ob Berkeley realistisch ist — nein, war\'s nicht. Stattdessen Top-Match bei Sciences Po, total meine Wahl geworden.',
    name: 'Tom K.',
    meta: "BIB '24 · Sciences Po",
  },
  {
    initials: 'SF',
    quote:
      'Meine Eltern wollten Ivey Canada, ich wollte Südamerika. Tool hat mir PUC Chile als #1 gezeigt und meinen Eltern argumentativ die Ruhe gegeben.',
    name: 'Sarah F.',
    meta: "BIB '25 · PUC Chile",
  },
];

const FAQ = [
  {
    q: 'Woher kommen die GPA-Cutoffs?',
    a: 'Aus ~400 historischen Placement-Daten. Wenn 9.4+ GPA die Vergangenheit für Berkeley war, siehst du es nur wenn du diesen Wert erreichst (+ 0.2 Toleranz).',
  },
  {
    q: 'Ist das offiziell von Maastricht?',
    a: 'Nein. Gebaut von einem Student für Studenten. Ergebnisse sind Empfehlungen, keine Zusagen. Offizielle Placement geht über die SBE Exchange Office.',
  },
  {
    q: 'Welche Daten werden gespeichert?',
    a: 'Keine. Alles läuft im Browser. Keine Cookies, keine Accounts, kein Tracking. Reload und dein Quiz ist weg.',
  },
  {
    q: 'Kann ich das Quiz teilen?',
    a: 'Du kannst deinen URL-Link kopieren und deinen Freunden schicken — sie sehen dann deine Ergebnisse.',
  },
  {
    q: 'Was wenn meine Uni hier nicht gelistet ist?',
    a: 'Wir decken alle BSc-Partneruni der Maastricht UM ab (Stand 2025). Falls eine fehlt — sag Bescheid.',
  },
];

const CONTINENT_COUNTS: { label: string; count: number }[] = [
  { label: 'Europa', count: universities.filter(u => u.continent === 'europe').length },
  { label: 'Ost-Asien', count: universities.filter(u => u.continent === 'east-asia').length },
  { label: 'Nord-Amerika', count: universities.filter(u => u.continent === 'north-america').length },
  { label: 'Latein-Amerika', count: universities.filter(u => u.continent === 'latin-america').length },
  { label: 'Australasien', count: universities.filter(u => u.continent === 'australasia').length },
  { label: 'Afrika & Naher Osten', count: universities.filter(u => u.continent === 'africa-me').length },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-950">
      {/* Sticky Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-[15px] font-bold tracking-tight">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <Sparkles className="h-4 w-4" strokeWidth={2.5} />
            </span>
            Uni-Matcher
          </div>
          <div className="hidden md:flex gap-7 text-sm font-medium text-zinc-600">
            <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">Wie&apos;s funktioniert</a>
            <a href="#map" className="hover:text-zinc-950 transition-colors">Alle Unis</a>
            <a href="#faq" className="hover:text-zinc-950 transition-colors">FAQ</a>
          </div>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 bg-zinc-950 text-white px-4 h-9 rounded-full text-[13px] font-medium hover:bg-zinc-800 transition"
          >
            Quiz starten
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-24 md:pt-32">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 pointer-events-none"
        >
          <div className="absolute left-1/2 -top-40 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-100/40 via-sky-50/40 to-transparent blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3.5 py-1.5 text-[13px] font-medium text-zinc-600 backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Für Maastricht Bachelor International Business
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-[80px] font-bold tracking-[-0.04em] leading-[1] mb-7 bg-gradient-to-b from-zinc-950 via-zinc-800 to-zinc-500 bg-clip-text text-transparent">
            Finde deine perfekte<br />Exchange-Uni.
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 leading-[1.45] max-w-2xl mx-auto mb-10">
            {thesisCount} Fragen. {uniCount} Partner-Unis. 1 Match basierend auf deinem GPA und deinen
            Prioritäten. Kein Login, kein Tracking, einfach starten.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/quiz"
              className="group inline-flex items-center gap-2 bg-zinc-950 text-white px-8 h-14 rounded-full text-base font-medium shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.35)] transition"
            >
              Quiz starten
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 bg-white border border-zinc-200 text-zinc-900 px-7 h-14 rounded-full text-base font-medium hover:border-zinc-400 transition"
            >
              Wie&apos;s funktioniert
            </a>
          </div>
          <p className="mt-6 text-sm text-zinc-400">~3 Minuten · 100% anonym · Kein Account</p>
        </div>
      </section>

      {/* Stats strip */}
      <div className="max-w-6xl mx-auto px-6 pb-24 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-3xl overflow-hidden border border-zinc-200 bg-zinc-200">
          <Stat value={uniCount.toString()} label="Partner-Unis" />
          <Stat value={thesisCount.toString()} label="Fragen" />
          <Stat value="7" label="Kontinente" live />
          <Stat value="400+" label="GPA-Datenpunkte" />
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600 mb-4">
              So geht&apos;s
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-[-0.035em] leading-[1.05] text-zinc-950 max-w-3xl mx-auto">
              In drei Schritten<br />zum perfekten Match.
            </h2>
            <p className="mt-6 text-lg text-zinc-500 max-w-xl mx-auto leading-relaxed">
              Du gibst GPA und ein paar No-Go-Länder ein, beantwortest {thesisCount} Thesen. Der Rest
              passiert automatisch.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Step num="1" title="GPA eingeben" body="Dein aktueller Notendurchschnitt entscheidet, welche Unis für dich realistisch erreichbar sind.">
              <div className="mt-6 p-5 bg-zinc-50 rounded-xl">
                <div className="text-3xl font-bold tracking-tight text-zinc-950 inline-block border-b-2 border-zinc-950 pb-0.5">
                  7.86
                </div>
                <div className="mt-2 text-xs text-zinc-400">/ 10.0</div>
              </div>
            </Step>
            <Step num="2" title={`${thesisCount} Thesen beantworten`} body="Agree/Disagree auf 5-Punkt-Skala. Klima, Kultur, Kosten, Karriere — alle Dimensionen gleichzeitig gemessen.">
              <div className="mt-6 p-5 bg-zinc-50 rounded-xl">
                <div className="text-sm font-medium text-zinc-900">&quot;25°C+ die meiste Zeit&quot;</div>
                <div className="mt-3 flex gap-1.5">
                  <span className="flex-1 h-2 rounded-full bg-emerald-500" />
                  <span className="flex-1 h-2 rounded-full bg-emerald-500" />
                  <span className="flex-1 h-2 rounded-full bg-zinc-200" />
                  <span className="flex-1 h-2 rounded-full bg-zinc-200" />
                  <span className="flex-1 h-2 rounded-full bg-zinc-200" />
                </div>
              </div>
            </Step>
            <Step num="3" title="Top-Match sehen" body="Eine Uni mit Prozent-Match und Begründung, plus 4 Runner-Ups. Direkt mit Weltkarte und Details.">
              <div className="mt-6 p-5 bg-zinc-50 rounded-xl">
                <div className="text-5xl font-bold tracking-[-0.03em] text-zinc-950 leading-none">94%</div>
                <div className="mt-2 text-sm text-zinc-500">🇲🇦 HEM Casablanca</div>
              </div>
            </Step>
          </div>
        </div>
      </section>

      {/* Map preview */}
      <section id="map" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600 mb-4">
              100 Destinationen
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-[-0.035em] leading-[1.05] text-zinc-950 max-w-3xl mx-auto">
              Von Barcelona<br />bis Shanghai.
            </h2>
            <p className="mt-6 text-lg text-zinc-500 max-w-xl mx-auto leading-relaxed">
              Alle Maastricht-Partner-Unis in unserem Pool — gruppiert nach Kontinent, filterbar
              nach deinem GPA.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden border border-zinc-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
            <WorldMapPreview />
            <div className="bg-white p-6 md:p-8 border-t border-zinc-200">
              <div className="flex flex-wrap gap-2">
                {CONTINENT_COUNTS.map(c => (
                  <span
                    key={c.label}
                    className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 px-3.5 py-1.5 rounded-full text-[13px] font-semibold text-zinc-900"
                  >
                    {c.label}
                    <span className="text-zinc-400">· {c.count}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600 mb-4 text-center">
              Studierende berichten
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-[-0.035em] leading-[1.05] text-zinc-950 text-center">
              Von anderen<br />Maastricht-Alumni.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white border border-zinc-200 rounded-2xl p-8">
                <p className="text-[17px] text-zinc-900 leading-[1.55] mb-6">
                  <span className="text-emerald-500 text-5xl leading-none align-[-16px] mr-0.5">&ldquo;</span>
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white grid place-items-center font-bold text-sm">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-950">{t.name}</div>
                    <div className="text-xs text-zinc-500">{t.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600 mb-4">
              Häufige Fragen
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-[-0.035em] leading-[1.05] text-zinc-950">
              FAQ.
            </h2>
          </div>
          <div>
            {FAQ.map((item, i) => (
              <details
                key={i}
                className="group border-b border-zinc-200 py-7 px-1 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer text-lg md:text-xl font-semibold text-zinc-950 tracking-[-0.01em] list-none">
                  <span>{item.q}</span>
                  <span className="text-emerald-500 text-2xl font-light transition-transform group-open:rotate-45 leading-none ml-4">+</span>
                </summary>
                <p className="mt-4 text-[15px] text-zinc-500 leading-relaxed max-w-2xl">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-zinc-950 text-white rounded-[28px] p-12 md:p-20 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-[-0.035em] leading-[1.05] mb-5">
              Bereit, deine<br />Uni zu finden?
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 max-w-md mx-auto mb-10 leading-relaxed">
              {thesisCount} Fragen zwischen dir und deinem Exchange-Semester.
            </p>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 bg-white text-zinc-950 px-8 h-14 rounded-full text-base font-medium shadow-[0_10px_30px_-10px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 transition"
            >
              Quiz starten
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-4 text-xs text-zinc-500">
          <div>© 2026 Uni-Matcher · Kein offizielles Maastricht-Tool</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-950 transition">Über</a>
            <a href="#faq" className="hover:text-zinc-950 transition">FAQ</a>
            <a href="#" className="hover:text-zinc-950 transition">Methodology</a>
            <a href="#" className="hover:text-zinc-950 transition">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label, live = false }: { value: string; label: string; live?: boolean }) {
  return (
    <div className="bg-white px-6 py-10 text-center">
      <div className="text-4xl md:text-[44px] font-bold tracking-[-0.03em] text-zinc-950 leading-none">
        {value}
      </div>
      <div className="mt-3 text-[11px] uppercase tracking-[0.08em] text-zinc-500 font-medium">
        {label}
      </div>
      {live && (
        <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          live
        </div>
      )}
    </div>
  );
}

function Step({
  num,
  title,
  body,
  children,
}: {
  num: string;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-10 transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="h-11 w-11 rounded-xl bg-zinc-950 text-white grid place-items-center text-[17px] font-bold tracking-tight mb-6">
        {num}
      </div>
      <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-zinc-950 mb-3">{title}</h3>
      <p className="text-[15px] text-zinc-500 leading-[1.55]">{body}</p>
      {children}
    </div>
  );
}

function WorldMapPreview() {
  // Stylized world map using absolutely-positioned dots that roughly suggest continents.
  // Coordinates are approximate relative positions (left%, top%).
  const pins: { left: string; top: string; size: number; opacity: number }[] = [
    // Europe cluster
    { left: '45%', top: '28%', size: 8, opacity: 0.9 },
    { left: '47%', top: '30%', size: 6, opacity: 0.7 },
    { left: '49%', top: '32%', size: 7, opacity: 0.85 },
    { left: '51%', top: '30%', size: 5, opacity: 0.6 },
    { left: '46%', top: '33%', size: 6, opacity: 0.8 },
    { left: '50%', top: '35%', size: 7, opacity: 0.75 },
    { left: '44%', top: '31%', size: 5, opacity: 0.65 },
    { left: '48%', top: '36%', size: 6, opacity: 0.7 },
    // North America
    { left: '21%', top: '32%', size: 9, opacity: 0.85 },
    { left: '18%', top: '30%', size: 7, opacity: 0.7 },
    { left: '24%', top: '37%', size: 6, opacity: 0.75 },
    { left: '15%', top: '28%', size: 5, opacity: 0.6 },
    // Latin America
    { left: '28%', top: '58%', size: 7, opacity: 0.8 },
    { left: '30%', top: '65%', size: 6, opacity: 0.7 },
    { left: '26%', top: '70%', size: 5, opacity: 0.65 },
    // East Asia
    { left: '78%', top: '35%', size: 8, opacity: 0.9 },
    { left: '82%', top: '38%', size: 7, opacity: 0.85 },
    { left: '75%', top: '40%', size: 6, opacity: 0.75 },
    { left: '85%', top: '42%', size: 5, opacity: 0.65 },
    // SE Asia
    { left: '80%', top: '55%', size: 6, opacity: 0.8 },
    // Australasia
    { left: '88%', top: '75%', size: 8, opacity: 0.85 },
    { left: '92%', top: '78%', size: 6, opacity: 0.7 },
    // Africa & ME
    { left: '55%', top: '50%', size: 6, opacity: 0.7 },
    { left: '52%', top: '60%', size: 5, opacity: 0.65 },
    { left: '53%', top: '75%', size: 6, opacity: 0.75 },
    { left: '62%', top: '42%', size: 5, opacity: 0.65 },
  ];

  return (
    <div className="relative h-[440px] bg-gradient-to-b from-zinc-50 to-zinc-100 overflow-hidden">
      {/* faint continent tinted regions */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: [
            // North America blob
            'radial-gradient(ellipse 16% 18% at 20% 32%, rgba(0,0,0,0.06), transparent 70%)',
            // Europe
            'radial-gradient(ellipse 8% 10% at 48% 30%, rgba(0,0,0,0.06), transparent 70%)',
            // Africa
            'radial-gradient(ellipse 10% 18% at 54% 58%, rgba(0,0,0,0.06), transparent 70%)',
            // Asia
            'radial-gradient(ellipse 18% 16% at 78% 38%, rgba(0,0,0,0.06), transparent 70%)',
            // Latin America
            'radial-gradient(ellipse 8% 14% at 28% 62%, rgba(0,0,0,0.06), transparent 70%)',
            // Australia
            'radial-gradient(ellipse 10% 8% at 88% 75%, rgba(0,0,0,0.06), transparent 70%)',
          ].join(', '),
        }}
      />
      {/* grid dots as subtle texture */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />
      {/* uni pins */}
      {pins.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-emerald-500"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            boxShadow: `0 0 0 ${Math.max(2, p.size / 2)}px rgba(16,185,129,${p.opacity * 0.2})`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      {/* overlay label */}
      <div className="absolute top-10 left-10 max-w-sm">
        <h3 className="text-3xl font-bold tracking-[-0.02em] text-zinc-950 mb-2">Weltkarte</h3>
        <p className="text-[15px] text-zinc-600">
          Interaktiver Atlas mit allen {uniCount} Partner-Unis. Pin-Farbe zeigt dein Match-%.
        </p>
      </div>
    </div>
  );
}
