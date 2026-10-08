import React from 'react';

export interface SectionHeadingProps {
  badge?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  title,
  description,
  align = 'center',
  action,
  className = ''
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        textAlign: align === 'center' ? 'center' : 'left',
        marginBottom: 'var(--space-10)',
        maxWidth: align === 'center' ? '760px' : '100%',
        marginLeft: align === 'center' ? 'auto' : undefined,
        marginRight: align === 'center' ? 'auto' : undefined
      }}
      className={className}
    >
      {badge && (
        <span
          className="badge badge-info"
          style={{
            marginBottom: 'var(--space-3)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontSize: '11px',
            padding: '4px 10px'
          }}
        >
          {badge}
        </span>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.35rem)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {title}
          </h2>
          {description && (
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', marginTop: 'var(--space-3)', maxWidth: '640px' }}>
              {description}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
};
