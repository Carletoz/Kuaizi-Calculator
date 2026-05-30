import { roundCOP, roundUSD } from './rounding';

export interface TotalsResult {
  localUsd: number;
  financialUsd: number;
  kuaiziUsd: number;
  totalLandedUsd: number;
  totalLandedCop: number;
  costPerUnitUsd: number;
  costPerUnitCop: number;
}

export interface TotalsInput {
  cifUsd: number;
  totalTributosUsd: number;
  nationalizationUsd: number;
  localTransportUsd: number;
  localInsuranceUsd: number;
  localWarehousingUsd: number;
  bankWireUsd: number;
  financeRatePct: number;
  kuaiziSourcingUsd: number;
  kuaiziInspectionUsd: number;
  kuaiziManagementUsd: number;
  quantity: number;
  trm: number;
  /** Kuaizi mode only: overrides cifUsd+totalTributosUsd+nationalizationUsd in the landed cost */
  ddpUsd?: number;
}

/**
 * Steps 10–13: Compute totals.
 *
 * Rounding is applied ONLY here via roundUSD / roundCOP.
 * All upstream values are raw floats.
 *
 * Division guard: quantity === 0 → costPerUnit = 0, pushes quantity-zero warning upstream.
 */
export function computeTotals(input: TotalsInput): TotalsResult {
  const {
    cifUsd,
    totalTributosUsd,
    nationalizationUsd,
    localTransportUsd,
    localInsuranceUsd,
    localWarehousingUsd,
    bankWireUsd,
    financeRatePct,
    kuaiziSourcingUsd,
    kuaiziInspectionUsd,
    kuaiziManagementUsd,
    quantity,
    trm,
    ddpUsd,
  } = input;

  const localUsd = localTransportUsd + localInsuranceUsd + localWarehousingUsd;
  const kuaiziUsd = kuaiziSourcingUsd + kuaiziInspectionUsd + kuaiziManagementUsd;

  // Kuaizi mode: ddpUsd overrides the cif+tributos+nationalization block
  const isKuaiziOverride = ddpUsd !== undefined && ddpUsd > 0;

  // Financial: bank wire + finance rate applied to total pre-financial cost
  const prefinancialUsd = isKuaiziOverride
    ? ddpUsd + localUsd + kuaiziUsd
    : cifUsd + totalTributosUsd + nationalizationUsd + localUsd + kuaiziUsd;
  const financialUsd = bankWireUsd + prefinancialUsd * financeRatePct;

  // Total landed cost — Kuaizi path uses ddpUsd in place of cif+tributos+nat
  const totalLandedUsd = isKuaiziOverride
    ? ddpUsd + localUsd + financialUsd + kuaiziUsd
    : cifUsd +
      totalTributosUsd +
      nationalizationUsd +
      localUsd +
      financialUsd +
      kuaiziUsd;

  const totalLandedCop = totalLandedUsd * trm;

  // Division guard: quantity === 0 returns 0 (not NaN)
  const costPerUnitUsd = quantity > 0 ? totalLandedUsd / quantity : 0;
  const costPerUnitCop = quantity > 0 ? totalLandedCop / quantity : 0;

  return {
    localUsd: roundUSD(localUsd),
    financialUsd: roundUSD(financialUsd),
    kuaiziUsd: roundUSD(kuaiziUsd),
    totalLandedUsd: roundUSD(totalLandedUsd),
    totalLandedCop: roundCOP(totalLandedCop),
    costPerUnitUsd: roundUSD(costPerUnitUsd),
    costPerUnitCop: roundCOP(costPerUnitCop),
  };
}
