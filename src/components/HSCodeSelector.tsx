import { useState } from 'react';
import { useCalculator } from '@/state/context';
import { ALL_HS_CATEGORIES, getArancelBucketLabel } from '@/data/hs-categories';
import { Banner } from '@/components/ui/Banner';
import { NumberField } from '@/components/ui/NumberField';
import { visibility } from '@/lib/validation/visibility';

export function HSCodeSelector() {
  const { state, dispatch } = useCalculator();
  const { product } = state;

  const [pendingOverrideRate, setPendingOverrideRate] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const selectedCategory = product.hsCategoryId
    ? ALL_HS_CATEGORIES.find((c) => c.id === product.hsCategoryId)
    : null;

  const showInvima = visibility.invimaWarning(state);

  function handleCategoryChange(id: string) {
    if (!id) return;
    const cat = ALL_HS_CATEGORIES.find((c) => c.id === id);
    if (!cat) return;
    dispatch({
      type: 'SET_HS_CATEGORY',
      payload: { id: cat.id, arancelRate: cat.arancelRate, ivaRate: cat.ivaRate },
    });
  }

  function handleArancelOverrideChange(pct: number) {
    setPendingOverrideRate(pct);
    setShowConfirm(true);
  }

  function confirmOverride() {
    if (pendingOverrideRate !== null) {
      dispatch({
        type: 'SET_CUSTOMS',
        payload: { arancelRate: pendingOverrideRate / 100 },
      });
    }
    setShowConfirm(false);
    setPendingOverrideRate(null);
  }

  function cancelOverride() {
    setShowConfirm(false);
    setPendingOverrideRate(null);
  }

  return (
    <div className="space-y-3">
      {/* Category dropdown */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-kuaizi-ink">
          Categoría de producto (HS)
        </label>
        <select
          value={product.hsCategoryId ?? ''}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-kuaizi-ink focus:border-kuaizi-accent focus:ring-1 focus:ring-kuaizi-accent outline-none"
        >
          <option value="">Seleccionar categoría...</option>
          {ALL_HS_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
              {cat.antidumpingRisk ? ' ⚠' : ''}
              {cat.invimaRequired ? ' 🏥' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Selected category info */}
      {selectedCategory && (
        <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-600 space-y-1">
          <div className="flex gap-4">
            <span>
              Arancel: <strong>{getArancelBucketLabel(selectedCategory.arancelRate)}</strong>
            </span>
            <span>
              IVA: <strong>{(selectedCategory.ivaRate * 100).toFixed(0)}%</strong>
            </span>
          </div>
          {selectedCategory.exampleHSCodes.length > 0 && (
            <div className="text-gray-500">
              Ejemplos: {selectedCategory.exampleHSCodes.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* INVIMA advisory */}
      {showInvima && (
        <Banner
          kind="warning"
          message="Este producto puede requerir registro INVIMA/ICA. Verificar antes de importar."
        />
      )}

      {/* Manual HS code override */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-kuaizi-ink">
          Código HS manual (10 dígitos)
          <span className="ml-1 text-xs font-normal text-gray-500">(opcional)</span>
        </label>
        <input
          type="text"
          value={product.hsCodeOverride ?? ''}
          onChange={(e) =>
            dispatch({
              type: 'SET_PRODUCT',
              payload: { hsCodeOverride: e.target.value || null },
            })
          }
          placeholder="Ej: 6109.10.00.00"
          maxLength={14}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-kuaizi-accent focus:ring-1 focus:ring-kuaizi-accent outline-none"
        />
      </div>

      {/* Arancel rate override with confirmation */}
      {product.hsCategoryId && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">
            Para ajustar la tasa de arancel, ingrese el valor exacto:
          </p>
          <NumberField
            label="Arancel personalizado"
            value={pendingOverrideRate ?? state.customs.arancelRate * 100}
            onChange={handleArancelOverrideChange}
            suffix="%"
            step={1}
            min={0}
            max={100}
            hint={`Bucket: ${getArancelBucketLabel(state.customs.arancelRate)}`}
          />

          {showConfirm && pendingOverrideRate !== null && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 space-y-2">
              <p className="text-sm text-amber-800">
                ¿Confirmar tasa de arancel{' '}
                <strong>{pendingOverrideRate}%</strong>{' '}
                ({getArancelBucketLabel(pendingOverrideRate / 100)})?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={confirmOverride}
                  className="rounded px-3 py-1 text-sm bg-amber-600 text-white hover:bg-amber-700"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={cancelOverride}
                  className="rounded px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
