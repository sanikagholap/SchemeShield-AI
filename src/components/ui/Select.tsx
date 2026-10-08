import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  hint?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  hint,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}
      <div className="input-wrapper" style={{ position: 'relative' }}>
        <select
          ref={ref}
          id={selectId}
          className={`select ${error ? 'has-error' : ''} ${className}`}
          style={{ appearance: 'none', paddingRight: '2.5rem' }}
          aria-invalid={!!error}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <span
          style={{
            position: 'absolute',
            right: '0.875rem',
            pointerEvents: 'none',
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ChevronDown size={16} />
        </span>
      </div>
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error" role="alert">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';
