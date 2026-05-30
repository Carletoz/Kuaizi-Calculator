import type { CalculatorInputs } from '@/types/inputs';
import type { CalculatorResult, ResultWarning } from '@/types/result';
import { computeProductValue } from './product';
import { computeVolume } from './volumetric';
import { computeFreight } from './freight';
import { computeInsurance } from './insurance';
import { computeDuties } from './duties';
import { computeNationalization } from './nationalization';
import { computeTotals } from './totals';
import { computeMargin } from './margin';
import { roundCOP, roundUSD } from './rounding';
import { getHSCategory } from '@/data/hs-categories';

/**
 * Main calculation entry point.
 * Orchestrates all sub-modules in the correct order:
 * product → volume → FOB → freight → insurance → CIF → duties →
 * nationalization → totals → margin → warnings
 *
 * Pure function: no side effects, no DOM, no React imports.
 */
export function calculateLandedCost(inputs: CalculatorInputs): CalculatorResult {
  const warnings: ResultWarning[] = [];
  const trm = inputs.customs.trm.value;

  // ── Step 1-3: Product value ─────────────────────────────────────────────────
  const { productValueUsd, warnings: productWarnings } = computeProductValue(inputs);
  warnings.push(...productWarnings);

  // ── Step 4: Volumetric ──────────────────────────────────────────────────────
  const volume = computeVolume(inputs);

  // ── FOB calculation ─────────────────────────────────────────────────────────
  // EXW: fob = product + all china-side costs
  // FOB: fob = product (china-side = 0, user enters it as the "price at port")
  // CIF: fob = 0, freight = 0, insurance = 0 — user enters CIF directly
  let fobUsd = 0;
  let chinaSideUsd = 0;

  if (inputs.product.incoterm === 'CIF') {
    // CIF incoterm: all three are 0, cif_USD comes from direct entry
    fobUsd = 0;
    chinaSideUsd = 0;
  } else if (inputs.product.incoterm === 'EXW') {
    const c = inputs.china;
    chinaSideUsd =
      c.inlandFreightUsd +
      c.exportCustomsUsd +
      c.coFeeUsd +
      c.inspectionUsd +
      c.sourcingUsd +
      c.packagingUsd +
      c.warehouseUsd;
    fobUsd = productValueUsd + chinaSideUsd;
  } else {
    // FOB: china-side is 0 at engine level (user provided price already at port)
    chinaSideUsd = 0;
    fobUsd = productValueUsd;
  }

  // ── Mode branch: kuaizi vs completo ─────────────────────────────────────────
  let freightUsd = 0;
  let insuranceUsd = 0;
  let cifUsd = 0;
  let duties = {
    cifCop: 0,
    arancelCop: 0,
    baseGravableIvaCop: 0,
    ivaCop: 0,
    antidumpingCop: 0,
    totalTributosCop: 0,
    totalTributosUsd: 0,
  };
  let nationalization = { nationalizationCop: 0, nationalizationUsd: 0 };
  let ddpCop = 0;
  let ddpUsd = 0;

  if (inputs.mode === 'kuaizi') {
    // Kuaizi path: skip freight/insurance/duties/nationalization
    ddpCop = inputs.ddp.cbmTotal * inputs.ddp.tarifaDdpCopPerCbm;
    ddpUsd = trm > 0 ? ddpCop / trm : 0;
  } else {
    // Completo path: existing chain — byte-identical
    // ── Step 5: Freight ───────────────────────────────────────────────────────
    freightUsd = computeFreight(inputs, volume).freightUsd;

    // ── Step 6: Insurance ─────────────────────────────────────────────────────
    insuranceUsd = inputs.product.incoterm === 'CIF'
      ? 0
      : computeInsurance(
          fobUsd,
          freightUsd,
          inputs.insurance.enabled,
          inputs.insurance.ratePct
        ).insuranceUsd;

    // ── CIF ───────────────────────────────────────────────────────────────────
    cifUsd = inputs.product.incoterm === 'CIF'
      ? inputs.freight.cifDirectUsd
      : fobUsd + freightUsd + insuranceUsd;

    // ── Steps 7-8: Duties ─────────────────────────────────────────────────────
    duties = computeDuties(
      cifUsd,
      trm,
      inputs.customs.arancelRate,
      inputs.customs.ivaRate,
      inputs.customs.antidumping
    );

    // ── Step 9: Nationalization ───────────────────────────────────────────────
    nationalization = computeNationalization(inputs.customs);
  }

  // ── Steps 10-13: Totals ─────────────────────────────────────────────────────
  const totals = computeTotals({
    cifUsd,
    totalTributosUsd: duties.totalTributosUsd,
    nationalizationUsd: nationalization.nationalizationUsd,
    localTransportUsd: inputs.local.transportUsd,
    localInsuranceUsd: inputs.local.insuranceUsd,
    localWarehousingUsd: inputs.local.warehousingUsd,
    bankWireUsd: inputs.financial.bankWireUsd,
    financeRatePct: inputs.financial.financeRatePct,
    kuaiziSourcingUsd: inputs.kuaizi.sourcingUsd,
    kuaiziInspectionUsd: inputs.kuaizi.inspectionUsd,
    kuaiziManagementUsd: inputs.kuaizi.managementUsd,
    quantity: inputs.product.quantity,
    trm,
    ...(inputs.mode === 'kuaizi' ? { ddpUsd } : {}),
  });

  // ── Margin calculator ───────────────────────────────────────────────────────
  const margin = computeMargin(
    totals.totalLandedCop,
    inputs.product.quantity,
    inputs.margin.targetPct
  );

  // ── Warnings ────────────────────────────────────────────────────────────────
  // TRM staleness: warn if TRM date is more than 7 days old
  if (inputs.customs.trm.date) {
    const trmDate = new Date(inputs.customs.trm.date);
    const now = new Date();
    const diffDays = (now.getTime() - trmDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 7) {
      warnings.push({
        kind: 'trm-stale',
        message: `La TRM ingresada tiene ${Math.floor(diffDays)} días de antigüedad. Se recomienda actualizar antes de presentar la cotización.`,
      });
    }
  }

  // INVIMA / antidumping warnings from HS category
  if (inputs.product.hsCategoryId) {
    const cat = getHSCategory(inputs.product.hsCategoryId);
    if (cat?.invimaRequired) {
      warnings.push({
        kind: 'invima',
        message:
          'Esta categoría puede requerir permiso INVIMA/ICA. Consulte con su agente de aduanas antes de importar.',
      });
    }
    if (cat?.antidumpingRisk) {
      warnings.push({
        kind: 'antidumping',
        message:
          'Antidumping activo para esta categoría. Consulte con su agente de aduanas la aplicabilidad específica.',
      });
    }
  }

  if (inputs.customs.antidumping.enabled) {
    const alreadyWarned = warnings.some((w) => w.kind === 'antidumping');
    if (!alreadyWarned) {
      warnings.push({
        kind: 'antidumping',
        message:
          'Antidumping activo. Consulte con su agente de aduanas la aplicabilidad específica.',
      });
    }
  }

  // ── Build result ─────────────────────────────────────────────────────────────
  return {
    productValueUsd: roundUSD(productValueUsd),
    chinaSideUsd: roundUSD(chinaSideUsd),
    fobUsd: roundUSD(fobUsd),

    volumeCbm: volume.volumeCbm,
    weightMt: volume.weightMt,
    chargeableLcl: volume.chargeableLcl,
    chargeableAirKg: volume.chargeableAirKg,

    freightUsd: roundUSD(freightUsd),
    insuranceUsd: roundUSD(insuranceUsd),

    cifUsd: roundUSD(cifUsd),
    cifCop: roundCOP(duties.cifCop),

    arancelCop: roundCOP(duties.arancelCop),
    baseGravableIvaCop: roundCOP(duties.baseGravableIvaCop),
    ivaCop: roundCOP(duties.ivaCop),
    antidumpingCop: roundCOP(duties.antidumpingCop),
    totalTributosCop: roundCOP(duties.totalTributosCop),
    totalTributosUsd: roundUSD(duties.totalTributosUsd),

    nationalizationCop: roundCOP(nationalization.nationalizationCop),
    nationalizationUsd: roundUSD(nationalization.nationalizationUsd),

    ddpCop: roundCOP(ddpCop),
    ddpUsd: roundUSD(ddpUsd),

    localUsd: totals.localUsd,
    financialUsd: totals.financialUsd,
    kuaiziUsd: totals.kuaiziUsd,

    totalLandedUsd: totals.totalLandedUsd,
    totalLandedCop: totals.totalLandedCop,
    costPerUnitUsd: totals.costPerUnitUsd,
    costPerUnitCop: totals.costPerUnitCop,

    recommendedSellPriceCop: margin.recommendedSellPriceCop,
    recommendedSellPricePerUnitCop: margin.recommendedSellPricePerUnitCop,

    warnings,
    trmUsed: inputs.customs.trm,
  };
}
