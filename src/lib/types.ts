export const DIMENSIONS = [
  'academic', 'cost', 'english', 'language',
  'climate', 'city', 'nature', 'travel',
  'career', 'adventure', 'social', 'easy',
] as const;

export type Dimension = typeof DIMENSIONS[number];

export type Continent =
  | 'europe'
  | 'north-america'
  | 'latin-america'
  | 'east-asia'
  | 'southeast-asia'
  | 'australasia'
  | 'africa-me';

export type DimensionScore = 1 | 2 | 3 | 4 | 5;

export type DimensionScores = Record<Dimension, DimensionScore>;

export type CitySizeTier = 'small' | 'medium' | 'big' | 'mega';

export type University = {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  continent: Continent;
  language_of_instruction: 'english' | 'local' | 'mixed';
  partner_levels: ('BSc' | 'MSc' | 'DD')[];
  scores: DimensionScores;
  highlights: string[];
  // Factual attributes used by hard-filter logic.
  eu: boolean;
  schengen: boolean;
  flight_hours_from_de: number;   // direct flight from Frankfurt, rounded
  city_population_k: number;      // city proper, in thousands
  city_size_tier: CitySizeTier;   // derived from population: <150 small, <800 medium, <3000 big, else mega
  km_to_coast: number;            // from city center to nearest sea coast
  km_to_mountains: number;        // from city center to nearest ≥1000m range
  avg_summer_temp_c: number;      // mean daytime high, Jun-Aug (Dec-Feb for S. hemisphere)
};

export type Thesis = {
  id: string;
  text: string;
  vector: Partial<Record<Dimension, number>>;
};

export type AnswerValue = -2 | -1 | 0 | 1 | 2;

export type Answer = {
  thesisId: string;
  value: AnswerValue;
};

export type MatchResult = {
  university: University;
  percent: number;
  topReasons: Dimension[];
};
