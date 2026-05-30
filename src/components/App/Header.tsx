import kuaiziLogo from '@/assets/kuaizi-logo.svg';
import { useCalculator } from '@/state/context';
import type { Mode } from '@/types/inputs';

export function Header() {
  const { state, dispatch } = useCalculator();
  const currentMode = state.mode;

  function handleModeClick(mode: Mode) {
    if (mode !== currentMode) {
      dispatch({ type: 'SET_MODE', payload: mode });
    }
  }

  return (
    <header className="app-header no-print bg-kuaizi-secondary shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-4">
        <img src={kuaiziLogo} alt="Kuaizi Group" className="h-10 w-auto" />
        <div className="flex-1">
          <h1 className="text-base font-bold text-white leading-tight">
            Calculadora de Costo de Importación
          </h1>
          <p className="text-xs text-kuaizi-light/70">China → Colombia · Kuaizi Group</p>
        </div>

        {/* Mode toggle — pill/tab style */}
        <div className="flex items-center rounded-full bg-kuaizi-secondary/40 border border-white/20 p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => handleModeClick('completo')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 ${
              currentMode === 'completo'
                ? 'bg-white text-kuaizi-secondary shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Completo
          </button>
          <button
            type="button"
            onClick={() => handleModeClick('kuaizi')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 ${
              currentMode === 'kuaizi'
                ? 'bg-kuaizi-primary text-white shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Kuaizi
          </button>
        </div>
      </div>
    </header>
  );
}
