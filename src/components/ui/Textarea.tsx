import React, { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  showCount?: boolean;
  currentCount?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  hint,
  error,
  showCount,
  currentCount,
  maxLength,
  className = '',
  id,
  ...props
}, ref) => {
  const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {label && (
          <label htmlFor={textareaId} className="form-label">
            {label}
          </label>
        )}
        {showCount && maxLength && (
          <span className="form-hint" style={{ fontSize: '0.75rem' }}>
            {currentCount ?? 0} / {maxLength}
          </span>
        )}
      </div>
      <textarea
        ref={ref}
        id={textareaId}
        maxLength={maxLength}
        className={`textarea ${error ? 'has-error' : ''} ${className}`}
        aria-invalid={!!error}
        {...props}
      />
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error" role="alert">{error}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
