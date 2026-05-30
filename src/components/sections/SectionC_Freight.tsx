import { useCalculator } from '@/state/context';
import { NumberField } from '@/components/ui/NumberField';
import { FreightModeSelector } from '@/components/freight/FreightModeSelector';
import { SubForm_FCL } from '@/components/freight/SubForm_FCL';
import { SubForm_LCL } from '@/components/freight/SubForm_LCL';
import { SubForm_Air } from '@/components/freight/SubForm_Air';
import { SubForm_Express } from '@/components/freight/SubForm_Express';
import { visibility } from '@/lib/validation/visibility';
import type { FreightMode } from '@/types/domain';

export function SectionC_Freight() {
  const { state, dispatch } = useCalculator();
  const { freight } = state;
  const isCIF = state.product.incoterm === 'CIF';

  return (
    <section className="section-form space-y-4">
      <h2 className="text-base font-semibold text-kuaizi-secondary border-b border-gray-200 pb-2">
        C — Flete Internacional
      </h2>

      {isCIF ? (
        // CIF incoterm: user enters CIF value directly
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Incoterm CIF — el flete y seguro están incluidos en el valor CIF cotizado.
            Ingrese el valor CIF total en USD.
          </p>
          <NumberField
            label="Valor CIF total (USD)"
            value={freight.cifDirectUsd}
            onChange={(v) => dispatch({ type: 'SET_FREIGHT', payload: { cifDirectUsd: v } })}
            prefix="$"
            suffix="USD"
            min={0}
          />
        </div>
      ) : (
        <>
          <FreightModeSelector
            value={freight.mode}
            onChange={(mode: FreightMode) =>
              dispatch({ type: 'SET_FREIGHT_MODE', payload: mode })
            }
          />

          {/* Port fields always visible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-kuaizi-ink block mb-1">Puerto de carga</label>
              <input
                type="text"
                value={freight.portLoading}
                onChange={(e) =>
                  dispatch({ type: 'SET_FREIGHT', payload: { portLoading: e.target.value } })
                }
                placeholder="Ej: Guangzhou"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-kuaizi-accent focus:ring-1 focus:ring-kuaizi-accent outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-kuaizi-ink block mb-1">Puerto de destino</label>
              <input
                type="text"
                value={freight.portDestination}
                onChange={(e) =>
                  dispatch({ type: 'SET_FREIGHT', payload: { portDestination: e.target.value } })
                }
                placeholder="Ej: Buenaventura"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-kuaizi-accent focus:ring-1 focus:ring-kuaizi-accent outline-none"
              />
            </div>
          </div>

          {/* Only the active mode sub-form is mounted */}
          {visibility.freightFCL(state) && <SubForm_FCL />}
          {visibility.freightLCL(state) && <SubForm_LCL />}
          {visibility.freightAir(state) && <SubForm_Air />}
          {visibility.freightExpress(state) && <SubForm_Express />}
        </>
      )}
    </section>
  );
}
