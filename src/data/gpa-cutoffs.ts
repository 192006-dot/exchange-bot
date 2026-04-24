/**
 * Minimum observed GPA per partner university, based on historical Maastricht
 * exchange placement data (~12 pages PDF scan, ~400 student-uni pairs).
 *
 * Interpretation: The historical lowest GPA at which a student got this uni.
 * If user_gpa < cutoff - 0.2 → filter out (uni likely unreachable).
 *
 * Unis NOT in this map had zero historical placements in the data — treat as
 * "no historical data" (keep reachable at any GPA).
 */

export const gpaCutoffs: Record<string, number> = {
  // ========== SEED UNIS ==========
  'pompeu-fabra': 7.86,
  'bocconi': 7.5,
  'luiss': 7.64,
  'nova-sbe': 8.36,
  'copenhagen-bs': 9.64,         // TOP: only 9.64 in data
  // 'sse-stockholm': not in data — null
  'essec': 5.93,
  'st-gallen': 7.29,
  'wu-vienna': 6.5,
  'trinity-dublin': 7.79,
  // 'aston': not in data — null
  // 'nyu-stern': not in data — null
  'michigan-ross': 8.07,
  'hec-montreal': 8.64,
  'fgv-sao-paulo': 5.79,
  'puc-chile': 5.64,
  'nus': 7.71,
  'hkust': 8.07,
  'unsw': 9.64,                  // TOP: only 9.64
  'stellenbosch': 9.07,          // TOP: 9.64, 9.07

  // ========== EUROPE BATCH ==========
  'innsbruck': 5.86,
  'antwerpen': 6.14,
  // 'uclouvain': not in data — null
  'hec-liege': 6.57,
  'ku-leuven': 6.86,
  'charles-prague': 7.07,
  // 'aarhus': not in data — null
  'aalto': 6.14,
  'hanken': 7.21,
  'edhec': 5.93,
  'em-lyon': 5.64,
  // 'sciences-po': not in data — null
  'ieseg': 5.57,
  // 'frankfurt-school': not in data — null
  'fu-berlin': 7.07,
  'lmu': 5.0,
  'mannheim': 5.64,
  'cologne': 6.36,
  'corvinus': 5.79,
  'cattolica': 7.5,
  // 'bologna': not in data — null
  'bi-norway': 7.79,
  'nhh': 5.5,
  'catolica-lisbon': 7.86,
  'catolica-porto': 7.5,
  'ie-madrid': 9.07,             // VERY HIGH
  'carlos-iii': 7.79,
  'autonoma-barcelona': 7.86,
  'lund': 7.71,
  'uppsala': 7.57,
  'lausanne': 5.57,
  'zagreb': 6.21,

  // ========== AMERICAS BATCH ==========
  // 'emory-goizueta': not in data — null
  // 'purdue-krannert': not in data — null
  'texas-am': 7.64,
  // 'wisconsin-madison': not in data — null
  'tulane': 8.5,
  // 'george-washington': not in data — null
  'minnesota-carlson': 7.71,
  'uc-berkeley': 9.43,           // VERY HIGH: 9.64, 9.57, 9.43
  // 'florida-warrington': not in data — null
  'queens-smith': 7.93,
  // 'western-ivey': not in data — null
  // 'uqam': not in data — null
  'laval': 5.93,
  'simon-fraser': 8.93,
  'itam': 8.29,
  // 'tec-monterrey': not in data — null
  // 'insper': not in data — null
  'uba': 5.5,
  'los-andes': 6.0,
  'pacifico': 6.71,

  // ========== ASIA-PACIFIC BATCH ==========
  'cuhk': 5.43,
  'hku': 8.71,
  'city-hk': 6.86,
  'fudan': 8.36,
  // 'peking-guanghua': not in data — null
  // 'sjtu-antai': not in data — null
  // 'renmin': not in data — null
  'ntu-singapore': 7.07,
  'smu-singapore': 7.79,
  'icu-japan': 7.57,
  // 'yonsei': not in data — null
  'korea-university': 8.57,
  'snu': 9.29,                   // HIGH
  'sogang': 8.29,
  'chulalongkorn': 8.14,
  'thammasat': 8.21,
  'monash': 9.21,                // HIGH
  'sydney-uni': 9.57,            // VERY HIGH
  'anu': 8.21,
  'uq-brisbane': 9.36,           // HIGH
  // 'auckland-tech': not in data — null
  // 'waikato': not in data — null

  // ========== AFRICA/ME BATCH ==========
  // 'au-cairo': not in data — null
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
