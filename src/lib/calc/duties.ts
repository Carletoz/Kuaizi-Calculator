export interface DutiesResult {
  cifCop: number;
  arancelCop: number;
  baseGravableIvaCop: number;
  ivaCop: number;
  antidumpingCop: number;
  totalTributosCop: number;
  totalTributosUsd: number;
}

/**
 * Steps 7–8: Colombia customs duty cascade.
 *
 * CRITICAL: IVA base = cifCop + arancelCop — NOT cifCop alone.
 * Computing IVA on cifCop only is a defect per spec REQ-005.
 *
 * Sequential order (must not be reordered):
 * 1. cifCop = cifUsd × trm
 * 2. arancelCop = cifCop × arancelRate
 * 3. baseGravableIvaCop = cifCop + arancelCop   ← CRITICAL
 * 4. ivaCop = baseGravableIvaCop × ivaRate
 * 5. antidumpingCop = cifCop × antidumpingRate  (0 if disabled)
 * 6. totalTributosCop = arancelCop + ivaCop + antidumpingCop
 */
export function computeDuties(
  cifUsd: number,
  trm: number,
  arancelRate: number,
  ivaRate: number,
  antidumping: { enabled: boolean; rate: number }
): DutiesResult {
  // Step 1
  const cifCop = cifUsd * trm;

  // Step 2
  const arancelCop = cifCop * arancelRate;

  // Step 3 — CRITICAL: IVA base includes arancel
  const baseGravableIvaCop = cifCop + arancelCop;

  // Step 4
  const ivaCop = baseGravableIvaCop * ivaRate;

  // Step 5
  const antidumpingCop = antidumping.enabled ? cifCop * antidumping.rate : 0;

  // Step 6
  const totalTributosCop = arancelCop + ivaCop + antidumpingCop;

  // USD equivalent for aggregation
  const totalTributosUsd = trm > 0 ? totalTributosCop / trm : 0;

  return {
    cifCop,
    arancelCop,
    baseGravableIvaCop,
    ivaCop,
    antidumpingCop,
    totalTributosCop,
    totalTributosUsd,
  };
}
