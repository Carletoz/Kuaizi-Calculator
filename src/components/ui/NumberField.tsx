import React, { useState, useEffect } from 'react';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  hint?: string;
  readOnly?: boolean;
}

export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  placeholder = '0',
  min: _min,
  max: _max,
  step: _step,
  className = '',
  hint,
  readOnly = false,
}: NumberFieldProps) {
  const [text, setText] = useState(value === 0 ? '' : String(value));

  // Sync display when parent resets value externally (e.g. DEFAULT_INPUTS)
  useEffect(() => {
    const normalized = text.replace(',', '.');
    const parsed = normalized === '' ? 0 : parseFloat(normalized);
    if ((isNaN(parsed) ? 0 : parsed) !== value) {
      setText(value === 0 ? '' : String(value));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setText(raw);
    const normalized = raw.replace(',', '.');
    const parsed = normalized === '' ? 0 : parseFloat(normalized);
    onChange(isNaN(parsed) ? 0 : parsed);
  };

  return (
    <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
      <label className="text-sm font-medium text-kuaizi-ink">
        {label}
        {hint && (
          <span className="ml-1 text-xs font-normal text-gray-500" title={hint}>
            {' '}({hint})
          </span>
        )}
      </label>
      <div className="flex items-center min-w-0 rounded-md border border-gray-300 bg-white focus-within:border-kuaizi-accent focus-within:ring-1 focus-within:ring-kuaizi-accent">
        {prefix && (
          <span className="px-2 text-sm text-gray-500 border-r border-gray-300 bg-gray-50 rounded-l-md py-2">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={text}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`
            flex-1 px-3 py-2 text-sm text-kuaizi-ink bg-transparent outline-none
            ${readOnly ? 'bg-gray-50 text-gray-600 cursor-default' : ''}
            ${!prefix ? 'rounded-l-md' : ''}
            ${!suffix ? 'rounded-r-md' : ''}
          `}
        />
        {suffix && (
          <span className="px-2 text-sm text-gray-500 border-l border-gray-300 bg-gray-50 rounded-r-md py-2">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
