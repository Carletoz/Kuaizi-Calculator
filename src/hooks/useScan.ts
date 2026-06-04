import { useCallback, useState } from 'react';
import type { ScanStatus } from '@/state/session/types';
import { scanSupplier, scanProduct } from '@/lib/scan/n8n';
import type { SupplierScanResult, ProductScanResult } from '@/lib/scan/n8n';

export interface UseScanReturn<T> {
  status: ScanStatus;
  result: T | null;
  error: string | null;
  trigger: (file: File) => void;
  reset: () => void;
}

export function useScan<T>(scanFn: (file: File) => Promise<T>): UseScanReturn<T> {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const trigger = useCallback(
    (file: File) => {
      setStatus('scanning');
      setResult(null);
      setError(null);

      scanFn(file)
        .then((data) => {
          setResult(data);
          setStatus('success');
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : 'Scan failed');
          setStatus('error');
        });
    },
    [scanFn],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, trigger, reset };
}

// v3 wrappers — distinct from the v2 hook at src/hooks/useProductScan.ts
export const useSupplierScan = (): UseScanReturn<SupplierScanResult> => useScan(scanSupplier);
export const useProductScan = (): UseScanReturn<ProductScanResult> => useScan(scanProduct);
