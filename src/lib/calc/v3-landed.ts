const CBM_COST_COP = 4_000_000;
const KUAIZI_MARGIN_RATE = 0.05;
const INSURANCE_RATE = 0.0035;
const FALLBACK_IVA_RATE = 0.19;

export interface LandedCostInput {
  unitPriceRmb: number;
  piezasPorCaja: number;
  cbm: number;
  quantity: number;
  trmCopUsd: number;
  cnyToUsd: number;
  arancelRate?: number;
  ivaRate?: number;
}

export interface LandedCostResult {
  // breakdown per unit
  exwPerUnit: number;
  kuaiziMarginPerUnit: number;
  freightPerUnit: number;
  insurancePerUnit: number;
  cifPerUnit: number;
  arancelPerUnit: number;
  ivaPerUnit: number;
  landedCostPerUnit: number;
  totalLandedCost: number;
  // kept for backward compat
  cbmCostUsd: number;
  cbmCostPerUnit: number;
  unitPriceUsd: number;
}

export function calculateLandedCost(input: LandedCostInput): LandedCostResult {
  const arancelRate = input.arancelRate ?? 0;
  const ivaRate = input.ivaRate ?? FALLBACK_IVA_RATE;

  const cbmCostUsd = CBM_COST_COP / input.trmCopUsd;
  const exwPerUnit = input.unitPriceRmb * input.cnyToUsd;
  const kuaiziMarginPerUnit = exwPerUnit * KUAIZI_MARGIN_RATE;
  const exwWithMarginPerUnit = exwPerUnit + kuaiziMarginPerUnit;
  const freightPerUnit = (input.cbm / input.piezasPorCaja) * cbmCostUsd;
  const insurancePerUnit = (exwWithMarginPerUnit + freightPerUnit) * INSURANCE_RATE;
  const cifPerUnit = exwWithMarginPerUnit + freightPerUnit + insurancePerUnit;
  const arancelPerUnit = cifPerUnit * arancelRate;
  const ivaPerUnit = (cifPerUnit + arancelPerUnit) * ivaRate;
  const landedCostPerUnit = cifPerUnit + arancelPerUnit + ivaPerUnit;
  const totalLandedCost = landedCostPerUnit * input.quantity;

  return {
    exwPerUnit,
    kuaiziMarginPerUnit,
    freightPerUnit,
    insurancePerUnit,
    cifPerUnit,
    arancelPerUnit,
    ivaPerUnit,
    landedCostPerUnit,
    totalLandedCost,
    cbmCostUsd,
    cbmCostPerUnit: freightPerUnit,
    unitPriceUsd: exwPerUnit,
  };
}
