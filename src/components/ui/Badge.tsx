import React, { HTMLAttributes } from 'react';

export type BadgeVariant = 'verified' | 'suspicious' | 'fake' | 'info' | 'neutral';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  hasDot?: boolean;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  hasDot = false,
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const classes = [
    'badge',
    `badge-${variant}`,
    size === 'sm' ? 'badge-sm' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {hasDot && <span className={`badge-dot badge-dot-${variant}`} />}
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
