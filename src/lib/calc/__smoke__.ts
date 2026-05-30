/**
 * Smoke test harness for the calculation engine.
 * Run via: npx tsx src/lib/calc/__smoke__.ts
 *
 * Validates 5 cases and logs actual vs. expected per line item.
 * All cases must pass within ≤0.5% delta on every CalculatorResult field.
 */

import { calculateLandedCost } from './index';
import type { CalculatorInputs } from '../../types/inputs';
// CalculatorResult type used for documentation purposes only

const TOLERANCE = 0.005; // 0.5%

function pct(actual: number, expected: number): number {
  if (expected === 0) return actual === 0 ? 0 : Infinity;
  return Math.abs((actual - expected) / expected);
}

function check(label: string, actual: number, expected: number): boolean {
  const delta = pct(actual, expected);
  const pass = delta <= TOLERANCE;
  const mark = pass ? '✓' : '✗';
  const deltaStr = (delta * 100).toFixed(3) + '%';
  console.log(`  ${mark} ${label}: actual=${actual} expected=${expected} delta=${deltaStr}`);
  return pass;
}

function makeBaseInputs(): CalculatorInputs {
  return {
    mode: 'completo',
    ddp: { cbmTotal: 0, tarifaDdpCopPerCbm: 0 },
    product: {
      description: 'Test product',
      hsCategoryId: null,
      hsCodeOverride: null,
      unitPrice: 10,
      priceCurrency: 'USD',
      cnyToUsd: 0.14,
      quantity: 100,
      unitWeightKg: 2,
      dimensionsCm: { l: 50, w: 40, h: 30 },
      incoterm: 'EXW',
      originCity: 'GUANGZHOU',
    },
    china: {
      inlandFreightUsd: 200,
      exportCustomsUsd: 150,
      coFeeUsd: 50,
      inspectionUsd: 100,
      sourcingUsd: 0,
      packagingUsd: 80,
      warehouseUsd: 70,
    },
    freight: {
      mode: 'SEA_LCL',
      fcl: { containerRateUsd: 0, surchargesUsd: 0, docsUsd: 0 },
      lcl: { ratePerWmUsd: 50, originCfsUsd: 80, destCfsUsd: 100, surchargesUsd: 60, docsUsd: 40 },
      air: { ratePerKgUsd: 0, surchargesUsd: 0, docsUsd: 0 },
      express: { quoteUsd: 0 },
      portLoading: 'GUANGZHOU',
      portDestination: 'BUENAVENTURA',
      cifDirectUsd: 0,
    },
    insurance: { enabled: false, ratePct: 0.0035 },
    customs: {
      arancelRate: 0.10,
      ivaRate: 0.19,
      antidumping: { enabled: false, rate: 0 },
      vuceCop: 39840,
      customsAgentUsd: 250,
      portThcUsd: 150,
      portStorageUsd: 100,
      dianInspectionUsd: 80,
      invimaIcaUsd: 0,
      trm: { value: 4200, date: new Date().toISOString().split('T')[0] },
    },
    local: { transportUsd: 300, insuranceUsd: 0, warehousingUsd: 0, destinationCity: 'Bogotá' },
    financial: { bankWireUsd: 35, financeRatePct: 0 },
    kuaizi: { sourcingUsd: 0, inspectionUsd: 0, managementUsd: 0 },
    margin: { targetPct: 0 },
  };
}

// ─── Case 1: EXW + Sea-LCL ───────────────────────────────────────────────────
function case1(): boolean {
  console.log('\n── Case 1: EXW + Sea-LCL (happy path) ──');
  const inputs = makeBaseInputs();
  const r = calculateLandedCost(inputs);

  // Manual calculation:
  // productValueUsd = 10 × 100 = 1000
  // chinaSideUsd = 200+150+50+100+0+80+70 = 650
  // fobUsd = 1000+650 = 1650
  // volume: l=50,w=40,h=30 → cbm=(50×40×30/1_000_000)×100 = 0.06×100 = 6.0 cbm
  // weightMt = 2×100/1000 = 0.2 mt
  // chargeableLcl = max(6.0, 0.2) = 6.0
  // freightUsd = 6.0×50 + 80+100+60+40 = 300+280 = 580
  // insuranceUsd = 0 (disabled)
  // cifUsd = 1650+580+0 = 2230
  // cifCop = 2230×4200 = 9_366_000
  // arancelCop = 9_366_000×0.10 = 936_600
  // baseGravableIva = 9_366_000+936_600 = 10_302_600
  // ivaCop = 10_302_600×0.19 = 1_957_494
  // antidumpingCop = 0
  // totalTributosCop = 936_600+1_957_494 = 2_894_094
  // totalTributosUsd = 2_894_094/4200 = 689.07
  // nationalization: (250+150+100+80+0)×4200 + 39840 = 2_520_000+39_840=2_559_840 cop
  //   nationalizationUsd = 2_559_840/4200 = 609.486...
  // localUsd = 300
  // financialUsd = 35 + 0 = 35
  // kuaiziUsd = 0
  // totalLandedUsd = 2230 + 689.07 + 609.486 + 300 + 35 + 0 = 3863.56
  // totalLandedCop = 3863.56 × 4200 ≈ 16_226_952

  let pass = true;
  pass = check('productValueUsd', r.productValueUsd, 1000) && pass;
  pass = check('chinaSideUsd', r.chinaSideUsd, 650) && pass;
  pass = check('fobUsd', r.fobUsd, 1650) && pass;
  pass = check('volumeCbm', r.volumeCbm, 6.0) && pass;
  pass = check('chargeableLcl', r.chargeableLcl, 6.0) && pass;
  pass = check('freightUsd', r.freightUsd, 580) && pass;
  pass = check('cifUsd', r.cifUsd, 2230) && pass;
  pass = check('cifCop', r.cifCop, 9_366_000) && pass;
  pass = check('arancelCop', r.arancelCop, 936_600) && pass;
  pass = check('baseGravableIvaCop', r.baseGravableIvaCop, 10_302_600) && pass;
  pass = check('ivaCop', r.ivaCop, 1_957_494) && pass;
  pass = check('totalTributosCop', r.totalTributosCop, 2_894_094) && pass;

  // Check no NaN or undefined
  for (const [k, v] of Object.entries(r)) {
    if (typeof v === 'number' && (isNaN(v) || !isFinite(v))) {
      console.log(`  ✗ NaN/Infinity detected in field: ${k} = ${v}`);
      pass = false;
    }
  }

  return pass;
}

// ─── Case 2: CIF incoterm — no null leakage ──────────────────────────────────
function case2(): boolean {
  console.log('\n── Case 2: CIF incoterm (no null leakage) ──');
  const inputs = makeBaseInputs();
  inputs.product.incoterm = 'CIF';
  inputs.freight.cifDirectUsd = 3000; // user enters CIF directly

  const r = calculateLandedCost(inputs);

  // CIF: fob=0, freight=0, insurance=0, cifUsd=3000
  // cifCop = 3000×4200 = 12_600_000
  // arancelCop = 12_600_000×0.10 = 1_260_000
  // baseGravableIva = 12_600_000+1_260_000 = 13_860_000
  // ivaCop = 13_860_000×0.19 = 2_633_400

  let pass = true;
  pass = check('fobUsd', r.fobUsd, 0) && pass;
  pass = check('freightUsd', r.freightUsd, 0) && pass;
  pass = check('insuranceUsd', r.insuranceUsd, 0) && pass;
  pass = check('cifUsd', r.cifUsd, 3000) && pass;
  pass = check('cifCop', r.cifCop, 12_600_000) && pass;
  pass = check('arancelCop', r.arancelCop, 1_260_000) && pass;
  pass = check('baseGravableIvaCop', r.baseGravableIvaCop, 13_860_000) && pass;
  pass = check('ivaCop', r.ivaCop, 2_633_400) && pass;

  // No NaN
  for (const [k, v] of Object.entries(r)) {
    if (typeof v === 'number' && (isNaN(v) || !isFinite(v))) {
      console.log(`  ✗ NaN/Infinity in: ${k} = ${v}`);
      pass = false;
    }
  }

  return pass;
}

// ─── Case 3: Antidumping ON — correct amount added ───────────────────────────
function case3(): boolean {
  console.log('\n── Case 3: Antidumping ON (rate 40%) ──');
  const inputs = makeBaseInputs();
  inputs.product.incoterm = 'FOB';
  // With FOB, chinaSide=0, fob = productValue = 1000
  // freight LCL: chargeableLcl=6.0, freight=6×50+80+100+60+40=580
  // cifUsd = 1000+580+0 = 1580
  // cifCop = 1580×4200 = 6_636_000
  // arancelCop = 6_636_000×0.10 = 663_600
  // baseGravableIva = 6_636_000+663_600 = 7_299_600
  // ivaCop = 7_299_600×0.19 = 1_386_924
  // antidumpingCop = 6_636_000×0.40 = 2_654_400
  // totalTributosCop = 663_600+1_386_924+2_654_400 = 4_704_924
  inputs.customs.antidumping = { enabled: true, rate: 0.40 };

  const r = calculateLandedCost(inputs);

  let pass = true;
  pass = check('fobUsd', r.fobUsd, 1000) && pass;
  pass = check('cifUsd', r.cifUsd, 1580) && pass;
  pass = check('cifCop', r.cifCop, 6_636_000) && pass;
  pass = check('antidumpingCop', r.antidumpingCop, 2_654_400) && pass;
  pass = check('totalTributosCop', r.totalTributosCop, 4_704_924) && pass;

  const hasAntidumpingWarning = r.warnings.some((w) => w.kind === 'antidumping');
  console.log(`  ${hasAntidumpingWarning ? '✓' : '✗'} antidumping warning present`);
  pass = pass && hasAntidumpingWarning;

  return pass;
}

// ─── Case 4: Air freight — volumetric > actual ───────────────────────────────
function case4(): boolean {
  console.log('\n── Case 4: Air freight (volumetric > actual) ──');
  const inputs = makeBaseInputs();
  inputs.freight.mode = 'AIR';
  // dimensions: l=50,w=40,h=30, qty=100
  // actualKg = 2×100 = 200
  // volumetricKg = (50×40×30/6000)×100 = 10×100 = 1000
  // chargeableAirKg = max(200,1000) = 1000
  inputs.freight.air = { ratePerKgUsd: 4, surchargesUsd: 100, docsUsd: 50 };
  // freightUsd = 1000×4 + 100+50 = 4150

  const r = calculateLandedCost(inputs);

  let pass = true;
  pass = check('chargeableAirKg', r.chargeableAirKg, 1000) && pass;
  pass = check('freightUsd', r.freightUsd, 4150) && pass;

  return pass;
}

// ─── Case 5: Margin calculator 30% ──────────────────────────────────────────
function case5(): boolean {
  console.log('\n── Case 5: Margin calculator 30% ──');
  const inputs = makeBaseInputs();
  inputs.margin.targetPct = 30;
  // Use simple inputs to get a known totalLandedCop
  // We'll just verify the formula: recommendedSellPriceCop = totalLandedCop / (1-0.30)
  const r = calculateLandedCost(inputs);
  const expectedSellPrice = r.totalLandedCop / 0.70;
  const expectedPerUnit = expectedSellPrice / inputs.product.quantity;

  let pass = true;
  pass = check('recommendedSellPriceCop', r.recommendedSellPriceCop, expectedSellPrice) && pass;
  pass = check('recommendedSellPricePerUnitCop', r.recommendedSellPricePerUnitCop, expectedPerUnit) && pass;

  return pass;
}

// ─── Run all cases ───────────────────────────────────────────────────────────
console.log('=== Shipping Calculator — Smoke Tests ===');
const results = [case1(), case2(), case3(), case4(), case5()];
const passed = results.filter(Boolean).length;
console.log(`\n=== Results: ${passed}/${results.length} cases passed ===`);
if (passed < results.length) {
  console.error('Some smoke tests FAILED. Check output above.');
  throw new Error(`${results.length - passed} smoke test(s) failed`);
}
