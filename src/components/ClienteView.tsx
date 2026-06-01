import { useState, useMemo, useCallback } from 'react';
import { NumberField } from '@/components/ui/NumberField';
import { ALL_HS_CATEGORIES, getHSCategory } from '@/data/hs-categories';
import { ScanButton } from '@/components/scan/ScanButton';
import type { ScanResult } from '@/lib/scan/openai-vision';

const FALLBACK_IVA_RATE = 0.19;
const INSURANCE_RATE = 0.0035;

interface ClienteInputs {
  unitPriceUsd: number;
  quantity: number;
  unitWeightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  airCostPerKgUsd: number;
  seaCostPerCbmUsd: number;
  hsCategoryId: string;
  trm: number;
}

interface ModeResult {
  freightUsd: number;
  insuranceUsd: number;
  cifUsd: number;
  impuestosUsd: number;
  totalUsd: number;
  perUnitUsd: number;
  perUnitCop: number;
}

const DEFAULT_INPUTS: ClienteInputs = {
  unitPriceUsd: 0,
  quantity: 0,
  unitWeightKg: 0,
  lengthCm: 0,
  widthCm: 0,
  heightCm: 0,
  airCostPerKgUsd: 0,
  seaCostPerCbmUsd: 0,
  hsCategoryId: '',
  trm: 4200,
};

function calcMode(
  exwTotal: number,
  freightUsd: number,
  arancelRate: number,
  ivaRate: number,
  trm: number,
  quantity: number
): ModeResult {
  const insuranceUsd = (exwTotal + freightUsd) * INSURANCE_RATE;
  const cifUsd = exwTotal + freightUsd + insuranceUsd;
  const arancelUsd = cifUsd * arancelRate;
  const ivaUsd = (cifUsd + arancelUsd) * ivaRate;
  const impuestosUsd = arancelUsd + ivaUsd;
  const totalUsd = cifUsd + impuestosUsd;
  const perUnitUsd = totalUsd / quantity;
  const perUnitCop = trm > 0 ? perUnitUsd * trm : 0;
  return { freightUsd, insuranceUsd, cifUsd, impuestosUsd, totalUsd, perUnitUsd, perUnitCop };
}

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

interface ResultCardProps {
  mode: 'air' | 'sea';
  result: ModeResult;
  exwUsd: number;
  arancelPct: number;
  ivaPct: number;
  isCheaper: boolean;
  bothPresent: boolean;
  isPending: boolean;
}

function ResultCard({ mode, result, exwUsd, arancelPct, ivaPct, isCheaper, bothPresent, isPending }: ResultCardProps) {
  const isAir = mode === 'air';
  return (
    <div
      className={`rounded-xl border-2 bg-white shadow-sm overflow-hidden ${
        isAir ? 'border-amber-300' : 'border-emerald-300'
      }`}
    >
      <div
        className={`px-4 py-3 flex items-center justify-between ${
          isAir ? 'bg-amber-50' : 'bg-emerald-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{isAir ? '✈️' : '🚢'}</span>
          <span className={`font-bold ${isAir ? 'text-amber-700' : 'text-emerald-700'}`}>
            {isAir ? 'Avión' : 'Barco'}
          </span>
        </div>
        {bothPresent && isCheaper && (
          <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full border border-emerald-200">
            ✓ MÁS BARATO
          </span>
        )}
      </div>

      <div className="p-4 space-y-1.5">
        <ResultRow label="Precio EXW" value={fmtUSD(exwUsd)} />

        {isPending ? (
          <p className="text-xs text-gray-400 italic py-2">
            Ingresá el costo de flete para ver el estimado
          </p>
        ) : (
          <>
            <ResultRow label="Costo de envío" value={fmtUSD(result.freightUsd)} />
            <ResultRow label="Seguro (0.35%)" value={fmtUSD(result.insuranceUsd)} />

            <div className="border-t border-gray-100 pt-1.5">
              <ResultRow label="CIF" value={fmtUSD(result.cifUsd)} bold />
            </div>

            <ResultRow
              label={`Impuestos (arancel ${arancelPct}% + IVA ${ivaPct}%)`}
              value={fmtUSD(result.impuestosUsd)}
            />

            <div className="border-t border-gray-200 pt-3 mt-1">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-400 mt-1.5">
                  Total / unidad
                </span>
                <div className="text-right">
                  <div
                    className={`text-2xl font-bold ${isAir ? 'text-amber-600' : 'text-emerald-600'}`}
                  >
                    {fmtUSD(result.perUnitUsd)}
                  </div>
                  {result.perUnitCop > 0 && (
                    <div className="text-xs text-gray-400 mt-0.5">{fmtCOP(result.perUnitCop)}</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {isPending && (
          <div className="border-t border-gray-200 pt-3 mt-1">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-400 mt-1.5">
                Total / unidad
              </span>
              <div className="text-right">
                <div
                  className={`text-2xl font-bold ${isAir ? 'text-amber-300' : 'text-emerald-300'}`}
                >
                  —
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className={`flex justify-between items-start gap-2 text-sm ${bold ? 'font-semibold' : ''}`}>
      <span className="text-gray-500 leading-tight">{label}</span>
      <span className="text-kuaizi-ink shrink-0">{value}</span>
    </div>
  );
}

export function ClienteView() {
  const [inp, setInp] = useState<ClienteInputs>(DEFAULT_INPUTS);
  const set = (k: keyof ClienteInputs) => (v: number) => setInp((prev) => ({ ...prev, [k]: v }));
  const setStr = (k: keyof ClienteInputs) => (v: string) => setInp((prev) => ({ ...prev, [k]: v }));

  const handleScanResult = useCallback((result: ScanResult) => {
    setInp(prev => {
      const cat = getHSCategory(result.hsCategoryId);
      return {
        ...prev,
        unitWeightKg: result.weightKg,
        lengthCm: result.dimensionsCm.l,
        widthCm: result.dimensionsCm.w,
        heightCm: result.dimensionsCm.h,
        ...(cat ? { hsCategoryId: result.hsCategoryId } : {}),
      };
    });
  }, []);

  const { air, sea, volWeightKg, chargeableKg, cbm, arancelPct, ivaPct, airPending, seaPending } = useMemo(() => {
    const cbmPerUnit = (inp.lengthCm * inp.widthCm * inp.heightCm) / 1_000_000;
    const volWeightKgPerUnit = (inp.lengthCm * inp.widthCm * inp.heightCm) / 6000;
    const chargeableKg = Math.max(inp.unitWeightKg, volWeightKgPerUnit);
    const totalCbm = cbmPerUnit * Math.max(inp.quantity, 1);

    const cat = getHSCategory(inp.hsCategoryId);
    const arancelRate = cat ? cat.arancelRate : 0;
    const ivaRate = cat ? cat.ivaRate : FALLBACK_IVA_RATE;
    const arancelPct = Math.round(arancelRate * 100);
    const ivaPct = Math.round(ivaRate * 100);

    const exwTotal = inp.unitPriceUsd * inp.quantity;
    const canCalc = inp.quantity > 0 && inp.unitPriceUsd > 0;

    const airFreight = chargeableKg * inp.quantity * inp.airCostPerKgUsd;
    const seaFreight = totalCbm * inp.seaCostPerCbmUsd;

    const airPending = inp.airCostPerKgUsd === 0;
    const seaPending = inp.seaCostPerCbmUsd === 0;

    return {
      air: canCalc ? calcMode(exwTotal, airFreight, arancelRate, ivaRate, inp.trm, inp.quantity) : null,
      sea: canCalc ? calcMode(exwTotal, seaFreight, arancelRate, ivaRate, inp.trm, inp.quantity) : null,
      volWeightKg: volWeightKgPerUnit,
      chargeableKg,
      cbm: totalCbm,
      arancelPct,
      ivaPct,
      airPending,
      seaPending,
    };
  }, [inp]);

  const bothComplete = !airPending && !seaPending;
  const cheaperIs: 'air' | 'sea' | null =
    air && sea && bothComplete ? (air.perUnitUsd <= sea.perUnitUsd ? 'air' : 'sea') : null;

  const showDims =
    inp.lengthCm > 0 || inp.widthCm > 0 || inp.heightCm > 0 || inp.unitWeightKg > 0;

  const exwUsd = inp.unitPriceUsd * inp.quantity;

  const selectedCategory = getHSCategory(inp.hsCategoryId) ?? null;

  return (
    <div className="space-y-5">
      {/* Product inputs */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 overflow-hidden">
        <h2 className="text-xs font-bold text-kuaizi-secondary uppercase tracking-widest mb-4">
          Datos del producto
        </h2>
        <div className="space-y-3">
          <ScanButton onScanResult={handleScanResult} />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Precio unitario"
              value={inp.unitPriceUsd}
              onChange={set('unitPriceUsd')}
              prefix="$"
              hint="USD"
              step={0.01}
              min={0}
            />
            <NumberField
              label="Cantidad"
              value={inp.quantity}
              onChange={set('quantity')}
              suffix="uds"
              step={1}
              min={1}
            />
          </div>

          <NumberField
            label="Peso por unidad"
            value={inp.unitWeightKg}
            onChange={set('unitWeightKg')}
            suffix="kg"
            step={0.01}
            min={0}
          />

          <div>
            <label className="text-sm font-medium text-kuaizi-ink block mb-1">
              Dimensiones por unidad{' '}
              <span className="text-xs font-normal text-gray-400">(cm)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <NumberField label="Largo" value={inp.lengthCm} onChange={set('lengthCm')} min={0} />
              <NumberField label="Ancho" value={inp.widthCm} onChange={set('widthCm')} min={0} />
              <NumberField label="Alto" value={inp.heightCm} onChange={set('heightCm')} min={0} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-sm font-medium text-kuaizi-ink">
                Categoría de producto
              </label>
              <select
                value={inp.hsCategoryId}
                onChange={(e) => setStr('hsCategoryId')(e.target.value)}
                className="rounded-md border border-gray-300 bg-white text-sm text-kuaizi-ink px-3 py-2 focus:outline-none focus:border-kuaizi-accent focus:ring-1 focus:ring-kuaizi-accent"
              >
                <option value="">— Seleccioná una categoría —</option>
                {ALL_HS_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              {selectedCategory && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Arancel: {arancelPct}% · IVA: {ivaPct}%
                </p>
              )}
            </div>
            <NumberField
              label="TRM"
              value={inp.trm}
              onChange={set('trm')}
              suffix="COP"
              step={1}
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Freight rate inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Avión */}
        <div className="rounded-xl border-2 border-amber-300 bg-white shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">✈️</span>
            <span className="font-bold text-amber-700">Avión</span>
          </div>
          <div className="space-y-3">
            <NumberField
              label="Costo por kg"
              value={inp.airCostPerKgUsd}
              onChange={set('airCostPerKgUsd')}
              prefix="$"
              hint="USD/kg"
              step={0.01}
              min={0}
            />
          </div>
        </div>

        {/* Barco */}
        <div className="rounded-xl border-2 border-emerald-300 bg-white shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🚢</span>
            <span className="font-bold text-emerald-700">Barco</span>
          </div>
          <NumberField
            label="Costo por CBM"
            value={inp.seaCostPerCbmUsd}
            onChange={set('seaCostPerCbmUsd')}
            prefix="$"
            hint="USD/CBM"
            step={1}
            min={0}
          />
        </div>
      </div>

      {/* Computed dimensions info */}
      {showDims && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Peso volumétrico', value: `${volWeightKg.toFixed(3)} kg` },
            { label: 'Peso tomado', value: `${chargeableKg.toFixed(3)} kg` },
            { label: 'Volumen (CBM)', value: `${cbm.toFixed(4)} m³` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg bg-kuaizi-secondary/10 border border-kuaizi-secondary/20 p-3 text-center"
            >
              <div className="text-xs text-kuaizi-secondary/60 font-semibold uppercase tracking-wide leading-tight mb-1">
                {label}
              </div>
              <div className="text-sm font-bold text-kuaizi-secondary">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Result comparison cards */}
      {(air !== null || sea !== null) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {air !== null && (
            <ResultCard
              mode="air"
              result={air}
              exwUsd={exwUsd}
              arancelPct={arancelPct}
              ivaPct={ivaPct}
              isCheaper={cheaperIs === 'air'}
              bothPresent={bothComplete}
              isPending={airPending}
            />
          )}
          {sea !== null && (
            <ResultCard
              mode="sea"
              result={sea}
              exwUsd={exwUsd}
              arancelPct={arancelPct}
              ivaPct={ivaPct}
              isCheaper={cheaperIs === 'sea'}
              bothPresent={bothComplete}
              isPending={seaPending}
            />
          )}
        </div>
      )}
    </div>
  );
}
