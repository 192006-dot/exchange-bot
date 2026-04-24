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
