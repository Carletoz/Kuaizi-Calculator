import type { CalculatorInputs } from '@/types/inputs';
import type { ResultWarning } from '@/types/result';

export interface ProductResult {
  productValueUsd: number;
  warnings: ResultWarning[];
}

/**
 * Steps 1–3: Compute product value in USD.
 * - CNY: productValueUsd = (unitPrice / cnyToUsd) × quantity
 * - USD: productValueUsd = unitPrice × quantity
 */
export function computeProductValue(inputs: CalculatorInputs): ProductResult {
  const { unitPrice, priceCurrency, cnyToUsd, quantity } = inputs.product;
  const warnings: ResultWarning[] = [];

  if (quantity === 0) {
    warnings.push({
      kind: 'quantity-zero',
      message: 'La cantidad es 0. Los costos por unidad no se pueden calcular.',
    });
  }

  let productValueUsd: number;

  if (priceCurrency === 'CNY') {
    if (cnyToUsd <= 0) {
      // Zero exchange rate guard — return 0 and log warning
      warnings.push({
        kind: 'quantity-zero',
        message: 'La tasa CNY/USD es 0 o inválida. El valor del producto no puede calcularse.',
      });
      return { productValueUsd: 0, warnings };
    }
    productValueUsd = (unitPrice / cnyToUsd) * quantity;
  } else {
    productValueUsd = unitPrice * quantity;
  }

  return { productValueUsd, warnings };
}
