import React from 'react';
import { FileQuestion } from 'lucide-react';
import { Button } from '../ui/Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
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
        padding: 'var(--space-10) var(--space-6)',
        backgroundColor: 'var(--bg-surface-secondary)',
        borderRadius: 'var(--radius-xl)',
        border: '1px dashed var(--border-medium)'
      }}
      className={className}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        {icon || <FileQuestion size={28} />}
      </div>

      <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
        {title}
      </h4>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)', marginBottom: actionText ? 'var(--space-4)' : 0, maxWidth: '360px', lineHeight: 1.5 }}>
        {description}
      </p>

      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
