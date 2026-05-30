import { useCalculator } from '@/state/context';
import { NumberField } from '@/components/ui/NumberField';
import { Toggle } from '@/components/ui/Toggle';
import { visibility } from '@/lib/validation/visibility';

export function SectionD_Insurance() {
  const { state, dispatch } = useCalculator();
  const { insurance } = state;

  // CIF incoterm: insurance is already bundled in the CIF value
  if (state.product.incoterm === 'CIF') {
    return (
      <section className="section-form space-y-4">
        <h2 className="text-base font-semibold text-kuaizi-secondary border-b border-gray-200 pb-2">
          D — Seguro de Carga
        </h2>
        <p className="text-xs text-gray-500">
          Con Incoterm CIF, el seguro está incluido en el valor CIF ingresado en la sección C.
        </p>
      </section>
    );
  }

  return (
    <section className="section-form space-y-4">
      <h2 className="text-base font-semibold text-kuaizi-secondary border-b border-gray-200 pb-2">
        D — Seguro de Carga
      </h2>

      <Toggle
        label="Incluir seguro de carga"
        checked={insurance.enabled}
        onChange={(v) => dispatch({ type: 'SET_INSURANCE_ENABLED', payload: v })}
        description="Por defecto desactivado. Rango recomendado: 0.3% – 0.5% del valor asegurado."
      />

      {visibility.insuranceRate(state) && (
        <NumberField
          label="Tasa de seguro"
          value={insurance.ratePct * 100}
          onChange={(v) =>
            dispatch({ type: 'SET_INSURANCE', payload: { ratePct: v / 100 } })
          }
          suffix="%"
          step={0.01}
          min={0.1}
          max={2}
          hint="Base de cálculo: FOB + Flete (aproximación <0.1% vs. CIF real)"
        />
      )}
    </section>
  );
}
