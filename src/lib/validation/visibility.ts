import type { CalculatorState } from '@/state/reducer';
import { getHSCategory } from '@/data/hs-categories';

/**
 * Declarative visibility predicates.
 * Each field/section reads its own predicate — no imperative flags scattered across components.
 * All predicates are pure functions: (state) => boolean.
 */
export const visibility = {
  /** Section B (China-side costs) is visible unless incoterm = CIF */
  sectionB: (s: CalculatorState): boolean => s.product.incoterm !== 'CIF',

  /** CIF direct entry field — only shown for CIF incoterm */
  cifDirectEntry: (s: CalculatorState): boolean => s.product.incoterm === 'CIF',

  /** Inland freight — visible for EXW and FOB (not CIF, supplier handles everything) */
  chinaInland: (s: CalculatorState): boolean => s.product.incoterm !== 'CIF',

  /** Export customs — visible for EXW and FOB (not CIF, supplier handles everything) */
  chinaExportCustoms: (s: CalculatorState): boolean => s.product.incoterm !== 'CIF',

  /** CNY/USD rate field — visible only when price currency is CNY */
  cnyRate: (s: CalculatorState): boolean => s.product.priceCurrency === 'CNY',

  /** FCL sub-form */
  freightFCL: (s: CalculatorState): boolean => s.freight.mode === 'SEA_FCL',

  /** LCL sub-form */
  freightLCL: (s: CalculatorState): boolean => s.freight.mode === 'SEA_LCL',

  /** Air sub-form */
  freightAir: (s: CalculatorState): boolean => s.freight.mode === 'AIR',

  /** Express sub-form */
  freightExpress: (s: CalculatorState): boolean => s.freight.mode === 'EXPRESS',

  /** Insurance rate field — visible only when insurance is enabled */
  insuranceRate: (s: CalculatorState): boolean => s.insurance.enabled,

  /** Antidumping rate field — visible only when antidumping is enabled */
  antidumpingRate: (s: CalculatorState): boolean => s.customs.antidumping.enabled,

  /** INVIMA warning — driven by HS category flag */
  invimaWarning: (s: CalculatorState): boolean => {
    if (!s.product.hsCategoryId) return false;
    const cat = getHSCategory(s.product.hsCategoryId);
    return cat?.invimaRequired ?? false;
  },

  /** Antidumping risk warning — driven by HS category flag */
  antidumpingWarning: (s: CalculatorState): boolean => {
    if (!s.product.hsCategoryId) return false;
    const cat = getHSCategory(s.product.hsCategoryId);
    return cat?.antidumpingRisk ?? false;
  },

  /** Section C (Freight) — hidden in kuaizi mode */
  sectionC: (s: CalculatorState): boolean => s.mode === 'completo',

  /** Section D (Insurance) — hidden in kuaizi mode */
  sectionDInsurance: (s: CalculatorState): boolean => s.mode === 'completo',

  /** Section E (Customs) — hidden in kuaizi mode */
  sectionECustoms: (s: CalculatorState): boolean => s.mode === 'completo',

  /** SectionKuaiziDDP — visible only in kuaizi mode */
  sectionKuaiziDdp: (s: CalculatorState): boolean => s.mode === 'kuaizi',
};
