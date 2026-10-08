import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  hint,
  helperText,
  error,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const displayHint = helperText || hint;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {leftIcon && <span className="input-icon-left">{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={`input ${leftIcon ? 'input-with-icon-left' : ''} ${error ? 'has-error' : ''} ${className}`}
          aria-invalid={!!error}
          {...props}
        />
        {rightIcon && <span style={{ position: 'absolute', right: '0.875rem' }}>{rightIcon}</span>}
      </div>
      {displayHint && !error && <span className="form-hint">{displayHint}</span>}
      {error && <span className="form-error" role="alert">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
