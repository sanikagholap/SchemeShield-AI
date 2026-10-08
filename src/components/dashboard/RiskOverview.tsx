import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';

export interface RiskOverviewProps {
  trustedCount?: number;
  suspiciousCount?: number;
  highRiskCount?: number;
  total?: number;
}

export const RiskOverview: React.FC<RiskOverviewProps> = ({
  trustedCount = 17,
  suspiciousCount = 4,
  highRiskCount = 3,
  total = 24
}) => {
  const safeTotal = total || 1;
  const trustedPercent = Math.round((trustedCount / safeTotal) * 100);
  const suspiciousPercent = Math.round((suspiciousCount / safeTotal) * 100);
  const highRiskPercent = 100 - trustedPercent - suspiciousPercent;

  return (
    <Card variant="default" padding="lg">
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <CardTitle style={{ fontSize: 'var(--text-lg)' }}>
              Risk Distribution Overview
            </CardTitle>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Proportion of evaluated claims across security risk categories
            </p>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            Mock Demonstration
          </span>
        </div>
      </CardHeader>

      {/* Visual Segmented Progress Bar */}
      <div style={{ margin: 'var(--space-4) 0' }}>
        <div
          role="progressbar"
          aria-label="Risk category distribution"
          style={{
            height: '14px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-surface-secondary)',
            gap: '2px'
          }}
        >
          {/* Trusted segment */}
          <div
            style={{
              width: `${trustedPercent}%`,
              backgroundColor: 'var(--color-verified)',
              transition: 'width 0.4s ease'
            }}
            title={`Trusted: ${trustedPercent}% (${trustedCount})`}
          />
          {/* Suspicious segment */}
          <div
            style={{
              width: `${suspiciousPercent}%`,
              backgroundColor: 'var(--color-suspicious)',
              transition: 'width 0.4s ease'
            }}
            title={`Suspicious: ${suspiciousPercent}% (${suspiciousCount})`}
          />
          {/* High risk segment */}
          <div
            style={{
              width: `${highRiskPercent}%`,
              backgroundColor: 'var(--color-fake)',
              transition: 'width 0.4s ease'
            }}
            title={`High Risk: ${highRiskPercent}% (${highRiskCount})`}
          />
        </div>
      </div>

      {/* Category Breakdown Metric Pills */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-4)'
        }}
      >
        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-verified-bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-verified-border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-verified-text)', fontSize: '11px', fontWeight: 700 }}>
            <ShieldCheck size={14} />
            <span>Trusted Schemes</span>
          </div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-verified-text)', marginTop: '4px' }}>
            {trustedCount} <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>({trustedPercent}%)</span>
          </div>
        </div>

        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-suspicious-bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-suspicious-border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-suspicious-text)', fontSize: '11px', fontWeight: 700 }}>
            <AlertTriangle size={14} />
            <span>Suspicious Claims</span>
          </div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-suspicious-text)', marginTop: '4px' }}>
            {suspiciousCount} <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>({suspiciousPercent}%)</span>
          </div>
        </div>

        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-fake-bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-fake-border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-fake-text)', fontSize: '11px', fontWeight: 700 }}>
            <ShieldAlert size={14} />
            <span>High Risk / Fraud</span>
          </div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-fake-text)', marginTop: '4px' }}>
            {highRiskCount} <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>({highRiskPercent}%)</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
        <Info size={13} />
        <span>Claims categorized using natural language pattern matching and Gazette cross-referencing.</span>
      </div>
    </Card>
  );
};
