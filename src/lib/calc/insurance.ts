export interface InsuranceResult {
  insuranceUsd: number;
}

/**
 * Step 6: Compute insurance cost.
 *
 * Approximation: (FOB + freight) × rate
 * This is <0.1% error vs. true CIF base (which would be circular:
 * CIF = FOB + freight + insurance, but insurance depends on CIF).
 * Industry standard approximation — documented per design ADR #8.
 *
 * When incoterm = 'CIF', insurance is 0 (already included in user-entered CIF).
 */
export function computeInsurance(
  fobUsd: number,
  freightUsd: number,
  enabled: boolean,
  ratePct: number
): InsuranceResult {
  if (!enabled) return { insuranceUsd: 0 };
  // Base: FOB + freight (approximation — see ADR #8)
  const insuranceUsd = (fobUsd + freightUsd) * ratePct;
  return { insuranceUsd };
}
