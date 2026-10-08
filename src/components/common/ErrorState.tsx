import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something Went Wrong',
  message = 'An unexpected verification error occurred. Please check your query or retry.',
  onRetry,
  className = ''
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-8) var(--space-6)',
        backgroundColor: 'var(--color-fake-bg)',
        border: '1px solid var(--color-fake-border)',
        borderRadius: 'var(--radius-xl)'
      }}
      className={className}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-lg)',
          backgroundColor: '#ffffff',
          color: 'var(--color-fake)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-3)'
        }}
      >
        <AlertCircle size={24} />
      </div>

      <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-fake-text)', margin: 0 }}>
        {title}
      </h4>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-fake-text)', marginTop: '4px', marginBottom: onRetry ? 'var(--space-4)' : 0, maxWidth: '380px', lineHeight: 1.5 }}>
        {message}
      </p>

      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} leftIcon={<RotateCcw size={14} />}>
          Try Again
        </Button>
      )}
    </div>
  );
};
