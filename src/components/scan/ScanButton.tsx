import { useProductScan } from '@/hooks/useProductScan';
import type { ScanResult } from '@/lib/scan/openai-vision';

interface ScanButtonProps {
  onScanResult: (result: ScanResult) => void;
}

export function ScanButton({ onScanResult }: ScanButtonProps) {
  const { status, error, handleFile } = useProductScan(onScanResult);
  const isScanning = status === 'scanning';

  return (
    <div className="mb-2">
      <label
        className={`w-full flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-kuaizi-accent/60 py-3 text-sm font-medium text-kuaizi-accent hover:bg-kuaizi-accent/5 transition-colors cursor-pointer ${isScanning ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={isScanning}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />
        {isScanning ? 'Analizando imagen...' : 'Escanear producto con cámara'}
      </label>
      {status === 'success' && (
        <p className="mt-2 text-xs text-green-600 font-medium">
          Producto detectado — revisá los campos completados abajo
        </p>
      )}
      {status === 'error' && error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
