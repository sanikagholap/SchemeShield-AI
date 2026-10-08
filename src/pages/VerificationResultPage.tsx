import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Share2,
  FileText,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { RiskIndicator } from '../components/ui/RiskIndicator';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { PageContainer } from '../components/ui/PageContainer';
import { MOCK_VERIFICATION_SAMPLE } from '../data/mockSchemes';
import { VerificationResult } from '../types/verification';

export const VerificationResultPage: React.FC = () => {
  const location = useLocation();
  const result: VerificationResult = location.state?.result || MOCK_VERIFICATION_SAMPLE;

  return (
    <PageContainer style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      {/* Top Banner / Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link to="/verify" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RotateCcw size={13} />
            <span>New Verification</span>
          </Link>
          <span style={{ color: 'var(--border-medium)' }}>/</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Report #{result.id}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Button variant="outline" size="sm" leftIcon={<Share2 size={14} />} onClick={() => alert('Verification Report link copied to clipboard!')}>
            Share Verdict
          </Button>
          <Link to="/assistant">
            <Button variant="ghost" size="sm" leftIcon={<Sparkles size={14} />}>
              Ask Assistant
            </Button>
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)', alignItems: 'flex-start' }}>
        {/* Left Column: Risk Index & Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Main Risk Indicator Card */}
          <RiskIndicator
            score={result.riskScore}
            tier={result.riskTier}
            confidenceScore={result.confidenceScore}
            size="large"
          />

          {/* Quick Verdict Card */}
          <Card variant="glass" padding="md">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Algorithmic Verdict
              </span>
              <StatusIndicator status={result.status} />
            </div>
            <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              {result.detectedSchemeName}
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {result.summary}
            </p>
          </Card>

          {/* Official Matched Repository Card */}
          {result.officialSchemeMatched && (
            <Card variant="default" padding="md" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                Legitimate Reference Scheme
              </span>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {result.officialSchemeMatched.name}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {result.officialSchemeMatched.ministry}
              </div>
              <div style={{ marginTop: 'var(--space-3)' }}>
                <a
                  href={result.officialSchemeMatched.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', fontWeight: 600 }}
                >
                  <span>Visit Official Portal ({result.officialSchemeMatched.officialUrl})</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </Card>
          )}

          {/* Action guidance */}
          <Card variant="default" padding="md" style={{ backgroundColor: 'var(--bg-surface-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
              <ShieldAlert size={18} color="var(--color-fake)" />
              <span>Recommended Citizen Action</span>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {result.recommendation}
            </p>
            <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
              <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <Button variant="danger" size="sm" rightIcon={<ExternalLink size={12} />}>
                  Report to Cybercrime Portal
                </Button>
              </a>
            </div>
          </Card>
        </div>

        {/* Right Column: Detailed Discrepancies & Gazette Evidence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Detected Discrepancy Flags */}
          <Card variant="default" padding="md">
            <CardHeader>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <CardTitle style={{ fontSize: 'var(--text-lg)' }}>
                  Detected Discrepancies ({result.detectedFlags.length})
                </CardTitle>
                <Badge variant={result.riskScore > 60 ? 'fake' : 'verified'} size="sm">
                  {result.riskScore > 60 ? 'Manipulations Found' : 'Clean'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {result.detectedFlags.map((flag) => (
                  <div
                    key={flag.id}
                    style={{
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: flag.severity === 'CRITICAL' ? 'var(--color-fake-bg)' : 'var(--bg-surface-secondary)',
                      border: `1px solid ${flag.severity === 'CRITICAL' ? 'var(--color-fake-border)' : 'var(--border-subtle)'}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: flag.severity === 'CRITICAL' ? 'var(--color-fake-text)' : 'var(--text-primary)' }}>
                        {flag.title}
                      </span>
                      <Badge variant={flag.severity === 'CRITICAL' ? 'fake' : 'suspicious'} size="sm">
                        {flag.severity}
                      </Badge>
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      {flag.description}
                    </p>
                    <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      Detected: "{flag.detectedPattern}"
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Genuine vs Altered Comparison */}
          {result.duplicateComparison && (
            <Card variant="glass" padding="md">
              <CardTitle style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>
                Original vs Claim Comparison
              </CardTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.duplicateComparison.alteredDetails.map((detail, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-primary)',
                      borderLeft: '3px solid var(--color-suspicious)'
                    }}
                  >
                    {detail}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Evidence Sources & Citations */}
          <Card variant="default" padding="md">
            <CardTitle style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>
              Cross-Referenced Gazette & Official Evidence
            </CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {result.evidenceSources.map((ev, i) => (
                <div
                  key={i}
                  style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--bg-surface-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {ev.title}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-verified)' }}>
                      {ev.matchScore}% Match
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    "{ev.snippet}"
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
