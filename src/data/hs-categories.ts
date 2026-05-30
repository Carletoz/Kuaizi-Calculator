import type { HSCategory } from '@/types/domain';
import rawCategories from './hs-categories.json';

function isHSCategory(obj: unknown): obj is HSCategory {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.label === 'string' &&
    typeof o.arancelRate === 'number' &&
    typeof o.ivaRate === 'number' &&
    typeof o.antidumpingRisk === 'boolean' &&
    typeof o.invimaRequired === 'boolean' &&
    Array.isArray(o.exampleHSCodes) &&
    (o.exampleHSCodes as unknown[]).every((c) => typeof c === 'string')
  );
}

export const ALL_HS_CATEGORIES: HSCategory[] = (rawCategories as unknown[]).filter(
  isHSCategory
);

export function getHSCategory(id: string): HSCategory | undefined {
  return ALL_HS_CATEGORIES.find((cat) => cat.id === id);
}

/** Returns the rate bucket label for a given decimal arancel rate */
export function getArancelBucketLabel(rate: number): string {
  const pct = Math.round(rate * 100);
  if ([0, 5, 10, 15, 20].includes(pct)) return `${pct}%`;
  return `${pct}% (personalizado)`;
}
