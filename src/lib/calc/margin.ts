import { roundCOP } from './rounding';

export interface MarginResult {
  recommendedSellPriceCop: number;
  recommendedSellPricePerUnitCop: number;
}

/**
 * Margin calculator: recommended sell price to achieve target margin.
 *
 * recommendedSellPriceCop = totalLandedCop / (1 - targetPct / 100)
 *
 * Guard: targetPct >= 100 → returns 0 (mathematically undefined / infinite).
 * This is clamped to 0 rather than Infinity to keep the UI safe.
 * The UI should warn the user when they enter >= 100%.
 */
export function computeMargin(
  totalLandedCop: number,
  quantity: number,
  targetPct: number
): MarginResult {
  if (targetPct <= 0) {
    return { recommendedSellPriceCop: 0, recommendedSellPricePerUnitCop: 0 };
  }

  // Guard: margin >= 100% is undefined (division by zero or negative denominator)
  if (targetPct >= 100) {
    return { recommendedSellPriceCop: 0, recommendedSellPricePerUnitCop: 0 };
  }

  const recommendedSellPriceCop = totalLandedCop / (1 - targetPct / 100);
  const recommendedSellPricePerUnitCop =
    quantity > 0 ? recommendedSellPriceCop / quantity : 0;

  return {
    recommendedSellPriceCop: roundCOP(recommendedSellPriceCop),
    recommendedSellPricePerUnitCop: roundCOP(recommendedSellPricePerUnitCop),
  };
}
