import { useCalculator } from '@/state/context';
import { NumberField } from '@/components/ui/NumberField';

export function SubForm_FCL() {
  const { state, dispatch } = useCalculator();
  const { fcl } = state.freight;

  return (
    <div className="space-y-3 rounded-md bg-gray-50 p-3 border border-gray-200">
      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">FCL — Contenedor completo</p>
      <NumberField
        label="Tarifa del contenedor"
        value={fcl.containerRateUsd}
        onChange={(v) => dispatch({ type: 'SET_FREIGHT_FCL', payload: { containerRateUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
      />
      <NumberField
        label="Recargos (BAF, CAF, etc.)"
        value={fcl.surchargesUsd}
        onChange={(v) => dispatch({ type: 'SET_FREIGHT_FCL', payload: { surchargesUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
      />
      <NumberField
        label="Documentación (B/L)"
        value={fcl.docsUsd}
        onChange={(v) => dispatch({ type: 'SET_FREIGHT_FCL', payload: { docsUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
      />
    </div>
  );
}
