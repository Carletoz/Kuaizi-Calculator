import { useState, useEffect } from 'react';
import { calculateLandedCost } from '@/lib/calc/v3-landed';
import { ALL_HS_CATEGORIES } from '@/data/hs-categories';
import type { ProductEntry, SupplierEntry } from '@/state/session/types';

const CUSTOM_HS = '__custom__';

interface EditDraft {
  quantity: string;
  unitPriceRmb: string;
  piezasPorCaja: string;
  cbm: string;
  hsCategoryId: string;
  arancelRate: string;
  ivaRate: string;
}

type ShareStatus = 'idle' | 'sharing' | 'success' | 'error';

interface QuoteTableProps {
  products: ProductEntry[];
  suppliers: SupplierEntry[];
  trmCopUsd: number;
  cnyToUsd: number;
  ratesFetchedAt: string | null;
  ratesUsedFallback: boolean;
  entityFiles?: ReadonlyMap<string, File>;
  onRemove: (id: string) => void;
  onUpdate: (id: string, fields: Partial<ProductEntry>) => void;
  onNewQuote?: () => void;
  onShare?: () => Promise<void>;
  shareStatus?: ShareStatus;
  sheetUrl?: string;
  shareError?: string;
}

function fmtUSD(v: number): string {
  return v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
}

function ImagePreview({ file }: { file: File }) {
  const [url, setUrl] = useState<string>('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!url) return null;

  return (
    <>
      <img
        src={url}
        alt="Foto producto"
        onClick={() => setExpanded(true)}
        className="w-20 h-20 object-cover rounded-lg border border-gray-200 mb-2 cursor-zoom-in"
      />
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setExpanded(false)}
        >
          <img
            src={url}
            alt="Foto producto"
            className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="absolute top-4 right-4 text-white text-2xl leading-none bg-black/40 rounded-full w-9 h-9 flex items-center justify-center hover:bg-black/60"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}

function DesglosRow({
  label,
  value,
  pct,
  bold,
}: {
  label: string;
  value: number;
  pct?: string;
  bold?: boolean;
}) {
  return (
    <div className={`flex justify-between text-xs py-0.5 ${bold ? 'font-bold border-t border-gray-200 pt-1 mt-0.5' : 'text-gray-500'}`}>
      <span>{label}{pct ? ` (${pct})` : ''}</span>
      <span className={bold ? 'text-kuaizi-ink' : ''}>{fmtUSD(value)}</span>
    </div>
  );
}

function seedDraft(p: ProductEntry): EditDraft {
  const arancelPct = Math.round(p.arancelRate * 100);
  const ivaPct = Math.round(p.ivaRate * 100);

  const matchedCat = ALL_HS_CATEGORIES.find(
    (cat) =>
      Math.round(cat.arancelRate * 100) === arancelPct &&
      Math.round(cat.ivaRate * 100) === ivaPct &&
      (p.hsCategoryId ? cat.id === p.hsCategoryId : true)
  );

  const hsCategoryId = matchedCat ? matchedCat.id : CUSTOM_HS;

  return {
    quantity: String(p.quantity),
    unitPriceRmb: String(p.unitPriceRmb),
    piezasPorCaja: String(p.piezasPorCaja),
    cbm: String(p.cbm),
    hsCategoryId,
    arancelRate: String(arancelPct),
    ivaRate: String(ivaPct),
  };
}

function draftToFields(d: EditDraft): Partial<ProductEntry> | null {
  const quantity = parseFloat(d.quantity);
  const unitPriceRmb = parseFloat(d.unitPriceRmb);

  if (!quantity || quantity <= 0) return null;
  if (!unitPriceRmb || unitPriceRmb <= 0) return null;

  const arancelPct = Math.min(100, Math.max(0, parseFloat(d.arancelRate) || 0));
  const ivaPct = Math.min(100, Math.max(0, parseFloat(d.ivaRate) || 0));

  const piezasPorCaja = parseFloat(d.piezasPorCaja);
  const cbm = parseFloat(d.cbm);

  const fields: Partial<ProductEntry> = {
    quantity,
    unitPriceRmb,
    piezasPorCaja: piezasPorCaja > 0 ? piezasPorCaja : undefined,
    cbm: cbm > 0 ? cbm : undefined,
    arancelRate: arancelPct / 100,
    ivaRate: ivaPct / 100,
  };

  if (d.hsCategoryId !== CUSTOM_HS && d.hsCategoryId !== '') {
    fields.hsCategoryId = d.hsCategoryId;
  }

  return fields;
}

export function QuoteTable({
  products,
  suppliers,
  trmCopUsd,
  cnyToUsd,
  ratesFetchedAt,
  ratesUsedFallback,
  entityFiles,
  onRemove,
  onUpdate,
  onNewQuote,
  onShare,
  shareStatus = 'idle',
  sheetUrl,
  shareError,
}: QuoteTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sellingPrices, setSellingPrices] = useState<Record<string, string>>({});
  const [showOrderBreakdown, setShowOrderBreakdown] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const startEdit = (p: ProductEntry) => {
    setSaveError(null);
    setEditingId(p.id);
    setDraft(seedDraft(p));
  };

  const handleSave = (id: string) => {
    if (!draft) return;
    const fields = draftToFields(draft);
    if (!fields) {
      setSaveError('Cantidad y precio deben ser mayores a 0.');
      return;
    }
    onUpdate(id, fields);
    setEditingId(null);
    setDraft(null);
    setSaveError(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setDraft(null);
    setSaveError(null);
  };

  const orderCalcs = products.map((p) =>
    calculateLandedCost({
      unitPriceRmb: p.unitPriceRmb,
      piezasPorCaja: p.piezasPorCaja,
      cbm: p.cbm,
      quantity: p.quantity,
      trmCopUsd,
      cnyToUsd,
      arancelRate: p.arancelRate,
      ivaRate: p.ivaRate,
    })
  );

  const orderTotals = orderCalcs.reduce(
    (acc, c, i) => {
      const q = products[i].quantity;
      return {
        exw: acc.exw + c.exwPerUnit * q,
        margin: acc.margin + c.kuaiziMarginPerUnit * q,
        freight: acc.freight + c.freightPerUnit * q,
        insurance: acc.insurance + c.insurancePerUnit * q,
        cif: acc.cif + c.cifPerUnit * q,
        arancel: acc.arancel + c.arancelPerUnit * q,
        iva: acc.iva + c.ivaPerUnit * q,
        landed: acc.landed + c.totalLandedCost,
      };
    },
    { exw: 0, margin: 0, freight: 0, insurance: 0, cif: 0, arancel: 0, iva: 0, landed: 0 }
  );

  const grandTotal = products.reduce((sum, p) => {
    const { totalLandedCost } = calculateLandedCost({
      unitPriceRmb: p.unitPriceRmb,
      piezasPorCaja: p.piezasPorCaja,
      cbm: p.cbm,
      quantity: p.quantity,
      trmCopUsd,
      cnyToUsd,
      arancelRate: p.arancelRate,
      ivaRate: p.ivaRate,
    });
    return sum + totalLandedCost;
  }, 0);

  const copyAsText = () => {
    const today = new Date().toLocaleDateString('es-CO');
    const cnyDisplay = (1 / cnyToUsd).toFixed(4);
    const bySupplier = new Map<string, typeof products>();
    for (const p of products) {
      const existing = bySupplier.get(p.supplierId) ?? [];
      existing.push(p);
      bySupplier.set(p.supplierId, existing);
    }
    const lines: string[] = [
      `KUAIZI · Cotizacion ${today}`,
      `TRM ${trmCopUsd.toLocaleString('es-CO')} COP/USD · CNY ${cnyDisplay}/USD`,
      '',
    ];
    for (const [supplierId, prods] of bySupplier) {
      const supplier = suppliers.find((s) => s.id === supplierId);
      const tel = supplier?.tel ? ` ${supplier.tel}` : '';
      lines.push(`[${supplier?.name ?? supplierId}${tel}]`);
      for (const p of prods) {
        const { landedCostPerUnit, totalLandedCost } = calculateLandedCost({
          unitPriceRmb: p.unitPriceRmb,
          piezasPorCaja: p.piezasPorCaja,
          cbm: p.cbm,
          quantity: p.quantity,
          trmCopUsd,
          cnyToUsd,
          arancelRate: p.arancelRate,
          ivaRate: p.ivaRate,
        });
        lines.push(`- ${p.name} x${p.quantity}  USD ${landedCostPerUnit.toFixed(2)}/u  = USD ${totalLandedCost.toFixed(2)}`);
      }
      lines.push('');
    }
    lines.push(`TOTAL: USD ${grandTotal.toFixed(2)}`);
    navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
  };

  return (
    <div className="space-y-4">
      {/* Rates header */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 space-y-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-kuaizi-secondary uppercase tracking-wide">Tasas de cambio</p>
            <p className="text-sm text-kuaizi-ink">
              TRM: {trmCopUsd.toLocaleString('es-CO')} COP/USD &nbsp;·&nbsp; CNY: {(1 / cnyToUsd).toFixed(4)}/USD
            </p>
            <p className="text-xs text-gray-400">Actualizado: {fmtDate(ratesFetchedAt)}</p>
          </div>
          {ratesUsedFallback && (
            <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full border border-amber-200">
              Tasa por defecto
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      {products.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-xs min-w-[640px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-semibold text-gray-500">Proveedor</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-500">Producto</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-500">Cant.</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-500">¥ RMB/u</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-500">Landed/u</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-500">Total</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-500">Desglose</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const supplier = suppliers.find((s) => s.id === p.supplierId);
                const isExpanded = expandedId === p.id;
                const isEditing = editingId === p.id && draft !== null;

                const draftProduct: ProductEntry = isEditing
                  ? {
                      ...p,
                      quantity: parseFloat(draft.quantity) || p.quantity,
                      unitPriceRmb: parseFloat(draft.unitPriceRmb) || p.unitPriceRmb,
                      piezasPorCaja: parseFloat(draft.piezasPorCaja) || p.piezasPorCaja,
                      cbm: parseFloat(draft.cbm) || p.cbm,
                      arancelRate: (Math.min(100, Math.max(0, parseFloat(draft.arancelRate) || 0))) / 100,
                      ivaRate: (Math.min(100, Math.max(0, parseFloat(draft.ivaRate) || 0))) / 100,
                    }
                  : p;

                const calc = calculateLandedCost({
                  unitPriceRmb: draftProduct.unitPriceRmb,
                  piezasPorCaja: draftProduct.piezasPorCaja,
                  cbm: draftProduct.cbm,
                  quantity: draftProduct.quantity,
                  trmCopUsd,
                  cnyToUsd,
                  arancelRate: draftProduct.arancelRate,
                  ivaRate: draftProduct.ivaRate,
                });

                const rawSellingPrice = sellingPrices[p.id] ?? '';
                const sellingPriceCop = parseFloat(rawSellingPrice.replace(/,/g, '.'));
                const landedCop = calc.landedCostPerUnit * trmCopUsd;
                const rentabilidad =
                  !isNaN(sellingPriceCop) && sellingPriceCop > 0 && landedCop > 0
                    ? ((sellingPriceCop - landedCop) / landedCop) * 100
                    : null;

                return (
                  <>
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 text-kuaizi-ink">{supplier?.name ?? '—'}</td>
                      <td className="px-3 py-2 text-kuaizi-ink">{p.name}</td>
                      <td className="px-3 py-2 text-right text-kuaizi-ink">{p.quantity}</td>
                      <td className="px-3 py-2 text-right text-kuaizi-ink">¥{p.unitPriceRmb.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-kuaizi-ink">
                        {fmtUSD(calc.landedCostPerUnit)}
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-kuaizi-secondary">
                        {fmtUSD(calc.totalLandedCost)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : p.id)}
                          className="text-xs text-kuaizi-secondary underline hover:opacity-70"
                        >
                          {isExpanded ? 'cerrar' : 'ver'}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => onRemove(p.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          aria-label="Remove product"
                        >
                          ×
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${p.id}-desglose`} className="bg-gray-50 border-b border-gray-200">
                        <td colSpan={8} className="px-4 py-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left column: edit form or read-only desglose */}
                            <div className="space-y-0.5">
                              {entityFiles?.get(p.id) && (
                                <ImagePreview file={entityFiles.get(p.id)!} />
                              )}
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-kuaizi-secondary uppercase tracking-wide">
                                  Desglose por unidad
                                </p>
                                {!isEditing && (
                                  <button
                                    type="button"
                                    onClick={() => startEdit(p)}
                                    className="text-xs text-kuaizi-secondary underline"
                                  >
                                    Editar
                                  </button>
                                )}
                              </div>

                              {isEditing ? (
                                <div className="space-y-3">
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-kuaizi-ink">Cantidad</label>
                                    <input
                                      type="number"
                                      value={draft.quantity}
                                      onChange={(e) => setDraft((d) => d ? { ...d, quantity: e.target.value } : d)}
                                      className="rounded-md border border-gray-300 bg-white text-sm px-3 py-1.5 focus:outline-none focus:border-kuaizi-accent focus:ring-1 focus:ring-kuaizi-accent w-full"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-kuaizi-ink">Precio unitario (¥ RMB)</label>
                                    <input
                                      type="number"
                                      value={draft.unitPriceRmb}
                                      onChange={(e) => setDraft((d) => d ? { ...d, unitPriceRmb: e.target.value } : d)}
                                      className="rounded-md border border-gray-300 bg-white text-sm px-3 py-1.5 focus:outline-none focus:border-kuaizi-accent focus:ring-1 focus:ring-kuaizi-accent w-full"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-kuaizi-ink">Piezas / caja</label>
                                    <input
                                      type="number"
                                      value={draft.piezasPorCaja}
                                      onChange={(e) => setDraft((d) => d ? { ...d, piezasPorCaja: e.target.value } : d)}
                                      className="rounded-md border border-gray-300 bg-white text-sm px-3 py-1.5 focus:outline-none focus:border-kuaizi-accent focus:ring-1 focus:ring-kuaizi-accent w-full"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-kuaizi-ink">CBM / caja</label>
                                    <input
                                      type="number"
                                      step="0.001"
                                      value={draft.cbm}
                                      onChange={(e) => setDraft((d) => d ? { ...d, cbm: e.target.value } : d)}
                                      className="rounded-md border border-gray-300 bg-white text-sm px-3 py-1.5 focus:outline-none focus:border-kuaizi-accent focus:ring-1 focus:ring-kuaizi-accent w-full"
                                    />
                                  </div>

                                  {saveError && (
                                    <p className="text-xs text-red-600">{saveError}</p>
                                  )}

                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-kuaizi-ink">Categoria arancelaria</label>
                                    <select
                                      value={draft.hsCategoryId}
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        if (v === CUSTOM_HS) {
                                          setDraft((d) => d ? { ...d, hsCategoryId: CUSTOM_HS } : d);
                                        } else {
                                          const cat = ALL_HS_CATEGORIES.find((c) => c.id === v);
                                          if (cat) {
                                            setDraft((d) =>
                                              d
                                                ? {
                                                    ...d,
                                                    hsCategoryId: v,
                                                    arancelRate: String(Math.round(cat.arancelRate * 100)),
                                                    ivaRate: String(Math.round(cat.ivaRate * 100)),
                                                  }
                                                : d
                                            );
                                          }
                                        }
                                      }}
                                      className="rounded-md border border-gray-300 bg-white text-sm px-3 py-1.5 focus:outline-none focus:border-kuaizi-accent focus:ring-1 focus:ring-kuaizi-accent w-full"
                                    >
                                      {ALL_HS_CATEGORIES.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                          {cat.label}
                                        </option>
                                      ))}
                                      <option value={CUSTOM_HS}>Personalizado</option>
                                    </select>
                                  </div>

                                  {draft.hsCategoryId === CUSTOM_HS && (
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <label className="text-xs font-medium text-kuaizi-ink">Arancel (%)</label>
                                        <input
                                          type="number"
                                          min={0}
                                          max={100}
                                          value={draft.arancelRate}
                                          onChange={(e) => setDraft((d) => d ? { ...d, arancelRate: e.target.value } : d)}
                                          className="rounded-md border border-gray-300 bg-white text-sm px-3 py-1.5 focus:outline-none focus:border-kuaizi-accent focus:ring-1 focus:ring-kuaizi-accent w-full"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-xs font-medium text-kuaizi-ink">IVA (%)</label>
                                        <input
                                          type="number"
                                          min={0}
                                          max={100}
                                          value={draft.ivaRate}
                                          onChange={(e) => setDraft((d) => d ? { ...d, ivaRate: e.target.value } : d)}
                                          className="rounded-md border border-gray-300 bg-white text-sm px-3 py-1.5 focus:outline-none focus:border-kuaizi-accent focus:ring-1 focus:ring-kuaizi-accent w-full"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSave(p.id)}
                                      disabled={draftToFields(draft) === null}
                                      className="rounded-lg bg-kuaizi-secondary text-white px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleCancel}
                                      className="rounded-lg border border-gray-300 text-gray-600 px-3 py-1.5 text-xs font-semibold"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <DesglosRow label="Precio EXW" value={calc.exwPerUnit} />
                                  <DesglosRow label="Margen Kuaizi" value={calc.kuaiziMarginPerUnit} pct="5%" />
                                  <DesglosRow label="Flete / CBM" value={calc.freightPerUnit} />
                                  <DesglosRow label="Seguro" value={calc.insurancePerUnit} pct="0.35%" />
                                  <DesglosRow label="CIF" value={calc.cifPerUnit} bold />
                                  <DesglosRow
                                    label="Arancel"
                                    value={calc.arancelPerUnit}
                                    pct={`${Math.round(draftProduct.arancelRate * 100)}%`}
                                  />
                                  <DesglosRow
                                    label="IVA"
                                    value={calc.ivaPerUnit}
                                    pct={`${Math.round(draftProduct.ivaRate * 100)}%`}
                                  />
                                  <DesglosRow label="Landed / u" value={calc.landedCostPerUnit} bold />
                                </>
                              )}
                            </div>

                            {/* Right column: rentabilidad + live desglose preview when editing */}
                            <div className="space-y-2">
                              {isEditing ? (
                                <>
                                  <p className="text-xs font-bold text-kuaizi-secondary uppercase tracking-wide mb-2">
                                    Vista previa
                                  </p>
                                  <DesglosRow label="Precio EXW" value={calc.exwPerUnit} />
                                  <DesglosRow label="Margen Kuaizi" value={calc.kuaiziMarginPerUnit} pct="5%" />
                                  <DesglosRow label="Flete / CBM" value={calc.freightPerUnit} />
                                  <DesglosRow label="Seguro" value={calc.insurancePerUnit} pct="0.35%" />
                                  <DesglosRow label="CIF" value={calc.cifPerUnit} bold />
                                  <DesglosRow
                                    label="Arancel"
                                    value={calc.arancelPerUnit}
                                    pct={`${Math.round(draftProduct.arancelRate * 100)}%`}
                                  />
                                  <DesglosRow
                                    label="IVA"
                                    value={calc.ivaPerUnit}
                                    pct={`${Math.round(draftProduct.ivaRate * 100)}%`}
                                  />
                                  <DesglosRow label="Landed / u" value={calc.landedCostPerUnit} bold />
                                </>
                              ) : (
                                <>
                                  <p className="text-xs font-bold text-kuaizi-secondary uppercase tracking-wide mb-2">
                                    Rentabilidad
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Costo landed: {fmtUSD(calc.landedCostPerUnit)} ={' '}
                                    {(calc.landedCostPerUnit * trmCopUsd).toLocaleString('es-CO', {
                                      style: 'currency',
                                      currency: 'COP',
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    })} COP
                                  </p>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-kuaizi-ink">
                                      Precio de venta (COP / u)
                                    </label>
                                    <input
                                      type="text"
                                      inputMode="decimal"
                                      value={rawSellingPrice}
                                      onChange={(e) =>
                                        setSellingPrices((prev) => ({ ...prev, [p.id]: e.target.value }))
                                      }
                                      placeholder="Ej: 25000"
                                      className="rounded-md border border-gray-300 bg-white text-sm px-3 py-1.5 focus:outline-none focus:border-kuaizi-accent focus:ring-1 focus:ring-kuaizi-accent w-full"
                                    />
                                  </div>
                                  {rentabilidad !== null && (
                                    <div
                                      className={`rounded-lg px-3 py-2 flex justify-between items-center ${
                                        rentabilidad >= 0
                                          ? 'bg-emerald-50 border border-emerald-200'
                                          : 'bg-red-50 border border-red-200'
                                      }`}
                                    >
                                      <span className={`text-xs font-semibold ${rentabilidad >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                                        Rentabilidad
                                      </span>
                                      <span className={`text-sm font-bold ${rentabilidad >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                                        {rentabilidad >= 0 ? '+' : ''}{rentabilidad.toFixed(2)}%
                                      </span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}

              {/* Grand total */}
              <tr className="bg-gray-50 border-t-2 border-gray-300">
                <td colSpan={5} className="px-3 py-2 text-right font-bold text-gray-600 text-sm">
                  TOTAL
                </td>
                <td className="px-3 py-2 text-right font-bold text-kuaizi-secondary text-sm">
                  {fmtUSD(grandTotal)}
                </td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {products.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No hay productos en la cotizacion todavia.</p>
      )}

      {/* Order breakdown */}
      {products.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowOrderBreakdown((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-kuaizi-ink hover:bg-gray-50 transition-colors"
          >
            <span>Desglose total de la orden ({products.length} producto{products.length !== 1 ? 's' : ''})</span>
            <span className="text-gray-400 text-xs">{showOrderBreakdown ? '▲' : '▼'}</span>
          </button>

          {showOrderBreakdown && (
            <div className="px-4 pb-4 space-y-0.5 border-t border-gray-100">
              <div className="pt-3" />
              <DesglosRow label="EXW total" value={orderTotals.exw} />
              <DesglosRow label="Margen Kuaizi" value={orderTotals.margin} pct="5%" />
              <DesglosRow label="Flete total" value={orderTotals.freight} />
              <DesglosRow label="Seguro total" value={orderTotals.insurance} pct="0.35%" />
              <DesglosRow label="CIF total" value={orderTotals.cif} bold />
              <DesglosRow label="Aranceles totales" value={orderTotals.arancel} />
              <DesglosRow label="IVA total" value={orderTotals.iva} />
              <DesglosRow label="Landed total" value={orderTotals.landed} bold />
            </div>
          )}
        </div>
      )}

      {/* Share result */}
      {shareStatus === 'success' && sheetUrl && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center justify-between gap-3">
          <p className="text-sm text-emerald-700 font-semibold">Sheet creado</p>
          <a
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-emerald-700 underline shrink-0"
          >
            Abrir Sheet →
          </a>
        </div>
      )}
      {shareStatus === 'error' && shareError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-600">{shareError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {products.length > 0 && onShare && (
          <button
            type="button"
            onClick={onShare}
            disabled={shareStatus === 'sharing'}
            className="flex-1 rounded-xl bg-kuaizi-secondary text-white py-3 text-sm font-semibold hover:bg-kuaizi-secondary/90 transition-colors disabled:opacity-50"
          >
            {shareStatus === 'sharing' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Creando Sheet...
              </span>
            ) : shareStatus === 'success' ? (
              'Compartir de nuevo'
            ) : (
              'Compartir en Drive'
            )}
          </button>
        )}
        {products.length > 0 && (
          <button
            type="button"
            onClick={copyAsText}
            className="rounded-xl border border-gray-300 text-gray-600 px-4 py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
            title="Copiar como texto"
          >
            Copiar texto
          </button>
        )}
        {onNewQuote && (
          <button
            type="button"
            onClick={onNewQuote}
            className="flex-1 rounded-xl border border-gray-300 text-gray-600 py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Nueva cotizacion
          </button>
        )}
      </div>
    </div>
  );
}
