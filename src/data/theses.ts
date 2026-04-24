import type { Thesis } from '@/lib/types';

/**
 * 20 thesen, designed with cross-thesis consistency:
 * - Theme clusters (city, career, language, culture-distance, budget, outdoor)
 *   have 2–3 theses each for triangulation.
 * - Opposing pairs (t3↔t15, t14↔t19, t4↔t5, t6↔t7, t8↔t9, t10↔t11)
 *   span the decision axes explicitly.
 * - No double-counting: overlapping dims trimmed where redundant.
 */
export const theses: Thesis[] = [
  {
    id: 't1',
    text: 'Ich will warmes Wetter und Sonne — 25°C+ die meiste Zeit.',
    vector: { climate: 2, nature: 1 },
  },
  {
    id: 't2',
    text: 'Outdoor-Zugang (Berge oder Strand) in unter 30 Minuten ist für mich ein Must-Have.',
    vector: { nature: 2, city: -1 },
  },
  {
    id: 't3',
    text: 'Ich brauche eine richtige Metropole mit 2+ Millionen Einwohnern.',
    vector: { city: 2, nature: -1, social: 1, travel: 1 },
  },
  {
    id: 't4',
    text: 'Mein Gesamt-Monats-Budget für Miete und Leben liegt unter €900.',
    vector: { cost: 2, career: -1 },
  },
  {
    id: 't5',
    text: 'Für eine Top-Uni bin ich bereit, €1500+ pro Monat zu zahlen.',
    vector: { cost: -2, academic: 1, career: 1 },
  },
  {
    id: 't6',
    text: 'Uni-Ranking und Prestige sind mir wichtiger als alle anderen Faktoren.',
    vector: { academic: 2, career: 2, easy: -1 },
  },
  {
    id: 't7',
    text: 'Karriere ist mir während des Austauschs egal — ich will Memories, nicht Internships.',
    vector: { career: -2, travel: 1 },
  },
  {
    id: 't8',
    text: 'Englisch als Unterrichts- und Alltagssprache ist für mich Pflicht.',
    vector: { english: 2, language: -2 },
  },
  {
    id: 't9',
    text: 'Ich will bewusst eine neue Sprache (Spanisch, Französisch, Japanisch, etc.) im Alltag lernen.',
    vector: { language: 2, english: -1 },
  },
  {
    id: 't10',
    text: 'Ich möchte tief in eine nicht-westliche Kultur eintauchen (Asien, Afrika, Südamerika).',
    vector: { adventure: 2, easy: -2, language: 1, climate: 1 },
  },
  {
    id: 't11',
    text: 'EU-Land, kein Visum, keine Bürokratie — ich will es unkompliziert.',
    vector: { easy: 2, adventure: -1, travel: 1 },
  },
  {
    id: 't12',
    text: 'Ich will jedes Wochenende günstig in ein neues Land fliegen können.',
    vector: { travel: 2, easy: 1 },
  },
  {
    id: 't13',
    text: 'Lange Flüge (12h+) oder Jetlag sind für mich ein absolutes No-Go.',
    vector: { easy: 1, adventure: -2 },
  },
  {
    id: 't14',
    text: 'Nightlife, Clubs und Festivals müssen knallen.',
    vector: { city: 2, social: 1, academic: -1 },
  },
  {
    id: 't15',
    text: 'Ich will eine kleine Studentenstadt, keine Großstadt-Hektik.',
    vector: { city: -2, nature: 1, easy: 1 },
  },
  {
    id: 't16',
    text: 'Surfen, Wandern oder Skifahren sollte direkt vor der Haustür möglich sein.',
    vector: { nature: 1, adventure: 2 },
  },
  {
    id: 't17',
    text: 'Eine große internationale Exchange-Community (300+ Ausländer) ist mir wichtig.',
    vector: { social: 2, english: 1 },
  },
  {
    id: 't18',
    text: 'Ich will nach dem Austausch konkrete Internship- oder Job-Offers in der Tasche haben.',
    vector: { career: 2, academic: 1, social: -1 },
  },
  {
    id: 't19',
    text: 'Kultur, Geschichte und Architektur sind mir wichtiger als Party-Städte.',
    vector: { city: 1, social: -1, academic: 1 },
  },
  {
    id: 't20',
    text: 'Ich will ein Abenteuer, das meine Freunde zuhause nie erleben werden.',
    vector: { adventure: 2, social: 1, easy: -1 },
  },
];
