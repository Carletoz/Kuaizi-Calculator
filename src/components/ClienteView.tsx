import { useState, useMemo } from 'react';
import { NumberField } from '@/components/ui/NumberField';

const IVA_RATE = 0.19;
const INSURANCE_RATE = 0.0035;

interface ClienteInputs {
  unitPriceUsd: number;
  quantity: number;
  unitWeightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  airRatePerKgUsd: number;
  seaRatePerCbmUsd: number;
  arancelPct: number;
  trm: number;
}

interface ModeResult {
  freightUsd: number;
  insuranceUsd: number;
  cifUsd: number;
  arancelUsd: number;
  ivaUsd: number;
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
  airRatePerKgUsd: 0,
  seaRatePerCbmUsd: 0,
  arancelPct: 10,
  trm: 0,
};

function calcMode(
  exwTotal: number,
  freightUsd: number,
  arancelRate: number,
  trm: number,
  quantity: number
): ModeResult {
  const insuranceUsd = (exwTotal + freightUsd) * INSURANCE_RATE;
  const cifUsd = exwTotal + freightUsd + insuranceUsd;
  const arancelUsd = cifUsd * arancelRate;
  const ivaUsd = (cifUsd + arancelUsd) * IVA_RATE;
  const totalUsd = cifUsd + arancelUsd + ivaUsd;
  const perUnitUsd = totalUsd / quantity;
  const perUnitCop = trm > 0 ? perUnitUsd * trm : 0;
  return { freightUsd, insuranceUsd, cifUsd, arancelUsd, ivaUsd, totalUsd, perUnitUsd, perUnitCop };
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
  isCheaper: boolean;
  bothPresent: boolean;
}

function ResultCard({ mode, result, exwUsd, arancelPct, isCheaper, bothPresent }: ResultCardProps) {
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
        <ResultRow label="Flete" value={fmtUSD(result.freightUsd)} />
        <ResultRow label="Seguro (0.35%)" value={fmtUSD(result.insuranceUsd)} />

        <div className="border-t border-gray-100 pt-1.5">
          <ResultRow label="CIF" value={fmtUSD(result.cifUsd)} bold />
        </div>

        <ResultRow label={`Arancel (${arancelPct}%)`} value={fmtUSD(result.arancelUsd)} />
        <ResultRow label="IVA (19%)" value={fmtUSD(result.ivaUsd)} />

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
    <div className={`flex justify-between text-sm ${bold ? 'font-semibold' : ''}`}>
      <span className="text-gray-500">{label}</span>
      <span className="text-kuaizi-ink">{value}</span>
    </div>
  );
}

export function ClienteView() {
  const [inp, setInp] = useState<ClienteInputs>(DEFAULT_INPUTS);
  const set = (k: keyof ClienteInputs) => (v: number) => setInp((prev) => ({ ...prev, [k]: v }));

  const { air, sea, volWeightKg, chargeableKg, cbm } = useMemo(() => {
    const cbmPerUnit = (inp.lengthCm * inp.widthCm * inp.heightCm) / 1_000_000;
    const volWeightKgPerUnit = (inp.lengthCm * inp.widthCm * inp.heightCm) / 6000;
    const chargeableKg = Math.max(inp.unitWeightKg, volWeightKgPerUnit);
    const totalCbm = cbmPerUnit * Math.max(inp.quantity, 1);
    const arancelRate = inp.arancelPct / 100;
    const exwTotal = inp.unitPriceUsd * inp.quantity;
    const canCalc = inp.quantity > 0 && inp.unitPriceUsd > 0;

    return {
      air:
        canCalc && inp.airRatePerKgUsd > 0
          ? calcMode(
              exwTotal,
              chargeableKg * inp.quantity * inp.airRatePerKgUsd,
              arancelRate,
              inp.trm,
              inp.quantity
            )
          : null,
      sea:
        canCalc && inp.seaRatePerCbmUsd > 0
          ? calcMode(
              exwTotal,
              totalCbm * inp.seaRatePerCbmUsd,
              arancelRate,
              inp.trm,
              inp.quantity
            )
          : null,
      volWeightKg: volWeightKgPerUnit,
      chargeableKg,
      cbm: totalCbm,
    };
  }, [inp]);

  const cheaperIs: 'air' | 'sea' | null =
    air && sea ? (air.perUnitUsd <= sea.perUnitUsd ? 'air' : 'sea') : null;

  const showDims =
    inp.lengthCm > 0 || inp.widthCm > 0 || inp.heightCm > 0 || inp.unitWeightKg > 0;

  const exwUsd = inp.unitPriceUsd * inp.quantity;

  return (
    <div className="space-y-5">
      {/* Product inputs */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
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
            <NumberField
              label="Arancel"
              value={inp.arancelPct}
              onChange={set('arancelPct')}
              suffix="%"
              step={0.5}
              min={0}
            />
            <NumberField
              label="TRM"
              value={inp.trm}
              onChange={set('trm')}
              suffix="COP/USD"
              step={1}
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Freight rate inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border-2 border-amber-300 bg-white shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">✈️</span>
            <span className="font-bold text-amber-700">Avión</span>
          </div>
          <NumberField
            label="Tarifa de flete"
            value={inp.airRatePerKgUsd}
            onChange={set('airRatePerKgUsd')}
            prefix="$"
            hint="USD/kg"
            step={0.01}
            min={0}
          />
        </div>

        <div className="rounded-xl border-2 border-emerald-300 bg-white shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🚢</span>
            <span className="font-bold text-emerald-700">Barco</span>
          </div>
          <NumberField
            label="Tarifa de flete"
            value={inp.seaRatePerCbmUsd}
            onChange={set('seaRatePerCbmUsd')}
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
            { label: 'Peso cobrable\n(aire)', value: `${chargeableKg.toFixed(3)} kg` },
            { label: 'Volumen', value: `${cbm.toFixed(4)} m³` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-center"
            >
              <div className="text-xs text-gray-400 uppercase tracking-wide leading-tight mb-1 whitespace-pre-line">
                {label}
              </div>
              <div className="text-sm font-semibold text-kuaizi-ink">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Result comparison cards */}
      {(air || sea) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {air && (
            <ResultCard
              mode="air"
              result={air}
              exwUsd={exwUsd}
              arancelPct={inp.arancelPct}
              isCheaper={cheaperIs === 'air'}
              bothPresent={!!(air && sea)}
            />
          )}
          {sea && (
            <ResultCard
              mode="sea"
              result={sea}
              exwUsd={exwUsd}
              arancelPct={inp.arancelPct}
              isCheaper={cheaperIs === 'sea'}
              bothPresent={!!(air && sea)}
            />
          )}
        </div>
      )}
    </div>
  );
}
