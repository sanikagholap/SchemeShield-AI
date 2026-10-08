import React from 'react';

export interface ProgressIndicatorProps {
  value: number; // 0 to 100
  label?: string;
  showValue?: boolean;
  color?: 'primary' | 'verified' | 'suspicious' | 'fake';
  height?: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  label,
  showValue = true,
  color = 'primary',
  height = 8,
  className = ''
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const colorMap = {
    primary: 'var(--color-primary)',
    verified: 'var(--color-verified)',
    suspicious: 'var(--color-suspicious)',
    fake: 'var(--color-fake)'
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }} className={className}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
          {label && <span style={{ color: 'var(--text-secondary)' }}>{label}</span>}
          {showValue && <span style={{ color: 'var(--text-primary)' }}>{clampedValue}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: 'var(--bg-surface-secondary)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${clampedValue}%`,
            height: '100%',
            backgroundColor: colorMap[color],
            borderRadius: 'var(--radius-full)',
            transition: 'width var(--transition-smooth)'
          }}
        />
      </div>
    </div>
  );
};
