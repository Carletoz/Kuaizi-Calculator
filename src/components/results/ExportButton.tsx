export function ExportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="export-button no-print w-full rounded-md bg-kuaizi-secondary px-4 py-2 text-sm font-medium text-white hover:bg-kuaizi-secondary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-kuaizi-accent focus:ring-offset-2 print:hidden"
    >
      Imprimir / Exportar PDF
    </button>
  );
}
