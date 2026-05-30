import { useCalculator } from '@/state/context';
import { NumberField } from '@/components/ui/NumberField';
import { visibility } from '@/lib/validation/visibility';

export function SectionB_China() {
  const { state, dispatch } = useCalculator();

  // Section B is only shown when incoterm !== CIF
  if (!visibility.sectionB(state)) return null;

  const { china, product } = state;
  const isEXW = product.incoterm === 'EXW';

  return (
    <section className="section-form space-y-4">
      <h2 className="text-base font-semibold text-kuaizi-secondary border-b border-gray-200 pb-2">
        B — Costos en Origen (China)
      </h2>
      <p className="text-xs text-gray-500">
        {isEXW
          ? 'Incoterm EXW — todos los costos desde fábrica hasta puerto.'
          : 'Incoterm FOB — costos de flete interno y aduana ya incluidos en el precio FOB; indique si hay cargos adicionales.'}
      </p>

      <NumberField
        label="Flete interno China"
        value={china.inlandFreightUsd}
        onChange={(v) => dispatch({ type: 'SET_CHINA', payload: { inlandFreightUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
      />

      <NumberField
        label="Aduana exportación (China)"
        value={china.exportCustomsUsd}
        onChange={(v) => dispatch({ type: 'SET_CHINA', payload: { exportCustomsUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
      />

      {isEXW && (
        <>
          <NumberField
            label="Certificado de origen (C/O)"
            value={china.coFeeUsd}
            onChange={(v) => dispatch({ type: 'SET_CHINA', payload: { coFeeUsd: v } })}
            prefix="$"
            suffix="USD"
            min={0}
          />

          <NumberField
            label="Inspección pre-embarque"
            value={china.inspectionUsd}
            onChange={(v) => dispatch({ type: 'SET_CHINA', payload: { inspectionUsd: v } })}
            prefix="$"
            suffix="USD"
            min={0}
          />

          <NumberField
            label="Empaque y embalaje"
            value={china.packagingUsd}
            onChange={(v) => dispatch({ type: 'SET_CHINA', payload: { packagingUsd: v } })}
            prefix="$"
            suffix="USD"
            min={0}
          />

          <NumberField
            label="Bodegaje en China"
            value={china.warehouseUsd}
            onChange={(v) => dispatch({ type: 'SET_CHINA', payload: { warehouseUsd: v } })}
            prefix="$"
            suffix="USD"
            min={0}
          />
        </>
      )}
    </section>
  );
}
