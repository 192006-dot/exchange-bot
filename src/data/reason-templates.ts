import type { Dimension, University } from '@/lib/types';

export const reasonTemplates: Record<Dimension, (uni: University) => string> = {
  academic: uni => `${uni.name} hat ein starkes Academic-Profil und anerkanntes Business-Programm`,
  cost: uni => `Niedrige Lebenshaltungskosten in ${uni.city} — du kommst mit kleinem Budget gut aus`,
  english: () => `Kurse komplett auf Englisch — keine Sprachbarriere`,
  language: uni => `Intensive Sprach-Immersion — perfekt um ${uni.country}s Landessprache wirklich zu lernen`,
  climate: uni => `Warmes Klima — ${uni.city} ist fast ganzjährig sonnig und angenehm`,
  city: uni => `${uni.city} ist eine lebendige Metropole mit viel Kultur, Nightlife und Events`,
  nature: () => `Direkter Zugang zu Natur und Outdoor — Berge, Strand oder beides`,
  travel: uni => `${uni.city} ist ein perfektes Reise-Hub — viele Länder easy und günstig erreichbar`,
  career: uni => `${uni.name} hat starken Ruf bei Arbeitgebern und ist ein echter CV-Booster`,
  adventure: uni => `Krasse kulturelle Distanz — ${uni.country} wird dich aus der Komfortzone holen`,
  social: () => `Große internationale Exchange-Community — du wirst schnell Freunde finden`,
  easy: () => `EU-nah, keine Visa-Odyssee, unkomplizierte Admin`,
};
