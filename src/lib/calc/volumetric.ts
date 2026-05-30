import type { CalculatorInputs } from '@/types/inputs';

export interface VolumetricResult {
  volumeCbm: number;
  weightMt: number;
  chargeableLcl: number;
  chargeableAirKg: number;
}

/**
 * Step 4: Compute volumetric figures.
 *
 * volumeCbm = (L × W × H / 1_000_000) × quantity
 * weightMt  = unitWeightKg × quantity / 1000
 * chargeableLcl    = max(volumeCbm, weightMt)
 * chargeableAirKg  = max(actualKgTotal, (L × W × H / 6000) × quantity)
 */
export function computeVolume(inputs: CalculatorInputs): VolumetricResult {
  const { l, w, h } = inputs.product.dimensionsCm;
  const { quantity, unitWeightKg } = inputs.product;

  const volumeCbm = (l * w * h / 1_000_000) * quantity;
  const weightMt = (unitWeightKg * quantity) / 1000;
  const chargeableLcl = Math.max(volumeCbm, weightMt);

  const actualKgTotal = unitWeightKg * quantity;
  const volumetricKg = (l * w * h / 6000) * quantity;
  const chargeableAirKg = Math.max(actualKgTotal, volumetricKg);

  return { volumeCbm, weightMt, chargeableLcl, chargeableAirKg };
}
