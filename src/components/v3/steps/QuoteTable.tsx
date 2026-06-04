import { useState } from 'react';
import { calculateLandedCost } from '@/lib/calc/v3-landed';
import type { ProductEntry, SupplierEntry } from '@/state/session/types';

type ShareStatus = 'idle' | 'sharing' | 'success' | 'error';

interface QuoteTableProps {
  products: ProductEntry[];
  suppliers: SupplierEntry[];
  trmCopUsd: number;
  cnyToUsd: number;
  ratesFetchedAt: string | null;
  ratesUsedFallback: boolean;
  onRemove: (id: string) => void;
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

export function QuoteTable({
  products,
  suppliers,
  trmCopUsd,
  cnyToUsd,
  ratesFetchedAt,
  ratesUsedFallback,
  onRemove,
  onNewQuote,
  onShare,
  shareStatus = 'idle',
  sheetUrl,
  shareError,
}: QuoteTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sellingPrices, setSellingPrices] = useState<Record<string, string>>({});
  const [showOrderBreakdown, setShowOrderBreakdown] = useState(false);

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
                const calc = calculateLandedCost({
                  unitPriceRmb: p.unitPriceRmb,
                  piezasPorCaja: p.piezasPorCaja,
                  cbm: p.cbm,
                  quantity: p.quantity,
                  trmCopUsd,
                  cnyToUsd,
                  arancelRate: p.arancelRate,
                  ivaRate: p.ivaRate,
                });
                const isExpanded = expandedId === p.id;

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
                            {/* Cost breakdown */}
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-kuaizi-secondary uppercase tracking-wide mb-2">
                                Desglose por unidad
                              </p>
                              <DesglosRow label="Precio EXW" value={calc.exwPerUnit} />
                              <DesglosRow label="Margen Kuaizi" value={calc.kuaiziMarginPerUnit} pct="5%" />
                              <DesglosRow label="Flete / CBM" value={calc.freightPerUnit} />
                              <DesglosRow label="Seguro" value={calc.insurancePerUnit} pct="0.35%" />
                              <DesglosRow label="CIF" value={calc.cifPerUnit} bold />
                              <DesglosRow
                                label="Arancel"
                                value={calc.arancelPerUnit}
                                pct={`${Math.round(p.arancelRate * 100)}%`}
                              />
                              <DesglosRow
                                label="IVA"
                                value={calc.ivaPerUnit}
                                pct={`${Math.round(p.ivaRate * 100)}%`}
                              />
                              <DesglosRow label="Landed / u" value={calc.landedCostPerUnit} bold />
                            </div>

                            {/* Rentabilidad */}
                            <div className="space-y-2">
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
