import { useCalculator } from '@/state/context';
import { NumberField } from '@/components/ui/NumberField';

export function SectionH_Kuaizi() {
  const { state, dispatch } = useCalculator();
  const { kuaizi } = state;

  return (
    <section className="section-form space-y-4">
      {/* Branded header for Kuaizi section */}
      <div className="rounded-t-md bg-kuaizi-secondary px-4 py-2 -mx-4 -mt-4">
        <h2 className="text-base font-semibold text-white">
          H — Servicios Kuaizi Group
        </h2>
      </div>

      <p className="text-xs text-gray-500">
        Honorarios de los servicios de Kuaizi en origen y gestión de importación.
        Todos los campos son opcionales.
      </p>

      <NumberField
        label="Comisión de sourcing"
        value={kuaizi.sourcingUsd}
        onChange={(v) => dispatch({ type: 'SET_KUAIZI', payload: { sourcingUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
      />

      <NumberField
        label="Inspección de calidad"
        value={kuaizi.inspectionUsd}
        onChange={(v) => dispatch({ type: 'SET_KUAIZI', payload: { inspectionUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
      />

      <NumberField
        label="Gestión y coordinación"
        value={kuaizi.managementUsd}
        onChange={(v) => dispatch({ type: 'SET_KUAIZI', payload: { managementUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
      />
    </section>
  );
}
