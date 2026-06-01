import kuaiziLogo from '@/assets/logo-kuaizi-group-1024x403.webp';
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
    <header className="app-header no-print bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-4">
        <img src={kuaiziLogo} alt="Kuaizi Group" className="h-10 w-auto" />
        <div className="flex-1">
          <h1 className="text-base font-bold text-kuaizi-secondary leading-tight">
            Calculadora de Costo de Importación
          </h1>
          <p className="text-xs text-gray-400">China → Colombia · Kuaizi Group</p>
        </div>

        {/* Mode toggle — pill/tab style */}
        <div className="flex items-center rounded-full bg-gray-100 border border-gray-200 p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => handleModeClick('cliente')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-kuaizi-secondary/30 ${
              currentMode === 'cliente'
                ? 'bg-kuaizi-secondary text-white shadow-sm'
                : 'text-gray-500 hover:text-kuaizi-secondary'
            }`}
          >
            Cliente
          </button>
          <button
            type="button"
            onClick={() => handleModeClick('kuaizi')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-kuaizi-primary/30 ${
              currentMode === 'kuaizi'
                ? 'bg-kuaizi-primary text-white shadow-sm'
                : 'text-gray-500 hover:text-kuaizi-primary'
            }`}
          >
            Kuaizi
          </button>
        </div>
      </div>
    </header>
  );
}
