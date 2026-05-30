import type { CustomsInputs } from '@/types/inputs';

export interface NationalizationResult {
  nationalizationCop: number;
  nationalizationUsd: number;
}

/**
 * Step 9: Compute nationalization costs.
 *
 * Design inputs are in USD; this module converts them to COP for the formula,
 * then divides back to USD for the engine aggregation.
 *
 * nationalizationCop = (customsAgentUsd + portThcUsd + portStorageUsd + dianInspectionUsd + invimaIcaUsd) × trm
 *                    + vuceCop
 * nationalizationUsd = nationalizationCop / trm
 *
 * Note on currency impedance: the spec formula sums in COP, but our input fields
 * are in USD (design decision). We convert USD → COP here, not in the UI layer.
 */
export function computeNationalization(
  customs: CustomsInputs
): NationalizationResult {
  const trm = customs.trm.value;

  if (trm <= 0) {
    return { nationalizationCop: 0, nationalizationUsd: 0 };
  }

  // USD fields converted to COP
  const usdFieldsCop =
    (customs.customsAgentUsd +
      customs.portThcUsd +
      customs.portStorageUsd +
      customs.dianInspectionUsd +
      customs.invimaIcaUsd) *
    trm;

  // VUCE is already in COP
  const nationalizationCop = usdFieldsCop + customs.vuceCop;
  const nationalizationUsd = nationalizationCop / trm;

  return { nationalizationCop, nationalizationUsd };
}
