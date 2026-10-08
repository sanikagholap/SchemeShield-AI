import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  variant?: 'standard' | 'wide' | 'narrow';
  className?: string;
  style?: React.CSSProperties;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  variant = 'standard',
  className = '',
  style
}) => {
  const maxWidthMap = {
    standard: 'var(--container-max-w)',
    wide: 'var(--container-wide-w)',
    narrow: '860px'
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: maxWidthMap[variant],
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 'var(--space-4)',
        paddingRight: 'var(--space-4)',
        ...style
      }}
      className={`page-container ${className}`}
    >
      {children}
    </div>
  );
};
