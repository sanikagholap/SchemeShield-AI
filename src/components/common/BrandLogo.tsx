import React from 'react';
import { Link } from 'react-router-dom';

export interface BrandLogoProps {
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  showTagline = false,
  size = 'md',
  asLink = true
}) => {
  const iconDimensions = {
    sm: 28,
    md: 36,
    lg: 44
  }[size];

  const titleSize = {
    sm: 'var(--text-base)',
    md: 'var(--text-xl)',
    lg: 'var(--text-2xl)'
  }[size];

  const logoContent = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)', userSelect: 'none' }}>
      {/* Custom Security Shield & AI Node SVG Icon */}
      <div
        style={{
          width: iconDimensions,
          height: iconDimensions,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none">
          <defs>
            <linearGradient id="logoShieldGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="60%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="logoGlow" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {/* Outer Shield with depth */}
          <path
            d="M24 4L8 10.5V22C8 32.8 14.8 42.2 24 44.5C33.2 42.2 40 32.8 40 22V10.5L24 4Z"
            fill="url(#logoShieldGrad)"
          />
          {/* Inner Tech Shield */}
          <path
            d="M24 8.5L12 13.5V22C12 30.2 17.1 37.6 24 39.5C30.9 37.6 36 30.2 36 22V13.5L24 8.5Z"
            fill="#0F172A"
            opacity="0.3"
          />
          {/* Neural nodes */}
          <circle cx="24" cy="18" r="2.5" fill="#38BDF8" />
          <circle cx="17" cy="27" r="2" fill="#10B981" />
          <circle cx="31" cy="27" r="2" fill="#10B981" />
          <path d="M24 18L17 27M24 18L31 27M17 27H31" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          {/* Shield Verified Checkmark */}
          <path d="M20 28.5L23.5 32L28.5 25.5" stroke="#FFFFFF" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: titleSize,
              letterSpacing: '-0.03em',
              color: 'var(--color-brand-navy)'
            }}
          >
            SchemeShield
          </span>
          <span
            style={{
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #bfdbfe',
              lineHeight: 1
            }}
          >
            AI
          </span>
        </div>
        {showTagline && (
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-tertiary)',
              fontWeight: 500,
              letterSpacing: '0.02em',
              marginTop: '1px'
            }}
          >
            Verify Before You Trust.
          </span>
        )}
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex' }}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};
