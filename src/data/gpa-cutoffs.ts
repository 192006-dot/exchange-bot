/**
 * Minimum GPA per partner university.
 *
 * Two sources:
 * 1. Historical data — from Maastricht exchange placement PDF (~400 entries).
 *    These are the observed minimum GPAs of students who actually got that uni.
 * 2. Estimated — for unis NOT in the historical data but clearly selective
 *    based on prestige, ranking, and known partner-selectivity patterns.
 *    These are flagged with a comment and tend to be conservative (biased high).
 *
 * Interpretation: If user_gpa < cutoff - 0.2 → filter out (uni unreachable).
 *
 * Unis with no entry at all = no cutoff = always reachable (low-competition unis).
 */

export const gpaCutoffs: Record<string, number> = {
  // ========== SEED UNIS ==========
  'pompeu-fabra': 7.86,
  'bocconi': 7.5,
  'luiss': 7.64,
  'nova-sbe': 8.36,
  'copenhagen-bs': 9.64,         // historical TOP: only 9.64
  'sse-stockholm': 9.0,          // estimated — elite Nordic BS, very selective
  'essec': 5.93,
  'st-gallen': 7.29,
  'wu-vienna': 6.5,
  'trinity-dublin': 7.79,
  'aston': 6.5,                  // estimated — mid-tier UK
  'nyu-stern': 8.5,              // estimated — user-provided: NYU Stern requires 8.5+
  'michigan-ross': 8.07,
  'hec-montreal': 8.64,
  'fgv-sao-paulo': 5.79,
  'puc-chile': 5.64,
  'nus': 7.71,
  'hkust': 8.07,
  'unsw': 9.64,                  // historical TOP
  'stellenbosch': 9.07,          // historical TOP

  // ========== EUROPE BATCH ==========
  'innsbruck': 5.86,
  'antwerpen': 6.14,
  'uclouvain': 6.5,              // estimated — good Belgian, moderate selectivity
  'hec-liege': 6.57,
  'ku-leuven': 6.86,
  'charles-prague': 7.07,
  'aarhus': 7.5,                 // estimated — strong Danish BS
  'aalto': 6.14,
  'hanken': 7.21,
  'edhec': 5.93,
  'em-lyon': 5.64,
  'sciences-po': 8.0,            // estimated — elite FR institute
  'ieseg': 5.57,
  'frankfurt-school': 7.5,       // estimated — top German BS, selective
  'fu-berlin': 7.07,
  'lmu': 5.0,
  'mannheim': 5.64,
  'cologne': 6.36,
  'corvinus': 5.79,
  'cattolica': 7.5,
  'bologna': 6.5,                // estimated — good but huge partner, moderate
  'bi-norway': 7.79,
  'nhh': 5.5,
  'catolica-lisbon': 7.86,
  'catolica-porto': 7.5,
  'ie-madrid': 9.07,
  'carlos-iii': 7.79,
  'autonoma-barcelona': 7.86,
  'lund': 7.71,
  'uppsala': 7.57,
  'lausanne': 5.57,
  'zagreb': 6.21,

  // ========== AMERICAS BATCH ==========
  'emory-goizueta': 8.0,         // estimated — top-20 US BS
  'purdue-krannert': 7.5,        // estimated — top-50 US BS
  'texas-am': 7.64,
  'wisconsin-madison': 7.5,      // estimated — top US public
  'tulane': 8.5,
  'george-washington': 7.5,      // estimated — good US in D.C.
  'minnesota-carlson': 7.71,
  'uc-berkeley': 9.43,           // historical VERY HIGH
  'florida-warrington': 6.5,     // estimated — moderate US
  'queens-smith': 7.93,
  'western-ivey': 8.5,           // estimated — top Canadian BS, very selective
  'uqam': 6.0,                   // estimated — French-speaking, less competitive
  'laval': 5.93,
  'simon-fraser': 8.93,
  'itam': 8.29,
  'tec-monterrey': 7.0,          // estimated — top Mexican BS
  'insper': 7.0,                 // estimated — modern Brazilian elite BS
  'uba': 5.5,
  'los-andes': 6.0,
  'pacifico': 6.71,

  // ========== ASIA-PACIFIC BATCH ==========
  'cuhk': 5.43,
  'hku': 8.71,
  'city-hk': 6.86,
  'fudan': 8.36,
  'peking-guanghua': 8.5,        // estimated — elite Chinese, very selective
  'sjtu-antai': 8.0,             // estimated — top Chinese
  'renmin': 7.5,                 // estimated — good Chinese
  'ntu-singapore': 7.07,
  'smu-singapore': 7.79,
  'icu-japan': 7.57,
  'yonsei': 8.0,                 // estimated — elite Korean (SKY group)
  'korea-university': 8.57,
  'snu': 9.29,
  'sogang': 8.29,
  'chulalongkorn': 8.14,
  'thammasat': 8.21,
  'monash': 9.21,
  'sydney-uni': 9.57,
  'anu': 8.21,
  'uq-brisbane': 9.36,
  'auckland-tech': 6.0,          // estimated — moderate NZ BS
  'waikato': 5.5,                // estimated — smaller NZ BS

  // ========== AFRICA/ME BATCH ==========
  'au-cairo': 6.5,               // estimated — English-taught Egyptian
  'hem': 5.21,
  'bogazici': 6.71,
  'koc': 7.0,
  'sabanci': 4.93,
  'aus-sharjah': 6.36,
};

/**
 * Tolerance buffer. If user's GPA is within this distance of the cutoff,
 * treat as reachable (stretch). Default: 0.2 (borderline applicants still see uni).
 */
export const GPA_TOLERANCE = 0.2;

/**
 * Minimum allowed GPA (all unis visible if user is at or above this).
 */
export const MIN_USER_GPA = 5.0;

/**
 * Maximum allowed GPA.
 */
export const MAX_USER_GPA = 10.0;

/**
 * Check whether a university is GPA-reachable for the user.
 * Unis with no historical data are always reachable.
 */
export function isReachableByGpa(uniId: string, userGpa: number): boolean {
  const cutoff = gpaCutoffs[uniId];
  if (cutoff === undefined) return true;
  return userGpa >= cutoff - GPA_TOLERANCE;
}

/**
 * Get the cutoff for a uni (or undefined if no historical data).
 */
export function getCutoff(uniId: string): number | undefined {
  return gpaCutoffs[uniId];
}
