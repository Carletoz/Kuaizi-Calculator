import kuaiziLogo from '@/assets/logo-kuaizi-group-1024x403.webp';

export function Header() {
  return (
    <header className="app-header no-print bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
        <img src={kuaiziLogo} alt="Kuaizi Group" className="h-10 w-auto" />
        <div>
          <h1 className="text-base font-bold text-kuaizi-secondary leading-tight">
            Calculadora de Costo de Importación
          </h1>
          <p className="text-xs text-gray-400">China → Colombia · Kuaizi Group</p>
        </div>
      </div>
    </header>
  );
}
