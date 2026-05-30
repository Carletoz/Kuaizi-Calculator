import { useCalculator } from '@/state/context';
import { NumberField } from '@/components/ui/NumberField';

export function SubForm_LCL() {
  const { state, dispatch, result } = useCalculator();
  const { lcl } = state.freight;

  return (
    <div className="space-y-3 rounded-md bg-gray-50 p-3 border border-gray-200">
      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">LCL — Consolidado</p>

      <div className="flex gap-3 text-xs text-gray-600 bg-white rounded border border-gray-200 p-2">
        <span>
          Volumen: <strong>{result.volumeCbm.toFixed(3)} m³</strong>
        </span>
        <span>
          Peso: <strong>{result.weightMt.toFixed(3)} t</strong>
        </span>
        <span className="text-kuaizi-accent font-medium">
          Chargeable W/M: <strong>{result.chargeableLcl.toFixed(3)}</strong>
        </span>
      </div>

      <NumberField
        label="Tarifa por W/M"
        value={lcl.ratePerWmUsd}
        onChange={(v) => dispatch({ type: 'SET_FREIGHT_LCL', payload: { ratePerWmUsd: v } })}
        prefix="$"
        suffix="USD/W/M"
        min={0}
      />
      <NumberField
        label="CFS origen"
        value={lcl.originCfsUsd}
        onChange={(v) => dispatch({ type: 'SET_FREIGHT_LCL', payload: { originCfsUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
      />
      <NumberField
        label="CFS destino"
        value={lcl.destCfsUsd}
        onChange={(v) => dispatch({ type: 'SET_FREIGHT_LCL', payload: { destCfsUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
      />
      <NumberField
        label="Recargos"
        value={lcl.surchargesUsd}
        onChange={(v) => dispatch({ type: 'SET_FREIGHT_LCL', payload: { surchargesUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
      />
      <NumberField
        label="Documentación"
        value={lcl.docsUsd}
        onChange={(v) => dispatch({ type: 'SET_FREIGHT_LCL', payload: { docsUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
      />
    </div>
  );
}
