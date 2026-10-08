import React from 'react';
import { Card } from '../ui/Card';

export interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  helper,
  icon,
  trend
}) => {
  return (
    <Card variant="glass" padding="md" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {label}
          </span>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.02em' }}>
            {value}
          </div>
        </div>

        {icon && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {(helper || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
          {trend && (
            <span
              style={{
                color: trend.isPositive ? 'var(--color-verified)' : 'var(--color-fake)',
                fontWeight: 700
              }}
            >
              {trend.value}
            </span>
          )}
          {helper && <span style={{ color: 'var(--text-tertiary)' }}>{helper}</span>}
        </div>
      )}
    </Card>
  );
};
