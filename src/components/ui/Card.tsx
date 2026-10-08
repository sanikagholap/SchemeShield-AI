import React, { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}, ref) => {
  const paddingMap = {
    none: '0',
    sm: 'var(--space-4)',
    md: 'var(--space-6)',
    lg: 'var(--space-8)'
  };

  const classes = [
    'card',
    variant === 'glass' ? 'card-glass' : '',
    variant === 'interactive' ? 'card-interactive' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      style={{ padding: padding !== 'none' ? paddingMap[padding] : undefined }}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`card-header ${className}`} style={{ padding: 0, marginBottom: 'var(--space-4)' }} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
  <h3 className={className} style={{ fontSize: 'var(--text-xl)', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({ children, className = '', ...props }) => (
  <p className={className} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)', marginBottom: 0 }} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`card-content ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`card-footer ${className}`} style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)' }} {...props}>
    {children}
  </div>
);
