import { useCalculator } from '@/state/context';
import { NumberField } from '@/components/ui/NumberField';

export function SectionKuaiziDDP() {
  const { state, dispatch } = useCalculator();
  const { ddp, mode } = state;

  const showCbmError = mode === 'kuaizi' && ddp.cbmTotal === 0;
  const showTarifaError = mode === 'kuaizi' && ddp.tarifaDdpCopPerCbm === 0;

  return (
    <section className="section-form space-y-4">
      <h2 className="text-base font-semibold text-kuaizi-secondary border-b border-gray-200 pb-2">
        DDP — Flete Consolidado Kuaizi
      </h2>

      <p className="text-xs text-gray-500">
        Ingrese el volumen total y la tarifa DDP acordada. El sistema calculará el costo completo de flete, aduana y nacionalización.
      </p>

      <div className="space-y-1">
        <NumberField
          label="CBM Total"
          value={ddp.cbmTotal}
          onChange={(v) => dispatch({ type: 'SET_DDP', payload: { cbmTotal: v } })}
          suffix="CBM"
          step={0.01}
          min={0}
        />
        {showCbmError && (
          <p className="text-xs text-red-600 mt-1">El CBM total es requerido en modo Kuaizi.</p>
        )}
      </div>

      <div className="space-y-1">
        <NumberField
          label="Tarifa DDP (COP/CBM)"
          value={ddp.tarifaDdpCopPerCbm}
          onChange={(v) => dispatch({ type: 'SET_DDP', payload: { tarifaDdpCopPerCbm: v } })}
          suffix="COP/CBM"
          step={1000}
          min={0}
        />
        {showTarifaError && (
          <p className="text-xs text-red-600 mt-1">La tarifa DDP es requerida en modo Kuaizi.</p>
        )}
      </div>
    </section>
  );
}
