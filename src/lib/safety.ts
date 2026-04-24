import { gpaCutoffs, GPA_TOLERANCE } from '@/data/gpa-cutoffs';

export type SafetyTier = 'safe' | 'stretch' | 'risky' | 'unknown';

export type SafetyInfo = {
  tier: SafetyTier;
  cutoff: number | null;
  /** Short label for UI badge */
  label: string;
  /** Longer copy for hero card */
  detail: string;
};

/**
 * Classify a uni's GPA reachability for a given user GPA:
 *  - safe    : userGpa >= cutoff
 *  - stretch : userGpa within 0.2 below cutoff
 *  - risky   : userGpa >= cutoff - 0.5 (shown with warning)
 *  - unknown : uni has no historical cutoff data
 *
 * Note: results pages already filter unreachable unis out (via
 * rankWithFilters), so 'risky' rarely appears — it's a fallback.
 */
export function getGpaSafety(userGpa: number, uniId: string): SafetyInfo {
  const cutoff = gpaCutoffs[uniId];
  if (cutoff === undefined) {
    return {
      tier: 'unknown',
      cutoff: null,
      label: 'Keine Daten',
      detail: 'Keine historischen Placement-Daten für diese Uni',
    };
  }
  if (userGpa >= cutoff) {
    return {
      tier: 'safe',
      cutoff,
      label: `Safe · ${cutoff.toFixed(2)}`,
      detail: `Historisch-safe mit deinem GPA (Cutoff ${cutoff.toFixed(2)})`,
    };
  }
  if (userGpa >= cutoff - GPA_TOLERANCE) {
    return {
      tier: 'stretch',
      cutoff,
      label: `Stretch · ${cutoff.toFixed(2)}`,
      detail: `Knapp am Cutoff (${cutoff.toFixed(2)}) — machbar, aber nicht garantiert`,
    };
  }
  return {
    tier: 'risky',
    cutoff,
    label: `Schwierig · ${cutoff.toFixed(2)}`,
    detail: `Historisch-Cutoff ${cutoff.toFixed(2)} liegt deutlich über deinem GPA`,
  };
}
