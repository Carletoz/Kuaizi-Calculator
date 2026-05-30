import { useCalculator } from '@/state/context';

function fmtUSD(v: number): string {
  return v.toLocaleString('es-CO', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

function fmtCOP(v: number): string {
  return v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function usdToCop(usd: number, trm: number): number {
  return Math.round(usd * trm);
}

interface RowProps {
  label: string;
  usd: number;
  cop?: number;
  isSummary?: boolean;
  isSubtotal?: boolean;
  hideIfZero?: boolean;
  trm?: number;
}

function ResultRow({ label, usd, cop, isSummary, isSubtotal, hideIfZero, trm }: RowProps) {
  const displayCop = cop !== undefined ? cop : (trm ? usdToCop(usd, trm) : 0);

  if (hideIfZero && usd === 0 && displayCop === 0) return null;

  const rowClass = `result-row flex justify-between items-center py-1.5 px-2 text-sm ${
    isSummary
      ? 'bg-kuaizi-secondary text-white font-bold rounded-md'
      : isSubtotal
      ? 'bg-gray-100 font-semibold text-kuaizi-secondary'
      : 'border-b border-gray-100'
  }`;

  return (
    <div className={rowClass}>
      <span className={`min-w-0 truncate ${isSummary ? 'text-white' : 'text-kuaizi-ink'}`}>{label}</span>
      <div className="text-right flex-shrink-0">
        <div className={isSummary ? 'text-white' : 'font-medium'}>{fmtUSD(usd)}</div>
        <div className={`text-xs ${isSummary ? 'text-kuaizi-light/80' : 'text-gray-500'}`}>
          {fmtCOP(displayCop)}
        </div>
      </div>
    </div>
  );
}

export function ResultsTable() {
  const { result, state } = useCalculator();
  const trm = result.trmUsed.value;
  const isKuaizi = state.mode === 'kuaizi';

  return (
    <div className="space-y-1">
      {/* Table header */}
      <div className="flex justify-between items-center py-1.5 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b-2 border-gray-200">
        <span>Concepto</span>
        <div className="text-right">
          <div>USD</div>
          <div>COP</div>
        </div>
      </div>

      {/* Group: Producto y Origen */}
      <div className="mt-2 mb-1 px-2 text-xs font-semibold text-kuaizi-accent uppercase tracking-wide">
        Producto y Origen
      </div>
      <ResultRow label="Valor del producto" usd={result.productValueUsd} cop={usdToCop(result.productValueUsd, trm)} hideIfZero />
      {result.chinaSideUsd > 0 && (
        <ResultRow label="Costos en China" usd={result.chinaSideUsd} cop={usdToCop(result.chinaSideUsd, trm)} />
      )}
      <ResultRow label="Valor FOB" usd={result.fobUsd} cop={usdToCop(result.fobUsd, trm)} isSubtotal hideIfZero />

      {isKuaizi ? (
        /* Kuaizi mode: single consolidated DDP row */
        <>
          <div className="mt-3 mb-1 px-2 text-xs font-semibold text-kuaizi-accent uppercase tracking-wide">
            DDP Consolidado
          </div>
          <ResultRow
            label="DDP (todo incluido)"
            usd={result.ddpUsd}
            cop={result.ddpCop}
            isSubtotal
            hideIfZero
          />
        </>
      ) : (
        /* Completo mode: full breakdown */
        <>
          {/* Group: Flete y Seguro */}
          <div className="mt-3 mb-1 px-2 text-xs font-semibold text-kuaizi-accent uppercase tracking-wide">
            Flete y Seguro
          </div>
          <ResultRow label="Flete internacional" usd={result.freightUsd} cop={usdToCop(result.freightUsd, trm)} hideIfZero />
          <ResultRow label="Seguro de carga" usd={result.insuranceUsd} cop={usdToCop(result.insuranceUsd, trm)} hideIfZero />
          <ResultRow label="Valor CIF" usd={result.cifUsd} cop={result.cifCop} isSubtotal hideIfZero />

          {/* Group: Tributos Colombia */}
          <div className="mt-3 mb-1 px-2 text-xs font-semibold text-kuaizi-accent uppercase tracking-wide">
            Tributos Colombia
          </div>
          <ResultRow label="Arancel" usd={result.arancelCop / trm} cop={result.arancelCop} hideIfZero />
          <ResultRow label="IVA" usd={result.ivaCop / trm} cop={result.ivaCop} hideIfZero />
          {result.antidumpingCop > 0 && (
            <ResultRow label="Antidumping" usd={result.antidumpingCop / trm} cop={result.antidumpingCop} />
          )}
          <ResultRow label="Total tributos" usd={result.totalTributosUsd} cop={result.totalTributosCop} isSubtotal hideIfZero />

          {/* Group: Nacionalización */}
          <div className="mt-3 mb-1 px-2 text-xs font-semibold text-kuaizi-accent uppercase tracking-wide">
            Nacionalización
          </div>
          <ResultRow label="Costos de nacionalización" usd={result.nationalizationUsd} cop={result.nationalizationCop} hideIfZero />
        </>
      )}

      {/* Group: Distribución Local — always shown */}
      <div className="mt-3 mb-1 px-2 text-xs font-semibold text-kuaizi-accent uppercase tracking-wide">
        Distribución Local
      </div>
      <ResultRow label="Distribución local" usd={result.localUsd} cop={usdToCop(result.localUsd, trm)} hideIfZero />

      {/* Group: Servicios — always shown */}
      <div className="mt-3 mb-1 px-2 text-xs font-semibold text-kuaizi-accent uppercase tracking-wide">
        Servicios
      </div>
      <ResultRow label="Costos financieros" usd={result.financialUsd} cop={usdToCop(result.financialUsd, trm)} hideIfZero />
      <ResultRow label="Servicios Kuaizi" usd={result.kuaiziUsd} cop={usdToCop(result.kuaiziUsd, trm)} hideIfZero />

      {/* Total */}
      <div className="mt-4">
        <ResultRow
          label="COSTO TOTAL IMPORTADO"
          usd={result.totalLandedUsd}
          cop={result.totalLandedCop}
          isSummary
        />
      </div>

      {/* Per-unit */}
      <div className="mt-2 space-y-1">
        <ResultRow label="Costo por unidad (USD)" usd={result.costPerUnitUsd} cop={result.costPerUnitCop} isSubtotal hideIfZero />
      </div>

      {/* TRM footnote */}
      {trm > 0 && (
        <div className="mt-3 px-2 py-1 text-xs text-gray-400 border-t border-gray-100">
          TRM: {trm.toLocaleString('es-CO')} COP/USD
          {result.trmUsed.date && ` · Fecha: ${result.trmUsed.date}`}
        </div>
      )}
    </div>
  );
}
