import { useCalculator } from '@/state/context';
import { NumberField } from '@/components/ui/NumberField';

export function SectionG_Financial() {
  const { state, dispatch } = useCalculator();
  const { financial } = state;

  return (
    <section className="section-form space-y-4">
      <h2 className="text-base font-semibold text-kuaizi-secondary border-b border-gray-200 pb-2">
        G — Costos Financieros y Bancarios
      </h2>

      <NumberField
        label="Comisión bancaria / wire transfer"
        value={financial.bankWireUsd}
        onChange={(v) => dispatch({ type: 'SET_FINANCIAL', payload: { bankWireUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
      />

      <NumberField
        label="Tasa financiamiento (sobre costo total)"
        value={financial.financeRatePct * 100}
        onChange={(v) =>
          dispatch({ type: 'SET_FINANCIAL', payload: { financeRatePct: v / 100 } })
        }
        suffix="%"
        step={0.1}
        min={0}
        max={50}
        hint="costo de capital aplicado al costo total pre-financiero"
      />
    </section>
  );
}
