import type { CalculatorInputs } from '@/types/inputs';
import type { VolumetricResult } from './volumetric';

export interface FreightResult {
  freightUsd: number;
}

/**
 * Step 5: Compute freight cost based on selected mode.
 *
 * SEA_FCL: containerRate + surcharges + docs
 * SEA_LCL: chargeableLcl × ratePerWm + originCfs + destCfs + surcharges + docs
 * AIR:     chargeableAirKg × ratePerKg + surcharges + docs
 * EXPRESS: flat quoteUsd
 *
 * When incoterm = 'CIF', freight is bypassed (returns 0) — CIF is user-entered directly.
 */
export function computeFreight(
  inputs: CalculatorInputs,
  volume: VolumetricResult
): FreightResult {
  // CIF incoterm: freight is already included in the user-entered CIF value
  if (inputs.product.incoterm === 'CIF') {
    return { freightUsd: 0 };
  }

  const { mode, fcl, lcl, air, express } = inputs.freight;

  switch (mode) {
    case 'SEA_FCL': {
      const freightUsd =
        fcl.containerRateUsd + fcl.surchargesUsd + fcl.docsUsd;
      return { freightUsd };
    }

    case 'SEA_LCL': {
      const freightUsd =
        volume.chargeableLcl * lcl.ratePerWmUsd +
        lcl.originCfsUsd +
        lcl.destCfsUsd +
        lcl.surchargesUsd +
        lcl.docsUsd;
      return { freightUsd };
    }

    case 'AIR': {
      const freightUsd =
        volume.chargeableAirKg * air.ratePerKgUsd +
        air.surchargesUsd +
        air.docsUsd;
      return { freightUsd };
    }

    case 'EXPRESS': {
      return { freightUsd: express.quoteUsd };
    }
  }
}
