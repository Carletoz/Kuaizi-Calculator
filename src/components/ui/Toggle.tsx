interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  className?: string;
}

export function Toggle({ label, checked, onChange, description, className = '' }: ToggleProps) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-kuaizi-accent focus:ring-offset-2
          ${checked ? 'bg-kuaizi-accent' : 'bg-gray-200'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
            transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-kuaizi-ink">{label}</span>
        {description && (
          <span className="text-xs text-gray-500 mt-0.5">{description}</span>
        )}
      </div>
    </div>
  );
}
