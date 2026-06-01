import { useCalculator } from '@/state/context';
import { NumberField } from '@/components/ui/NumberField';
import { Select } from '@/components/ui/Select';
import { Banner } from '@/components/ui/Banner';
import { visibility } from '@/lib/validation/visibility';
import type { Incoterm } from '@/types/domain';
import { HSCodeSelector } from '@/components/HSCodeSelector';

const INCOTERM_OPTIONS: { value: Incoterm; label: string }[] = [
  { value: 'EXW', label: 'EXW — Ex-Works (fábrica)' },
  { value: 'FOB', label: 'FOB — Free on Board (puerto origen)' },
  { value: 'CIF', label: 'CIF — Cost, Insurance & Freight' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD' as const, label: 'USD (dólar)' },
  { value: 'CNY' as const, label: 'CNY (yuan)' },
];

export function SectionA_Product() {
  const { state, dispatch, result } = useCalculator();
  const { product, customs } = state;

  const showCnyRate = visibility.cnyRate(state);
  const trmStaleWarning = result.warnings.find((w) => w.kind === 'trm-stale');

  return (
    <section className="section-form space-y-4">
      <h2 className="text-base font-semibold text-kuaizi-secondary border-b border-gray-200 pb-2">
        A — Producto y Origen
      </h2>

      <div>
        <label className="text-sm font-medium text-kuaizi-ink block mb-1">
          Descripción del producto
        </label>
        <input
          type="text"
          value={product.description}
          onChange={(e) =>
            dispatch({ type: 'SET_PRODUCT', payload: { description: e.target.value } })
          }
          placeholder="Ej: Camisetas de algodón 100%, talla M"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-kuaizi-accent focus:ring-1 focus:ring-kuaizi-accent outline-none"
        />
      </div>

      <HSCodeSelector />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Moneda de precio"
          value={product.priceCurrency}
          options={CURRENCY_OPTIONS}
          onChange={(v) => dispatch({ type: 'SET_PRICE_CURRENCY', payload: v })}
        />

        <NumberField
          label={product.priceCurrency === 'CNY' ? 'Precio unitario (CNY)' : 'Precio unitario (USD)'}
          value={product.unitPrice}
          onChange={(v) => dispatch({ type: 'SET_PRODUCT', payload: { unitPrice: v } })}
          prefix={product.priceCurrency === 'CNY' ? '¥' : '$'}
          step={0.01}
          min={0}
        />
      </div>

      {showCnyRate && (
        <NumberField
          label="Tasa de cambio CNY/USD"
          value={product.cnyToUsd}
          onChange={(v) => dispatch({ type: 'SET_PRODUCT', payload: { cnyToUsd: v } })}
          hint="cuántos USD vale 1 CNY, ej: 0.138"
          step={0.001}
          min={0}
        />
      )}

      <NumberField
        label="Cantidad (unidades)"
        value={product.quantity}
        onChange={(v) => dispatch({ type: 'SET_PRODUCT', payload: { quantity: v } })}
        suffix="uds"
        min={0}
        step={1}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <NumberField
          label="Peso bruto por unidad"
          value={product.unitWeightKg}
          onChange={(v) => dispatch({ type: 'SET_PRODUCT', payload: { unitWeightKg: v } })}
          suffix="kg"
          step={0.01}
          min={0}
        />

        <div>
          <label className="text-sm font-medium text-kuaizi-ink block mb-1">Ciudad de origen</label>
          <input
            type="text"
            value={product.originCity}
            onChange={(e) =>
              dispatch({ type: 'SET_PRODUCT', payload: { originCity: e.target.value } })
            }
            placeholder="Ej: Guangzhou"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-kuaizi-accent focus:ring-1 focus:ring-kuaizi-accent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-kuaizi-ink block mb-1">
          Dimensiones por unidad (cm)
        </label>
        <div className="grid grid-cols-3 gap-2">
          <NumberField
            label="Largo"
            value={product.dimensionsCm.l}
            onChange={(v) =>
              dispatch({
                type: 'SET_PRODUCT',
                payload: { dimensionsCm: { ...product.dimensionsCm, l: v } },
              })
            }
            min={0}
          />
          <NumberField
            label="Ancho"
            value={product.dimensionsCm.w}
            onChange={(v) =>
              dispatch({
                type: 'SET_PRODUCT',
                payload: { dimensionsCm: { ...product.dimensionsCm, w: v } },
              })
            }
            min={0}
          />
          <NumberField
            label="Alto"
            value={product.dimensionsCm.h}
            onChange={(v) =>
              dispatch({
                type: 'SET_PRODUCT',
                payload: { dimensionsCm: { ...product.dimensionsCm, h: v } },
              })
            }
            min={0}
          />
        </div>
      </div>

      <Select
        label="Incoterm"
        value={product.incoterm}
        options={INCOTERM_OPTIONS}
        onChange={(v) => dispatch({ type: 'SET_INCOTERM', payload: v })}
      />

      {/* TRM — always visible regardless of mode */}
      <div className="rounded-md bg-kuaizi-secondary/5 p-3 space-y-3 border border-kuaizi-secondary/20">
        <p className="text-xs font-semibold text-kuaizi-secondary uppercase tracking-wide">
          TRM (Tasa Representativa del Mercado)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberField
            label="TRM (COP por USD)"
            value={customs.trm.value}
            onChange={(v) => dispatch({ type: 'SET_TRM', payload: { ...customs.trm, value: v } })}
            suffix="COP"
            step={1}
            min={0}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-kuaizi-ink">Fecha de la TRM</label>
            <input
              type="date"
              value={customs.trm.date}
              onChange={(e) =>
                dispatch({ type: 'SET_TRM', payload: { ...customs.trm, date: e.target.value } })
              }
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-kuaizi-accent focus:ring-1 focus:ring-kuaizi-accent outline-none"
            />
          </div>
        </div>
        {trmStaleWarning && (
          <Banner kind="warning" message={trmStaleWarning.message} />
        )}
      </div>
    </section>
  );
}
