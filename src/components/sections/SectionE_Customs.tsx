import { useCalculator } from '@/state/context';
import { NumberField } from '@/components/ui/NumberField';
import { Toggle } from '@/components/ui/Toggle';
import { Banner } from '@/components/ui/Banner';
import { visibility } from '@/lib/validation/visibility';
import { getArancelBucketLabel } from '@/data/hs-categories';
import { DEFAULT_VUCE_COP } from '@/lib/calc/defaults';

// Note: TRM block has been moved to SectionA_Product (visible in both modes)

export function SectionE_Customs() {
  const { state, dispatch } = useCalculator();
  const { customs } = state;

  return (
    <section className="section-form space-y-4">
      <h2 className="text-base font-semibold text-kuaizi-secondary border-b border-gray-200 pb-2">
        E — Aduanas y Tributos Colombia
      </h2>

      {/* Arancel and IVA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <NumberField
            label={`Arancel (${getArancelBucketLabel(customs.arancelRate)})`}
            value={customs.arancelRate * 100}
            onChange={(v) =>
              dispatch({ type: 'SET_CUSTOMS', payload: { arancelRate: v / 100 } })
            }
            suffix="%"
            step={1}
            min={0}
            max={100}
            hint="Pre-llenado desde categoría HS"
          />
        </div>
        <NumberField
          label="IVA"
          value={customs.ivaRate * 100}
          onChange={(v) => dispatch({ type: 'SET_CUSTOMS', payload: { ivaRate: v / 100 } })}
          suffix="%"
          step={1}
          min={0}
          max={100}
          hint="Base: CIF + Arancel"
        />
      </div>

      {/* Antidumping */}
      <div className="space-y-3">
        <Toggle
          label="Activar antidumping"
          checked={customs.antidumping.enabled}
          onChange={(v) => dispatch({ type: 'SET_ANTIDUMPING_ENABLED', payload: v })}
          description="Solo si aplica para este producto. Consulte con su agente de aduanas."
        />

        {visibility.antidumpingRate(state) && (
          <>
            <NumberField
              label="Tasa antidumping"
              value={customs.antidumping.rate * 100}
              onChange={(v) =>
                dispatch({
                  type: 'SET_CUSTOMS',
                  payload: {
                    antidumping: { ...customs.antidumping, rate: v / 100 },
                  },
                })
              }
              suffix="%"
              step={1}
              min={0}
              max={200}
            />
            <Banner
              kind="warning"
              message="Antidumping activo. Consulte con su agente de aduanas la aplicabilidad específica para su posición arancelaria."
            />
          </>
        )}
      </div>

      {/* Nationalization fees */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Costos de nacionalización
        </p>

        <NumberField
          label="Agencia de aduanas"
          value={customs.customsAgentUsd}
          onChange={(v) => dispatch({ type: 'SET_CUSTOMS', payload: { customsAgentUsd: v } })}
          prefix="$"
          suffix="USD"
          min={0}
        />
        <NumberField
          label="THC puerto"
          value={customs.portThcUsd}
          onChange={(v) => dispatch({ type: 'SET_CUSTOMS', payload: { portThcUsd: v } })}
          prefix="$"
          suffix="USD"
          min={0}
        />
        <NumberField
          label="Almacenaje en puerto"
          value={customs.portStorageUsd}
          onChange={(v) => dispatch({ type: 'SET_CUSTOMS', payload: { portStorageUsd: v } })}
          prefix="$"
          suffix="USD"
          min={0}
        />
        <NumberField
          label="Inspección DIAN"
          value={customs.dianInspectionUsd}
          onChange={(v) => dispatch({ type: 'SET_CUSTOMS', payload: { dianInspectionUsd: v } })}
          prefix="$"
          suffix="USD"
          min={0}
        />
        <NumberField
          label="VUCE"
          value={customs.vuceCop}
          onChange={(v) => dispatch({ type: 'SET_CUSTOMS', payload: { vuceCop: v } })}
          suffix="COP"
          hint={`por defecto ${DEFAULT_VUCE_COP.toLocaleString('es-CO')} COP`}
          min={0}
        />
        <NumberField
          label="INVIMA / ICA"
          value={customs.invimaIcaUsd}
          onChange={(v) => dispatch({ type: 'SET_CUSTOMS', payload: { invimaIcaUsd: v } })}
          prefix="$"
          suffix="USD"
          min={0}
        />
      </div>
    </section>
  );
}
