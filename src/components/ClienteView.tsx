import { useState, useMemo } from 'react';
import { NumberField } from '@/components/ui/NumberField';
import { ALL_HS_CATEGORIES, getHSCategory } from '@/data/hs-categories';

const KUAIZI_MARGIN_RATE = 0.05;
const INSURANCE_RATE = 0.0035;
const FALLBACK_IVA_RATE = 0.19;

interface ClienteInputs {
  unitPriceUsd: number;
  desiredQuantity: number;
  piezasPorCaja: number;
  boxWeightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  airCostPerKgUsd: number;
  seaCostPerCbmUsd: number;
  hsCategoryId: string;
  trm: number;
  precioVentaCop: number;
}

interface ModeResult {
  freightUsd: number;
  insuranceUsd: number;
  cifUsd: number;
  arancelUsd: number;
  ivaUsd: number;
  impuestosUsd: number;
  totalUsd: number;
  perUnitUsd: number;
  perUnitCop: number;
}

const DEFAULT_INPUTS: ClienteInputs = {
  unitPriceUsd: 0,
  desiredQuantity: 0,
  piezasPorCaja: 0,
  boxWeightKg: 0,
  lengthCm: 0,
  widthCm: 0,
  heightCm: 0,
  airCostPerKgUsd: 0,
  seaCostPerCbmUsd: 0,
  hsCategoryId: '',
  trm: 4200,
  precioVentaCop: 0,
};

function calcMode(
  exwWithMarginUsd: number,
  freightUsd: number,
  arancelRate: number,
  ivaRate: number,
  trm: number,
  realQuantity: number
): ModeResult {
  const insuranceUsd = (exwWithMarginUsd + freightUsd) * INSURANCE_RATE;
  const cifUsd = exwWithMarginUsd + freightUsd + insuranceUsd;
  const arancelUsd = cifUsd * arancelRate;
  const ivaUsd = (cifUsd + arancelUsd) * ivaRate;
  const impuestosUsd = arancelUsd + ivaUsd;
  const totalUsd = cifUsd + impuestosUsd;
  const perUnitUsd = realQuantity > 0 ? totalUsd / realQuantity : 0;
  const perUnitCop = trm > 0 ? perUnitUsd * trm : 0;
  return { freightUsd, insuranceUsd, cifUsd, arancelUsd, ivaUsd, impuestosUsd, totalUsd, perUnitUsd, perUnitCop };
}

function fmtUSD(v: number): string {
  return v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

function fmtCOP(v: number): string {
  return `COP ${Math.round(v).toLocaleString('es-CO')}`;
}

function ResultRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between items-start gap-2 text-sm ${bold ? 'font-semibold' : ''}`}>
      <span className="text-gray-500 leading-tight">{label}</span>
      <span className="text-kuaizi-ink shrink-0">{value}</span>
    </div>
  );
}

interface ResultCardProps {
  mode: 'air' | 'sea';
  result: ModeResult;
  exwUsd: number;
  kuaiziMarginUsd: number;
  arancelPct: number;
  ivaPct: number;
  isCheaper: boolean;
  bothPresent: boolean;
  isPending: boolean;
  precioVentaCop: number;
}

function ResultCard({
  mode,
  result,
  exwUsd,
  kuaiziMarginUsd,
  arancelPct,
  ivaPct,
  isCheaper,
  bothPresent,
  isPending,
  precioVentaCop,
}: ResultCardProps) {
  const isAir = mode === 'air';

  const rentabilidad =
    precioVentaCop > 0 && result.perUnitCop > 0
      ? ((precioVentaCop - result.perUnitCop) / result.perUnitCop) * 100
      : null;

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
        <ResultRow label="Precio EXW/FOB" value={fmtUSD(exwUsd)} />
        <ResultRow
          label={`Margen Kuaizi (${Math.round(KUAIZI_MARGIN_RATE * 100)}%)`}
          value={fmtUSD(kuaiziMarginUsd)}
        />

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

            <ResultRow label={`Arancel (${arancelPct}%)`} value={fmtUSD(result.arancelUsd)} />
            <ResultRow label={`IVA (${ivaPct}%)`} value={fmtUSD(result.ivaUsd)} />

            <div className="border-t border-gray-200 pt-3 mt-1">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-400 mt-1.5">
                  Total / unidad
                </span>
                <div className="text-right">
                  <div
                    className={`text-2xl font-bold ${
                      isAir ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  >
                    {fmtUSD(result.perUnitUsd)}
                  </div>
                  {result.perUnitCop > 0 && (
                    <div className="text-xs text-gray-400 mt-0.5">{fmtCOP(result.perUnitCop)}</div>
                  )}
                </div>
              </div>
            </div>

            {rentabilidad !== null && (
              <div
                className={`rounded-lg px-3 py-2 mt-2 flex justify-between items-center ${
                  rentabilidad >= 0
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <span
                  className={`text-xs font-semibold ${
                    rentabilidad >= 0 ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  Rentabilidad
                </span>
                <span
                  className={`text-sm font-bold ${
                    rentabilidad >= 0 ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {rentabilidad >= 0 ? '+' : ''}
                  {rentabilidad.toFixed(2)}%
                </span>
              </div>
            )}
          </>
        )}

        {isPending && (
          <div className="border-t border-gray-200 pt-3 mt-1">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-400 mt-1.5">
                Total / unidad
              </span>
              <div
                className={`text-2xl font-bold ${
                  isAir ? 'text-amber-300' : 'text-emerald-300'
                }`}
              >
                —
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ClienteView() {
  const [inp, setInp] = useState<ClienteInputs>(DEFAULT_INPUTS);
  const set = (k: keyof ClienteInputs) => (v: number) => setInp((prev) => ({ ...prev, [k]: v }));

  const computed = useMemo(() => {
    const ppc = Math.max(inp.piezasPorCaja, 1);
    const numCajas = inp.desiredQuantity > 0 ? Math.ceil(inp.desiredQuantity / ppc) : 0;
    const realQuantity = numCajas * ppc;

    const cbmPerCaja = (inp.lengthCm * inp.widthCm * inp.heightCm) / 1_000_000;
    const volWeightKgPerCaja = (inp.lengthCm * inp.widthCm * inp.heightCm) / 6_000;
    const totalCbm = cbmPerCaja * numCajas;
    const totalKg = inp.boxWeightKg * numCajas;
    const chargeableKgPerCaja = Math.max(inp.boxWeightKg, volWeightKgPerCaja);
    const totalChargeableKg = chargeableKgPerCaja * numCajas;

    const cat = getHSCategory(inp.hsCategoryId);
    const arancelRate = cat ? cat.arancelRate : 0;
    const ivaRate = cat ? cat.ivaRate : FALLBACK_IVA_RATE;
    const arancelPct = Math.round(arancelRate * 100);
    const ivaPct = Math.round(ivaRate * 100);

    const canCalc =
      inp.piezasPorCaja > 0 && realQuantity > 0 && inp.unitPriceUsd > 0;

    const exwTotal = inp.unitPriceUsd * realQuantity;
    const kuaiziMarginUsd = exwTotal * KUAIZI_MARGIN_RATE;
    const exwWithMargin = exwTotal + kuaiziMarginUsd;

    const airFreight = totalChargeableKg * inp.airCostPerKgUsd;
    const seaFreight = totalCbm * inp.seaCostPerCbmUsd;

    const airPending = inp.airCostPerKgUsd === 0;
    const seaPending = inp.seaCostPerCbmUsd === 0;

    return {
      numCajas,
      realQuantity,
      totalCbm,
      totalKg,
      totalChargeableKg,
      arancelPct,
      ivaPct,
      canCalc,
      exwTotal,
      kuaiziMarginUsd,
      airPending,
      seaPending,
      air: canCalc
        ? calcMode(exwWithMargin, airFreight, arancelRate, ivaRate, inp.trm, realQuantity)
        : null,
      sea: canCalc
        ? calcMode(exwWithMargin, seaFreight, arancelRate, ivaRate, inp.trm, realQuantity)
        : null,
    };
  }, [inp]);

  const {
    numCajas,
    realQuantity,
    totalCbm,
    totalKg,
    totalChargeableKg,
    arancelPct,
    ivaPct,
    canCalc,
    exwTotal,
    kuaiziMarginUsd,
    airPending,
    seaPending,
    air,
    sea,
  } = computed;

  const bothComplete = !airPending && !seaPending;
  const cheaperIs: 'air' | 'sea' | null =
    air && sea && bothComplete ? (air.perUnitUsd <= sea.perUnitUsd ? 'air' : 'sea') : null;

  const selectedCategory = getHSCategory(inp.hsCategoryId) ?? null;
  const showBoxSummary = numCajas > 0;
  const showResults = canCalc;

  return (
    <div className="space-y-5">
      {/* Section: Product */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 overflow-hidden">
        <h2 className="text-xs font-bold text-kuaizi-secondary uppercase tracking-widest mb-4">
          Datos del producto
        </h2>
        <div className="space-y-3">
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
              label="Unidades deseadas"
              value={inp.desiredQuantity}
              onChange={set('desiredQuantity')}
              suffix="uds"
              step={1}
              min={1}
            />
          </div>
        </div>
      </div>

      {/* Section: Box specs (from supplier) */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 overflow-hidden">
        <h2 className="text-xs font-bold text-kuaizi-secondary uppercase tracking-widest mb-1">
          Datos de la caja
        </h2>
        <p className="text-xs text-gray-400 mb-4">Información entregada por el proveedor</p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Piezas por caja"
              value={inp.piezasPorCaja}
              onChange={set('piezasPorCaja')}
              suffix="uds"
              step={1}
              min={1}
            />
            <NumberField
              label="Peso por caja"
              value={inp.boxWeightKg}
              onChange={set('boxWeightKg')}
              suffix="kg"
              step={0.1}
              min={0}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-kuaizi-ink block mb-1">
              Dimensiones de la caja{' '}
              <span className="text-xs font-normal text-gray-400">(cm)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <NumberField label="Largo" value={inp.lengthCm} onChange={set('lengthCm')} min={0} />
              <NumberField label="Ancho" value={inp.widthCm} onChange={set('widthCm')} min={0} />
              <NumberField label="Alto" value={inp.heightCm} onChange={set('heightCm')} min={0} />
            </div>
          </div>
        </div>
      </div>

      {/* Auto-calculated box summary */}
      {showBoxSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: '# Cajas', value: `${numCajas}` },
            { label: 'Cantidad real', value: `${realQuantity} uds` },
            { label: 'CBM total', value: `${totalCbm.toFixed(4)} m³` },
            { label: 'KG total', value: `${totalKg.toFixed(1)} kg` },
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

      {/* Section: Category + TRM */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 overflow-hidden">
        <h2 className="text-xs font-bold text-kuaizi-secondary uppercase tracking-widest mb-4">
          Impuestos y cambio
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-sm font-medium text-kuaizi-ink">Categoría de producto</label>
            <select
              value={inp.hsCategoryId}
              onChange={(e) => setInp((prev) => ({ ...prev, hsCategoryId: e.target.value }))}
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

      {/* Section: Freight rates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border-2 border-amber-300 bg-white shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">✈️</span>
            <span className="font-bold text-amber-700">Avión</span>
          </div>
          <NumberField
            label="Costo por kg"
            value={inp.airCostPerKgUsd}
            onChange={set('airCostPerKgUsd')}
            prefix="$"
            hint="USD/kg"
            step={0.01}
            min={0}
          />
          {totalChargeableKg > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Peso facturable: {totalChargeableKg.toFixed(2)} kg
            </p>
          )}
        </div>

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
          {totalCbm > 0 && (
            <p className="text-xs text-gray-400 mt-2">Volumen: {totalCbm.toFixed(4)} m³</p>
          )}
        </div>
      </div>

      {/* Rentabilidad module */}
      {showResults && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <h2 className="text-xs font-bold text-kuaizi-secondary uppercase tracking-widest mb-1">
            Rentabilidad
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            ¿A cuánto lo vendes en Colombia? Calculamos tu margen automáticamente.
          </p>
          <NumberField
            label="Precio de venta Colombia"
            value={inp.precioVentaCop}
            onChange={set('precioVentaCop')}
            suffix="COP / unidad"
            step={100}
            min={0}
          />
        </div>
      )}

      {/* Results */}
      {showResults && (air !== null || sea !== null) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {air !== null && (
            <ResultCard
              mode="air"
              result={air}
              exwUsd={exwTotal}
              kuaiziMarginUsd={kuaiziMarginUsd}
              arancelPct={arancelPct}
              ivaPct={ivaPct}
              isCheaper={cheaperIs === 'air'}
              bothPresent={bothComplete}
              isPending={airPending}
              precioVentaCop={inp.precioVentaCop}
            />
          )}
          {sea !== null && (
            <ResultCard
              mode="sea"
              result={sea}
              exwUsd={exwTotal}
              kuaiziMarginUsd={kuaiziMarginUsd}
              arancelPct={arancelPct}
              ivaPct={ivaPct}
              isCheaper={cheaperIs === 'sea'}
              bothPresent={bothComplete}
              isPending={seaPending}
              precioVentaCop={inp.precioVentaCop}
            />
          )}
        </div>
      )}
    </div>
  );
}
