import type { Thesis } from '@/lib/types';

export const theses: Thesis[] = [
  {
    id: 't1',
    text: 'Ich will die 6 Monate im Ausland unbedingt in Europa bleiben.',
    vector: { easy: 2, adventure: -2, climate: -1 },
  },
  {
    id: 't2',
    text: 'Ich will in einer Großstadt mit Nightlife und Kultur leben.',
    vector: { city: 2, social: 1, nature: -1 },
  },
  {
    id: 't3',
    text: 'Prestige und Uni-Ranking sind mir am wichtigsten.',
    vector: { academic: 2, career: 2, easy: -1 },
  },
  {
    id: 't4',
    text: 'Ich will bewusst eine neue Fremdsprache im Alltag lernen.',
    vector: { language: 2, english: -1, adventure: 1 },
  },
  {
    id: 't5',
    text: 'Lebenshaltungskosten sollten möglichst niedrig sein.',
    vector: { cost: 2, career: -1 },
  },
  {
    id: 't6',
    text: 'Ich suche warme Temperaturen, Sonne und Strand.',
    vector: { climate: 2, nature: 1, city: -1 },
  },
  {
    id: 't7',
    text: 'Outdoor-Aktivitäten wie Wandern, Surfen oder Skifahren sollten direkt vor der Tür sein.',
    vector: { nature: 2, adventure: 1, city: -1 },
  },
  {
    id: 't8',
    text: 'Ich möchte von dort aus möglichst viele andere Länder bereisen.',
    vector: { travel: 2, easy: 1 },
  },
  {
    id: 't9',
    text: 'Ich will eine große internationale Exchange-Community, um schnell Freunde zu finden.',
    vector: { social: 2, english: 1 },
  },
  {
    id: 't10',
    text: 'Ich möchte einen richtigen Kulturschock und eine komplett andere Lebensart erleben.',
    vector: { adventure: 2, easy: -2, language: 1 },
  },
  {
    id: 't11',
    text: 'Ein späterer Karriere-Boost (Internship, Networking, CV-Wirkung) ist mir wichtig.',
    vector: { career: 2, academic: 1, social: 1 },
  },
  {
    id: 't12',
    text: 'Englisch als Unterrichtssprache ist für mich Pflicht.',
    vector: { english: 2, language: -1 },
  },
  {
    id: 't13',
    text: 'Ich will keine komplizierte Visa- oder Bürokratie-Odyssee.',
    vector: { easy: 2, adventure: -1 },
  },
];
