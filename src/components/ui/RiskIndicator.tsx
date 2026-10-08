import React from 'react';
import { ShieldCheck, ShieldAlert, AlertOctagon } from 'lucide-react';
import { RiskTier } from '../../types/verification';

export interface RiskIndicatorProps {
  score: number; // 0 to 100
  tier?: RiskTier;
  confidenceScore?: number; // 0 to 100
  showDetails?: boolean;
  size?: 'compact' | 'normal' | 'large';
  className?: string;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  score,
  tier,
  confidenceScore,
  showDetails = true,
  size = 'normal',
  className = ''
}) => {
  const safeScore = Math.min(100, Math.max(0, score));

  // Auto-calculate tier if not provided
  const computedTier: RiskTier = tier || (
    safeScore <= 25 ? 'LOW' :
    safeScore <= 60 ? 'MODERATE' :
    safeScore <= 80 ? 'HIGH' : 'CRITICAL'
  );

  const tierStyles = {
    LOW: {
      color: 'var(--color-verified)',
      bg: 'var(--color-verified-bg)',
      border: 'var(--color-verified-border)',
      badgeClass: 'badge-verified',
      icon: <ShieldCheck size={size === 'large' ? 32 : 20} />,
      label: 'Low Risk / Authentic',
      barClass: 'risk-meter-fill-low',
      summary: 'High correlation with official gazettes. No suspicious demands found.'
    },
    MODERATE: {
      color: 'var(--color-suspicious)',
      bg: 'var(--color-suspicious-bg)',
      border: 'var(--color-suspicious-border)',
      badgeClass: 'badge-suspicious',
      icon: <ShieldAlert size={size === 'large' ? 32 : 20} />,
      label: 'Moderate Risk / Caution',
      barClass: 'risk-meter-fill-medium',
      summary: 'Partial discrepancies or unofficial wording detected. Manual caution advised.'
    },
    HIGH: {
      color: '#ea580c',
      bg: '#fff7ed',
      border: '#ffedd5',
      badgeClass: 'badge-suspicious',
      icon: <ShieldAlert size={size === 'large' ? 32 : 20} />,
      label: 'High Risk / Unverified',
      barClass: 'risk-meter-fill-high',
      summary: 'Likely misleading or altered scheme details. Does not match official criteria.'
    },
    CRITICAL: {
      color: 'var(--color-fake)',
      bg: 'var(--color-fake-bg)',
      border: 'var(--color-fake-border)',
      badgeClass: 'badge-fake',
      icon: <AlertOctagon size={size === 'large' ? 32 : 20} />,
      label: 'Critical Risk / Fraudulent',
      barClass: 'risk-meter-fill-high',
      summary: 'Confirmed scam characteristics: unauthorized fee demand, fake domains, or impersonation.'
    }
  }[computedTier];

  if (size === 'compact') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }} className={className}>
        <span className={`badge ${tierStyles.badgeClass}`}>
          {tierStyles.label}: {safeScore}/100
        </span>
      </div>
    );
  }

  return (
    <div
      className={`card ${className}`}
      style={{
        padding: 'var(--space-5)',
        backgroundColor: 'var(--bg-surface)',
        border: `1px solid ${tierStyles.border}`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: size === 'large' ? 56 : 44,
              height: size === 'large' ? 56 : 44,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: tierStyles.bg,
              color: tierStyles.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {tierStyles.icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>
                Risk Assessment
              </span>
              <span className={`badge ${tierStyles.badgeClass}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                {computedTier}
              </span>
            </div>
            <div style={{ fontSize: size === 'large' ? 'var(--text-2xl)' : 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {tierStyles.label}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: size === 'large' ? 'var(--text-3xl)' : 'var(--text-2xl)', fontWeight: 800, color: tierStyles.color, fontFamily: 'var(--font-heading)' }}>
            {safeScore}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 500 }}>/100</span>
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            Threat Index
          </span>
        </div>
      </div>

      {/* Visual meter bar */}
      <div style={{ marginTop: 'var(--space-4)' }} className="risk-meter">
        <div className="risk-meter-bar">
          <div
            className={`risk-meter-fill ${tierStyles.barClass}`}
            style={{ width: `${safeScore}%` }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
          <span>0 (Safe)</span>
          <span>50 (Moderate)</span>
          <span>100 (Blatant Scam)</span>
        </div>
      </div>

      {showDetails && (
        <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0, maxWidth: '80%' }}>
            {tierStyles.summary}
          </p>
          {confidenceScore !== undefined && (
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              AI Confidence: <span style={{ color: 'var(--color-primary)' }}>{confidenceScore}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
