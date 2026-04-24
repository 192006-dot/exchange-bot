import type { Thesis } from '@/lib/types';

/**
 * 20 theses designed with cross-thesis consistency:
 * - Theme clusters (city, career, language, culture-distance, budget, outdoor)
 *   have 2–3 theses each for triangulation.
 * - Opposing pairs (t3↔t15, t14↔t19, t4↔t5, t6↔t7, t8↔t9, t10↔t11)
 *   span the decision axes explicitly.
 * - Weights kept to 1–3 dimensions per thesis that match semantic intent.
 */
export const theses: Thesis[] = [
  {
    id: 't1',
    text: 'Ich will warmes Wetter und Sonne — meistens über 25 °C.',
    vector: { climate: 2 },
  },
  {
    id: 't2',
    text: 'Outdoor-Zugang (Berge oder Strand) in unter 30 Minuten ist für mich ein Must-Have.',
    vector: { nature: 2, city: -1 },
  },
  {
    id: 't3',
    text: 'Ich will eine echte Millionenstadt mit urbaner Energie.',
    vector: { city: 2, nature: -1, social: 1 },
  },
  {
    id: 't4',
    text: 'Mein Gesamt-Monats-Budget für Miete und Leben liegt unter €900.',
    vector: { cost: 2 },
  },
  {
    id: 't5',
    text: 'Eine Top-Uni ist höhere Lebenshaltungskosten für mich wert.',
    vector: { academic: 2, cost: -2 },
  },
  {
    id: 't6',
    text: 'Ein starkes Uni-Ranking wiegt andere Kompromisse für mich auf.',
    vector: { academic: 2, career: 2 },
  },
  {
    id: 't7',
    text: 'Karriere ist mir während des Austauschs egal — ich will Memories, nicht Internships.',
    vector: { career: -2, travel: 1 },
  },
  {
    id: 't8',
    text: 'Unterricht auf Englisch ist Pflicht — ich will keine Landessprache büffeln.',
    vector: { english: 2, language: -2 },
  },
  {
    id: 't9',
    text: 'Ich will bewusst eine neue Sprache (Spanisch, Französisch, Japanisch, etc.) im Alltag lernen.',
    vector: { language: 2, english: -1 },
  },
  {
    id: 't10',
    text: 'Ich will eine Kultur erleben, die sich radikal von Europa unterscheidet — auch wenn das Stress bedeutet.',
    vector: { adventure: 2, easy: -2 },
  },
  {
    id: 't11',
    text: 'Ich will es unkompliziert — EU-Raum ohne Visum.',
    vector: { easy: 2, adventure: -1 },
  },
  {
    id: 't12',
    text: 'Günstige Wochenendtrips in Nachbarländer sind mir wichtig.',
    vector: { travel: 2, easy: 1 },
  },
  {
    id: 't13',
    text: 'Lange Interkontinentalflüge (10h+) sind für mich ein No-Go.',
    vector: { easy: 1, adventure: -2 },
  },
  {
    id: 't14',
    text: 'Nightlife, Clubs und Festivals müssen knallen.',
    vector: { city: 2, social: 1, academic: -1 },
  },
  {
    id: 't15',
    text: 'Ich bevorzuge eine überschaubare Studentenstadt.',
    vector: { city: -2, nature: 1, easy: 1 },
  },
  {
    id: 't16',
    text: 'Regelmäßige Outdoor-Aktivitäten (Wandern, Surfen, Ski — egal welche) sind mir wichtiger als Stadt-Life.',
    vector: { nature: 2, adventure: 1, city: -1 },
  },
  {
    id: 't17',
    text: 'Eine große internationale Exchange-Community ist mir wichtig.',
    vector: { social: 2, english: 1 },
  },
  {
    id: 't18',
    text: 'Ich will nach dem Austausch konkrete Internship- oder Job-Offers in der Tasche haben.',
    vector: { career: 2, academic: 1 },
  },
  {
    id: 't19',
    text: 'Kultur, Geschichte und Architektur sind mir wichtiger als Party-Städte.',
    vector: { city: 1, social: -1 },
  },
  {
    id: 't20',
    text: 'Ich will ein Abenteuer, das meine Freunde zuhause nie erleben werden.',
    vector: { adventure: 2, social: 1, easy: -1 },
  },
];
