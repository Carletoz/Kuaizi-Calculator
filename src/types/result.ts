export type WarningKind = 'antidumping' | 'invima' | 'trm-stale' | 'quantity-zero';

export interface ResultWarning {
  kind: WarningKind;
  message: string;
}

export interface CalculatorResult {
  // Product
  productValueUsd: number;

  // China-side
  chinaSideUsd: number;

  // FOB
  fobUsd: number;

  // Volumetric
  volumeCbm: number;
  weightMt: number;
  chargeableLcl: number;
  chargeableAirKg: number;

  // Freight
  freightUsd: number;

  // Insurance
  insuranceUsd: number;

  // CIF
  cifUsd: number;
  cifCop: number;

  // Duties (Colombia cascade)
  arancelCop: number;
  baseGravableIvaCop: number;
  ivaCop: number;
  antidumpingCop: number;
  totalTributosCop: number;
  totalTributosUsd: number;

  // Nationalization
  nationalizationCop: number;
  nationalizationUsd: number;

  // Kuaizi mode DDP consolidated value (0 in completo mode)
  ddpCop: number;
  ddpUsd: number;

  // Post-customs
  localUsd: number;
  financialUsd: number;
  kuaiziUsd: number;

  // Totals
  totalLandedUsd: number;
  totalLandedCop: number;
  costPerUnitUsd: number;
  costPerUnitCop: number;

  // Margin calculator
  recommendedSellPriceCop: number;
  recommendedSellPricePerUnitCop: number;

  // Meta
  warnings: ResultWarning[];
  trmUsed: { value: number; date: string };
}
