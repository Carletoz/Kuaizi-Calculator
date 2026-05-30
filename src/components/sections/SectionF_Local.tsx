import { useCalculator } from '@/state/context';
import { NumberField } from '@/components/ui/NumberField';

export function SectionF_Local() {
  const { state, dispatch } = useCalculator();
  const { local } = state;

  return (
    <section className="section-form space-y-4">
      <h2 className="text-base font-semibold text-kuaizi-secondary border-b border-gray-200 pb-2">
        F — Distribución Local (Colombia)
      </h2>

      <NumberField
        label="Flete interno Colombia"
        value={local.transportUsd}
        onChange={(v) => dispatch({ type: 'SET_LOCAL', payload: { transportUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
      />

      <NumberField
        label="Seguro local"
        value={local.insuranceUsd}
        onChange={(v) => dispatch({ type: 'SET_LOCAL', payload: { insuranceUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
      />

      <NumberField
        label="Bodegaje en Colombia"
        value={local.warehousingUsd}
        onChange={(v) => dispatch({ type: 'SET_LOCAL', payload: { warehousingUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
      />

      <div>
        <label className="text-sm font-medium text-kuaizi-ink block mb-1">Ciudad de destino</label>
        <input
          type="text"
          value={local.destinationCity}
          onChange={(e) =>
            dispatch({ type: 'SET_LOCAL', payload: { destinationCity: e.target.value } })
          }
          placeholder="Ej: Bogotá, Medellín, Cali..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-kuaizi-accent focus:ring-1 focus:ring-kuaizi-accent outline-none"
        />
      </div>
    </section>
  );
}
