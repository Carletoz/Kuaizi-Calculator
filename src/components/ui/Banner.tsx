import { useState } from 'react';

type BannerKind = 'warning' | 'error' | 'info';

interface BannerProps {
  kind?: BannerKind;
  message: string;
  dismissible?: boolean;
  className?: string;
}

const kindStyles: Record<BannerKind, string> = {
  warning: 'bg-amber-50 border-amber-300 text-amber-800',
  error: 'bg-red-50 border-red-300 text-red-800',
  info: 'bg-blue-50 border-blue-300 text-blue-800',
};

const kindIcons: Record<BannerKind, string> = {
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️',
};

export function Banner({ kind = 'warning', message, dismissible = false, className = '' }: BannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={`warning-banner flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${kindStyles[kind]} ${className}`}
      role="alert"
    >
      <span className="flex-shrink-0">{kindIcons[kind]}</span>
      <span className="flex-1">{message}</span>
      {dismissible && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-current opacity-60 hover:opacity-100"
          aria-label="Cerrar"
        >
          ×
        </button>
      )}
    </div>
  );
}
