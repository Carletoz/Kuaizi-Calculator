import type { FreightMode } from '@/types/domain';

interface FreightModeSelectorProps {
  value: FreightMode;
  onChange: (mode: FreightMode) => void;
}

const MODES: { value: FreightMode; label: string; icon: string }[] = [
  { value: 'SEA_FCL', label: 'FCL (Contenedor)', icon: '🚢' },
  { value: 'SEA_LCL', label: 'LCL (Consolidado)', icon: '📦' },
  { value: 'AIR', label: 'Aéreo', icon: '✈️' },
  { value: 'EXPRESS', label: 'Courier', icon: '⚡' },
];

export function FreightModeSelector({ value, onChange }: FreightModeSelectorProps) {
  return (
    <div className="freight-mode-selector">
      <label className="text-sm font-medium text-kuaizi-ink block mb-2">Modalidad de flete</label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            className={`
              flex flex-col items-center gap-1 rounded-md border-2 px-3 py-2 text-sm font-medium transition-colors
              ${
                value === mode.value
                  ? 'border-kuaizi-accent bg-kuaizi-accent/10 text-kuaizi-accent'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-kuaizi-accent/50'
              }
            `}
          >
            <span className="text-lg">{mode.icon}</span>
            <span className="text-xs text-center">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
