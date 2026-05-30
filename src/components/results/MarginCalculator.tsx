import { useCalculator } from '@/state/context';
import { NumberField } from '@/components/ui/NumberField';

function fmtCOP(v: number): string {
  return v.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function MarginCalculator() {
  const { state, dispatch, result } = useCalculator();
  const { targetPct } = state.margin;

  return (
    <div className="rounded-md border border-kuaizi-accent/30 bg-kuaizi-accent/5 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-kuaizi-secondary">Calculadora de margen</h3>

      <NumberField
        label="Margen objetivo"
        value={targetPct}
        onChange={(v) => dispatch({ type: 'SET_MARGIN', payload: { targetPct: Math.min(99, Math.max(0, v)) } })}
        suffix="%"
        step={1}
        min={0}
        max={99}
        hint="0–99%"
      />

      {targetPct > 0 && result.recommendedSellPriceCop > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-gray-600">Precio de venta recomendado:</span>
            <span className="font-bold text-kuaizi-secondary text-base">
              {fmtCOP(result.recommendedSellPriceCop)}
            </span>
          </div>
          {result.recommendedSellPricePerUnitCop > 0 && (
            <div className="flex justify-between items-baseline text-sm">
              <span className="text-gray-600">Por unidad:</span>
              <span className="font-semibold text-kuaizi-secondary">
                {fmtCOP(result.recommendedSellPricePerUnitCop)}
              </span>
            </div>
          )}
        </div>
      )}

      {targetPct >= 100 && (
        <p className="text-xs text-red-600">
          El margen no puede ser 100% o más. Ingrese un valor entre 0 y 99%.
        </p>
      )}
    </div>
  );
}
