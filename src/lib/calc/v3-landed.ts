const CBM_COST_COP = 4_000_000;
const KUAIZI_MARGIN_RATE = 0.05;

export interface LandedCostInput {
  unitPriceRmb: number;
  piezasPorCaja: number;
  cbm: number;
  quantity: number;
  trmCopUsd: number;
  cnyToUsd: number;
  arancelRate?: number;
  ivaRate?: number;
  fleteInternoChinaRmb?: number;
}

export interface LandedCostResult {
  // intermediates (RMB)
  precioConMargenRmb: number;    // unitPriceRmb × 1.05
  totalChinaRmb: number;         // precioConMargenRmb × quantity + fleteInternoChinaRmb
  // logistics
  numCajas: number;              // quantity / piezasPorCaja
  fleteImpuestosCop: number;     // cbm × numCajas × 4_000_000
  // finals (COP)
  precioTotalFinalCop: number;   // totalChinaRmb × cnyToUsd × trmCopUsd + fleteImpuestosCop
  precioUnidadFinalCop: number;  // precioTotalFinalCop / quantity
}

export function calculateLandedCost(input: LandedCostInput): LandedCostResult {
  const numCajas = input.quantity / input.piezasPorCaja;
  const precioConMargenRmb = input.unitPriceRmb * (1 + KUAIZI_MARGIN_RATE);
  const totalChinaRmb = precioConMargenRmb * input.quantity + (input.fleteInternoChinaRmb ?? 0);
  const fleteImpuestosCop = input.cbm * numCajas * CBM_COST_COP;
  const precioTotalFinalCop = totalChinaRmb * input.cnyToUsd * input.trmCopUsd + fleteImpuestosCop;
  const precioUnidadFinalCop = precioTotalFinalCop / input.quantity;

  return {
    precioConMargenRmb,
    totalChinaRmb,
    numCajas,
    fleteImpuestosCop,
    precioTotalFinalCop,
    precioUnidadFinalCop,
  };
}
