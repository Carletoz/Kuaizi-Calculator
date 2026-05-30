import { useCalculator } from '@/state/context';
import { NumberField } from '@/components/ui/NumberField';

export function SubForm_Express() {
  const { state, dispatch } = useCalculator();
  const { express } = state.freight;

  return (
    <div className="space-y-3 rounded-md bg-gray-50 p-3 border border-gray-200">
      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Courier / Express</p>
      <NumberField
        label="Cotización total del courier"
        value={express.quoteUsd}
        onChange={(v) => dispatch({ type: 'SET_FREIGHT_EXPRESS', payload: { quoteUsd: v } })}
        prefix="$"
        suffix="USD"
        min={0}
        hint="monto total cotizado por el courier (DHL, FedEx, etc.)"
      />
    </div>
  );
}
