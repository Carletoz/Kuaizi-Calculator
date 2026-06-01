import { useCallback, useRef, useState } from 'react';
import { analyzeProductImage, ScanResult } from '@/lib/scan/openai-vision';

export type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

export function useProductScan(onScanResult: (result: ScanResult) => void) {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const trigger = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setStatus('scanning');
      setError(null);

      try {
        const base64 = await readFileAsBase64(file);
        const result = await analyzeProductImage(base64, file.type || 'image/jpeg');

        onScanResult(result);

        setStatus('success');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al analizar la imagen');
        setStatus('error');
      }
    },
    [onScanResult],
  );

  return { status, error, fileInputRef, trigger, handleFile };
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
