import type { CalculatorState } from './reducer';
import type { CalculatorInputs } from '@/types/inputs';

/**
 * Projects CalculatorState → CalculatorInputs (the engine's contract).
 * Missing optional fields → 0 at this boundary, NOT inside formulas.
 * This is the single point of truth for state-to-engine mapping.
 */
export function selectInputs(state: CalculatorState): CalculatorInputs {
  return {
    mode: state.mode,
    ddp: {
      cbmTotal: state.ddp.cbmTotal || 0,
      tarifaDdpCopPerCbm: state.ddp.tarifaDdpCopPerCbm || 0,
    },
    product: {
      description: state.product.description,
      hsCategoryId: state.product.hsCategoryId,
      hsCodeOverride: state.product.hsCodeOverride,
      unitPrice: state.product.unitPrice || 0,
      priceCurrency: state.product.priceCurrency,
      cnyToUsd: state.product.cnyToUsd || 0,
      quantity: state.product.quantity || 0,
      unitWeightKg: state.product.unitWeightKg || 0,
      dimensionsCm: {
        l: state.product.dimensionsCm.l || 0,
        w: state.product.dimensionsCm.w || 0,
        h: state.product.dimensionsCm.h || 0,
      },
      incoterm: state.product.incoterm,
      originCity: state.product.originCity,
    },
    china: {
      inlandFreightUsd: state.china.inlandFreightUsd || 0,
      exportCustomsUsd: state.china.exportCustomsUsd || 0,
      coFeeUsd: state.china.coFeeUsd || 0,
      inspectionUsd: state.china.inspectionUsd || 0,
      sourcingUsd: state.china.sourcingUsd || 0,
      packagingUsd: state.china.packagingUsd || 0,
      warehouseUsd: state.china.warehouseUsd || 0,
    },
    freight: {
      mode: state.freight.mode,
      fcl: {
        containerRateUsd: state.freight.fcl.containerRateUsd || 0,
        surchargesUsd: state.freight.fcl.surchargesUsd || 0,
        docsUsd: state.freight.fcl.docsUsd || 0,
      },
      lcl: {
        ratePerWmUsd: state.freight.lcl.ratePerWmUsd || 0,
        originCfsUsd: state.freight.lcl.originCfsUsd || 0,
        destCfsUsd: state.freight.lcl.destCfsUsd || 0,
        surchargesUsd: state.freight.lcl.surchargesUsd || 0,
        docsUsd: state.freight.lcl.docsUsd || 0,
      },
      air: {
        ratePerKgUsd: state.freight.air.ratePerKgUsd || 0,
        surchargesUsd: state.freight.air.surchargesUsd || 0,
        docsUsd: state.freight.air.docsUsd || 0,
      },
      express: {
        quoteUsd: state.freight.express.quoteUsd || 0,
      },
      portLoading: state.freight.portLoading,
      portDestination: state.freight.portDestination,
      cifDirectUsd: state.freight.cifDirectUsd || 0,
    },
    insurance: {
      enabled: state.insurance.enabled,
      ratePct: state.insurance.ratePct || 0,
    },
    customs: {
      arancelRate: state.customs.arancelRate || 0,
      ivaRate: state.customs.ivaRate || 0,
      antidumping: {
        enabled: state.customs.antidumping.enabled,
        rate: state.customs.antidumping.rate || 0,
      },
      vuceCop: state.customs.vuceCop || 0,
      customsAgentUsd: state.customs.customsAgentUsd || 0,
      portThcUsd: state.customs.portThcUsd || 0,
      portStorageUsd: state.customs.portStorageUsd || 0,
      dianInspectionUsd: state.customs.dianInspectionUsd || 0,
      invimaIcaUsd: state.customs.invimaIcaUsd || 0,
      trm: {
        value: state.customs.trm.value || 0,
        date: state.customs.trm.date || '',
      },
    },
    local: {
      transportUsd: state.local.transportUsd || 0,
      insuranceUsd: state.local.insuranceUsd || 0,
      warehousingUsd: state.local.warehousingUsd || 0,
      destinationCity: state.local.destinationCity,
    },
    financial: {
      bankWireUsd: state.financial.bankWireUsd || 0,
      financeRatePct: state.financial.financeRatePct || 0,
    },
    kuaizi: {
      sourcingUsd: state.kuaizi.sourcingUsd || 0,
      inspectionUsd: state.kuaizi.inspectionUsd || 0,
      managementUsd: state.kuaizi.managementUsd || 0,
    },
    margin: {
      targetPct: state.margin.targetPct || 0,
    },
  };
}
