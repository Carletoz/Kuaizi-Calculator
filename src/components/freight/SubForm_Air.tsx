import { useCalculator } from '@/state/context';
import { NumberField } from '@/components/ui/NumberField';

export function SubForm_Air() {
  const { state, dispatch, result } = useCalculator();
  const { air } = state.freight;

  return (
    <div className="space-y-3 rounded-md bg-gray-50 p-3 border border-gray-200">
      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Aéreo</p>

      <div className="flex gap-3 text-xs text-gray-600 bg-white rounded border border-gray-200 p-2">
        <span>
          Peso real: <strong>{(state.product.unitWeightKg * state.product.quantity).toFixed(1)} kg</strong>
        </span>
        <span className="text-kuaizi-accent font-medium">
          Peso cobrable: <strong>{result.chargeableAirKg.toFixed(1)} kg</strong>
        </span>
      </div>

      <NumberField
        label="Tarifa por kg"
        value={air.ratePerKgUsd}
        onChange={(v) => dispatch({ type: 'SET_FREIGHT_AIR', payload: { ratePerKgUsd: v } })}
        prefix="$"
        suffix="USD/kg"
        min={0}
        step={0.01}
      />
      <NumberField
        label="Recargos"
        value={air.surchargesUsd}
        onChange={(v) => dispatch({ type: 'SET_FREIGHT_AIR', payload: { surchargesUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
      />
      <NumberField
        label="Documentación"
        value={air.docsUsd}
        onChange={(v) => dispatch({ type: 'SET_FREIGHT_AIR', payload: { docsUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
      />
    </div>
  );
}
