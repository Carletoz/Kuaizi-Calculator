import { useCalculator } from '@/state/context';
import { WarningBanners } from './results/WarningBanners';
import { ResultsTable } from './results/ResultsTable';
import { MarginCalculator } from './results/MarginCalculator';
import { ExportButton } from './results/ExportButton';

function fmtUSD(v: number): string {
  return v.toLocaleString('es-CO', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

function fmtCOP(v: number): string {
  return v.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function ResultsPanel() {
  const { result } = useCalculator();
  const hasData = result.totalLandedUsd > 0;

  return (
    <div className="results-panel md:sticky md:top-4 md:self-start space-y-4">
      {/* Print-only header */}
      <div className="print-header space-y-1 mb-4">
        <div className="text-lg font-bold text-kuaizi-secondary">Kuaizi Group</div>
        <div className="text-sm text-gray-600">Calculadora de Costo de Importación China → Colombia</div>
        <div className="text-xs text-gray-500">
          Cotización generada el {new Date().toLocaleString('es-CO')}
        </div>
        {result.trmUsed.value > 0 && (
          <div className="text-xs text-gray-500">
            TRM: {result.trmUsed.value.toLocaleString('es-CO')} COP/USD
            {result.trmUsed.date && ` · Fecha: ${result.trmUsed.date}`}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-kuaizi-secondary px-4 py-3">
          <h2 className="text-sm font-semibold text-white">Costo Total de Importación</h2>
          {result.trmUsed.value > 0 && (
            <p className="text-xs text-kuaizi-light/70 mt-0.5">
              TRM: {result.trmUsed.value.toLocaleString('es-CO')} · {result.trmUsed.date || 'Sin fecha'}
            </p>
          )}
        </div>

        {!hasData ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            Complete el formulario para ver el costo de importación calculado.
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Summary totals */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-kuaizi-light p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Total USD</div>
                <div className="text-lg font-bold text-kuaizi-secondary">
                  {fmtUSD(result.totalLandedUsd)}
                </div>
              </div>
              <div className="rounded-md bg-kuaizi-secondary/10 p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Total COP</div>
                <div className="text-lg font-bold text-kuaizi-secondary">
                  {fmtCOP(result.totalLandedCop)}
                </div>
              </div>
            </div>

            {result.costPerUnitUsd > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-gray-50 p-2 text-center">
                  <div className="text-xs text-gray-500">Por unidad (USD)</div>
                  <div className="font-semibold text-kuaizi-ink">{fmtUSD(result.costPerUnitUsd)}</div>
                </div>
                <div className="rounded-md bg-gray-50 p-2 text-center">
                  <div className="text-xs text-gray-500">Por unidad (COP)</div>
                  <div className="font-semibold text-kuaizi-ink">{fmtCOP(result.costPerUnitCop)}</div>
                </div>
              </div>
            )}

            <WarningBanners />
          </div>
        )}
      </div>

      {/* Full breakdown */}
      {hasData && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-kuaizi-secondary">Desglose detallado</h3>
          </div>
          <div className="p-4">
            <ResultsTable />
          </div>
        </div>
      )}

      {/* Margin calculator */}
      <MarginCalculator />

      {/* Export */}
      <ExportButton />
    </div>
  );
}
