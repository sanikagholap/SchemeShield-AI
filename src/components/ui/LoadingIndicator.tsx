import React from 'react';
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';

export interface LoadingIndicatorProps {
  type?: 'spinner' | 'skeleton' | 'radar';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  type = 'spinner',
  size = 'md',
  label,
  className = ''
}) => {
  const pixelSize = size === 'sm' ? 16 : size === 'lg' ? 36 : 24;

  if (type === 'skeleton') {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: size === 'sm' ? '16px' : size === 'lg' ? '48px' : '28px',
          backgroundColor: 'var(--bg-surface-secondary)',
          borderRadius: 'var(--radius-md)',
          animation: 'pulseGlow 1.5s ease-in-out infinite'
        }}
      />
    );
  }

  if (type === 'radar') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-8)'
        }}
        className={className}
      >
        <div style={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid var(--color-primary)',
              opacity: 0.2,
              animation: 'pulseGlow 2s infinite'
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: -8,
              borderRadius: '50%',
              border: '1px dashed var(--color-brand-accent)',
              animation: 'spin 6s linear infinite'
            }}
          />
          <ShieldCheck size={32} color="var(--color-primary)" />
        </div>
        {label && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
            <Sparkles size={14} color="var(--color-brand-accent)" />
            <span>{label}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
      className={className}
    >
      <Loader2 size={pixelSize} className="animate-spin" color="var(--color-primary)" />
      {label && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{label}</span>}
    </div>
  );
};
