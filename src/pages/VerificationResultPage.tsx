import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Shield,
  ExternalLink,
  Share2,
  AlertTriangle,
  RotateCcw,
  Download,
  Bookmark,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  Eye,
  AlertOctagon,
  Copy,
  Printer,
  X
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageContainer } from '../components/ui/PageContainer';
import { VerificationResult, SimilarScheme } from '../types/verification';
import {
  TRUSTED_MOCK_RESULT,
  SUSPICIOUS_MOCK_RESULT,
  HIGH_RISK_MOCK_RESULT,
  NEEDS_REVIEW_MOCK_RESULT
} from '../data/mockVerificationResults';

export const VerificationResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize from location state if passed, else default to HIGH_RISK or TRUSTED
  const initialResult: VerificationResult = location.state?.result || HIGH_RISK_MOCK_RESULT;
  const [activeResult, setActiveResult] = useState<VerificationResult>(initialResult);

  // Modal & Toast States
  const [selectedSimilarScheme, setSelectedSimilarScheme] = useState<SimilarScheme | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Status configuration helper
  const resolvedStatus =
    activeResult.overallStatus ||
    (activeResult.status === 'SAFE'
      ? 'TRUSTED'
      : activeResult.status === 'FAKE'
      ? 'HIGH RISK'
      : activeResult.status === 'SUSPICIOUS'
      ? 'SUSPICIOUS'
      : 'NEEDS REVIEW');

  const getStatusMeta = (status: string) => {
    switch (status) {
      case 'TRUSTED':
      case 'SAFE':
        return {
          label: 'TRUSTED',
          color: 'var(--color-verified)',
          bg: 'var(--color-verified-bg)',
          border: 'var(--color-verified-border)',
          icon: <ShieldCheck size={28} />,
          badgeClass: 'badge-verified',
          subtext: 'High correlation with verified government gazettes and zero warning signals.'
        };
      case 'SUSPICIOUS':
        return {
          label: 'SUSPICIOUS',
          color: 'var(--color-suspicious)',
          bg: 'var(--color-suspicious-bg)',
          border: 'var(--color-suspicious-border)',
          icon: <AlertTriangle size={28} />,
          badgeClass: 'badge-suspicious',
          subtext: 'Multiple discrepancies or unofficial intermediary channels detected.'
        };
      case 'HIGH RISK':
      case 'FAKE':
        return {
          label: 'HIGH RISK',
          color: 'var(--color-fake)',
          bg: 'var(--color-fake-bg)',
          border: 'var(--color-fake-border)',
          icon: <AlertOctagon size={28} />,
          badgeClass: 'badge-fake',
          subtext: 'Critical fraud signals detected. Do not pay money or share credentials.'
        };
      default:
        return {
          label: 'NEEDS REVIEW',
          color: 'var(--color-info-text)',
          bg: 'var(--color-info-bg)',
          border: 'var(--color-info-border)',
          icon: <HelpCircle size={28} />,
          badgeClass: 'badge-info',
          subtext: 'Regional or newly notified scheme. Requires local departmental cross-check.'
        };
    }
  };

  const statusMeta = getStatusMeta(resolvedStatus);

  // SVG Circular Gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Math.min(100, Math.max(0, activeResult.riskScore));
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  const scoreStrokeColor =
    safeScore <= 25
      ? 'var(--color-verified)'
      : safeScore <= 60
      ? 'var(--color-suspicious)'
      : 'var(--color-fake)';

  const schemeDisplayName = activeResult.schemeName || activeResult.detectedSchemeName || 'Verified Scheme';
  const analysisBreakdownList = activeResult.analysisBreakdown || [];
  const evidenceItemsList = activeResult.evidenceItems || [];
  const officialSourcesList = activeResult.officialSources || [];
  const similarSchemesList = activeResult.similarSchemes || [];
  const riskSignalsList = activeResult.riskSignals || [];

  return (
    <PageContainer style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--color-brand-navy)',
            color: 'var(--text-inverse)',
            padding: '12px 24px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 'var(--z-modal)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <CheckCircle2 size={16} color="var(--color-verified)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Quick Actions Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-6)',
          flexWrap: 'wrap',
          gap: 'var(--space-4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          <Link to="/dashboard" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/verify" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>
            Verify
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            Report #{activeResult.id}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw size={14} />}
            onClick={() => navigate('/verify')}
          >
            Verify Another Scheme
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Bookmark size={14} />}
            onClick={() => showToast('Result saved to your Verification History')}
          >
            Save Result
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Share2 size={14} />}
            onClick={() => setIsShareModalOpen(true)}
          >
            Share Result
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={() => setIsDownloadModalOpen(true)}
          >
            Download Report
          </Button>
        </div>
      </div>

      {/* Interactive Variant Switcher Bar for Evaluators & Citizens */}
      <Card
        variant="glass"
        padding="sm"
        style={{
          marginBottom: 'var(--space-6)',
          backgroundColor: 'var(--bg-surface-secondary)',
          border: '1px solid var(--border-medium)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>
              Inspect Result Variant:
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Toggle mock state to preview UI variations:
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Button
              type="button"
              variant={resolvedStatus === 'TRUSTED' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveResult(TRUSTED_MOCK_RESULT)}
              style={{ fontSize: '11px', height: '28px' }}
            >
              ✓ Trusted (14/100)
            </Button>
            <Button
              type="button"
              variant={resolvedStatus === 'SUSPICIOUS' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveResult(SUSPICIOUS_MOCK_RESULT)}
              style={{ fontSize: '11px', height: '28px' }}
            >
              ⚠ Suspicious (64/100)
            </Button>
            <Button
              type="button"
              variant={resolvedStatus === 'HIGH RISK' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveResult(HIGH_RISK_MOCK_RESULT)}
              style={{ fontSize: '11px', height: '28px' }}
            >
              🚨 High Risk (94/100)
            </Button>
            <Button
              type="button"
              variant={resolvedStatus === 'NEEDS REVIEW' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveResult(NEEDS_REVIEW_MOCK_RESULT)}
              style={{ fontSize: '11px', height: '28px' }}
            >
              🔍 Needs Review (42/100)
            </Button>
          </div>
        </div>
      </Card>

      {/* Mandatory Prototype Disclaimer Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-info-bg)',
          border: '1px solid var(--color-info-border)',
          color: 'var(--color-info-text)',
          marginBottom: 'var(--space-8)',
          fontSize: 'var(--text-xs)'
        }}
      >
        <Info size={16} style={{ flexShrink: 0 }} />
        <div>
          <strong>DEMO RESULT:</strong> Backend AI verification is not connected yet. This report demonstrates the SchemeShield AI verification interface using realistic centralized mock datasets.
        </div>
      </div>

      {/* Main Top Banner: Status + Scheme Title */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: `1px solid ${statusMeta.border}`,
          padding: 'var(--space-6) var(--space-8)',
          marginBottom: 'var(--space-8)',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '6px', backgroundColor: statusMeta.color }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>
                Verification Result
              </span>
              <span
                className={`badge ${statusMeta.badgeClass}`}
                style={{ fontSize: '12px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                {statusMeta.icon}
                <span>{statusMeta.label}</span>
              </span>
            </div>

            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-2)', lineHeight: 1.25 }}>
              {schemeDisplayName}
            </h1>

            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: '850px', lineHeight: 1.6, margin: 0 }}>
              {activeResult.summary}
            </p>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
              Analyzed {activeResult.verifiedAt}
            </span>
            <span className="badge" style={{ fontSize: '11px', backgroundColor: 'var(--bg-surface-secondary)' }}>
              Method: {activeResult.method || activeResult.verificationMethod || 'FORM'} Analysis
            </span>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns (Left: Score & Recommendation, Right: Analysis Checks) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(0, 2fr)', gap: 'var(--space-8)', alignItems: 'start', marginBottom: 'var(--space-10)' }}>
        {/* Left Column: Visual Circular Risk Score & Recommendation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Circular Risk Score Card */}
          <Card variant="default" padding="lg">
            <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
              Risk Assessment Index
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 'var(--space-4)' }}>
              {/* Circular Gauge */}
              <div style={{ position: 'relative', width: '130px', height: '130px', marginBottom: 'var(--space-3)' }}>
                <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background Track */}
                  <circle
                    cx="65"
                    cy="65"
                    r={radius}
                    fill="none"
                    stroke="var(--border-subtle)"
                    strokeWidth="10"
                  />
                  {/* Animated Progress Ring */}
                  <circle
                    cx="65"
                    cy="65"
                    r={radius}
                    fill="none"
                    stroke={scoreStrokeColor}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>

                {/* Number inside Ring */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {activeResult.riskScore}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                    / 100
                  </span>
                </div>
              </div>

              {/* Risk Level Badge */}
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: statusMeta.color, marginBottom: 'var(--space-1)' }}>
                {activeResult.riskDetails?.label || statusMeta.label}
              </div>

              {/* Explanatory Quote */}
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, maxWidth: '280px' }}>
                "Lower risk scores indicate fewer detected warning signals."
              </p>
            </div>

            {/* Confidence Metric */}
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 'var(--text-xs)'
              }}
            >
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                AI Model Confidence
              </span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: 'var(--text-sm)' }}>
                {activeResult.confidenceScore}%
              </span>
            </div>

            {/* Note on score */}
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 'var(--space-3)', textAlign: 'center' }}>
              Synthesized from 7 verification checks and source comparisons.
            </div>
          </Card>

          {/* Citizen Recommendation Card */}
          <Card
            variant="default"
            padding="md"
            style={{
              backgroundColor: statusMeta.bg,
              border: `1px solid ${statusMeta.border}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <Shield size={18} color={statusMeta.color} />
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Citizen Recommendation
              </h3>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
              {activeResult.recommendation}
            </p>
          </Card>

          {/* Matched Official Scheme If Any */}
          {activeResult.officialSchemeMatched && (
            <Card variant="glass" padding="md">
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>
                Matched Official Entity
              </span>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {activeResult.officialSchemeMatched.name}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {activeResult.officialSchemeMatched.ministry}
              </div>
              <div style={{ marginTop: 'var(--space-3)' }}>
                <a
                  href={activeResult.officialSchemeMatched.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <span>Visit Genuine Government Portal</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: 7 Analysis Breakdown Cards */}
        <div>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
              Analysis Breakdown
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
              Comprehensive evaluation across the 7 SchemeShield AI verification dimensions.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {analysisBreakdownList.map((check, index) => {
              const isPass = check.status === 'PASS';
              const isWarning = check.status === 'WARNING';
              const isFail = check.status === 'FAIL';

              const checkBadgeClass = isPass
                ? 'badge-verified'
                : isWarning
                ? 'badge-suspicious'
                : isFail
                ? 'badge-fake'
                : 'badge-info';

              const checkIcon = isPass ? (
                <CheckCircle2 size={16} color="var(--color-verified)" />
              ) : isWarning ? (
                <AlertTriangle size={16} color="var(--color-suspicious)" />
              ) : (
                <XCircle size={16} color="var(--color-fake)" />
              );

              return (
                <Card key={check.id} variant="default" padding="md">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <div style={{ flexShrink: 0 }}>{checkIcon}</div>
                      <div>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                          Check {index + 1} •{' '}
                        </span>
                        <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                          {check.title}
                        </strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
                      <span className={`badge ${checkBadgeClass}`} style={{ fontSize: '11px' }}>
                        {check.statusLabel}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                        {check.confidence}% conf.
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 var(--space-2) 0' }}>
                    {check.explanation}
                  </p>

                  {check.evidenceOrAction && (
                    <div
                      style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-app)',
                        fontSize: '11px',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span style={{ fontWeight: 700, color: 'var(--text-tertiary)' }}>Observation:</span>
                      <span>{check.evidenceOrAction}</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 8: EVIDENCE SECTION ("Why this result?") */}
      <div style={{ marginBottom: 'var(--space-10)' }}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
            Why this result?
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>
            Specific supporting evidence and signals detected by SchemeShield cross-referencing models.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {evidenceItemsList.map((item) => {
            const isCrit = item.severity === 'CRITICAL' || item.severity === 'HIGH';
            const isSafe = item.severity === 'SAFE';

            return (
              <Card
                key={item.id}
                variant="default"
                padding="md"
                style={{
                  borderLeft: `4px solid ${isSafe ? 'var(--color-verified)' : isCrit ? 'var(--color-fake)' : 'var(--color-suspicious)'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <span className="badge" style={{ fontSize: '10px', backgroundColor: 'var(--bg-app)', color: 'var(--text-tertiary)' }}>
                    {item.categoryLabel}
                  </span>
                  <span
                    className={`badge ${isSafe ? 'badge-verified' : isCrit ? 'badge-fake' : 'badge-suspicious'}`}
                    style={{ fontSize: '10px' }}
                  >
                    {item.severity}
                  </span>
                </div>

                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 var(--space-3) 0' }}>
                  {item.explanation}
                </p>

                {item.sourceOrReference && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Reference: <em>{item.sourceOrReference}</em>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Section 9: OFFICIAL SOURCE CHECK */}
      <div style={{ marginBottom: 'var(--space-10)' }}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Official Source Check
            </h2>
            <span className="badge badge-info" style={{ fontSize: '11px' }}>
              Reference Sources
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
            Live verification will be connected to backend APIs. These reference portals illustrate planned cross-checks.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
          {officialSourcesList.map((source) => (
            <Card key={source.id} variant="default" padding="md">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {source.name}
                </span>
                <span
                  className={`badge ${
                    source.status === 'MATCHED'
                      ? 'badge-verified'
                      : source.status === 'FLAGGED_ALERT'
                      ? 'badge-fake'
                      : source.status === 'UNDER_REVIEW'
                      ? 'badge-info'
                      : 'badge-suspicious'
                  }`}
                  style={{ fontSize: '10px' }}
                >
                  {source.statusLabel}
                </span>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                Domain: <code>{source.domain}</code>
              </div>

              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 var(--space-3) 0' }}>
                {source.details}
              </p>

              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                <span>Browse {source.domain}</span>
                <ExternalLink size={11} />
              </a>
            </Card>
          ))}
        </div>
      </div>

      {/* Section 10: SIMILAR SCHEMES DETECTED */}
      <div style={{ marginBottom: 'var(--space-10)' }}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
            Similar Schemes Detected
          </h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
            NLP similarity scoring against verified government repositories to detect deceptive clone variants or overlapping welfare schemes.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {similarSchemesList.map((sim) => (
            <Card key={sim.id} variant="default" padding="lg">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {sim.schemeName}
                  </h3>
                  {sim.officialMinistry && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {sim.officialMinistry}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 800,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {sim.similarityPercentage}% Similar
                </div>
              </div>

              {/* Matching Fields */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                  Matching:
                </span>
                {sim.matchedFields.map((field, i) => (
                  <span key={i} className="badge" style={{ fontSize: '10px', backgroundColor: 'var(--bg-app)' }}>
                    {field}
                  </span>
                ))}
              </div>

              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 var(--space-4) 0' }}>
                {sim.explanation}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSimilarScheme(sim)}
                  leftIcon={<Eye size={13} />}
                  style={{ fontSize: '11px' }}
                >
                  View Details & Differences
                </Button>

                {sim.officialUrl && (
                  <a
                    href={sim.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '11px', color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}
                  >
                    <span>Portal</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Section 11: WARNING / RISK SIGNALS */}
      <div style={{ marginBottom: 'var(--space-10)' }}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
            Risk Signals
          </h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
            Automated security indicators categorized by threat level.
          </p>
        </div>

        <Card variant="glass" padding="md">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {riskSignalsList.map((signal) => {
              const isCrit = signal.severity === 'CRITICAL';
              const isSafe = signal.severity === 'SAFE';

              return (
                <div
                  key={signal.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSafe ? 'var(--color-verified-bg)' : isCrit ? 'var(--color-fake-bg)' : 'var(--color-suspicious-bg)',
                    border: `1px solid ${isSafe ? 'var(--color-verified-border)' : isCrit ? 'var(--color-fake-border)' : 'var(--color-suspicious-border)'}`
                  }}
                >
                  <div style={{ flexShrink: 0, marginTop: '2px' }}>
                    {isSafe ? (
                      <CheckCircle2 size={16} color="var(--color-verified)" />
                    ) : isCrit ? (
                      <XCircle size={16} color="var(--color-fake)" />
                    ) : (
                      <AlertTriangle size={16} color="var(--color-suspicious)" />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {signal.title}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {signal.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Section 12: RESULT ACTIONS FOOTER */}
      <Card
        variant="default"
        padding="lg"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          backgroundColor: 'var(--color-brand-navy)',
          color: 'var(--text-inverse)'
        }}
      >
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-inverse)', margin: '0 0 var(--space-1) 0' }}>
            Ready to verify another claim?
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
            Stay protected against viral misinformation and predatory fees.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/dashboard')}
            style={{ color: 'var(--text-inverse)', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            Back to Dashboard
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={<RotateCcw size={16} />}
            onClick={() => navigate('/verify')}
          >
            Verify Another Scheme
          </Button>
        </div>
      </Card>

      {/* MODAL 1: Similar Scheme Side-by-Side Comparison */}
      {selectedSimilarScheme && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 'var(--z-modal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '640px',
              width: '100%',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-2xl)',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedSimilarScheme(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary)'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
              Side-by-Side Scheme Comparison
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Similarity: <strong>{selectedSimilarScheme.similarityPercentage}%</strong> with {selectedSimilarScheme.schemeName}
            </p>

            {selectedSimilarScheme.comparisonDetails ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-verified-bg)', border: '1px solid var(--color-verified-border)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-verified-text)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Genuine Gazette Standard:
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                    {selectedSimilarScheme.comparisonDetails.originalClaim}
                  </div>
                </div>

                <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-fake-bg)', border: '1px solid var(--color-fake-border)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-fake-text)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Detected / Submitted Claim:
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                    {selectedSimilarScheme.comparisonDetails.detectedClaim}
                  </div>
                </div>

                <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Comparative Verdict:
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                    {selectedSimilarScheme.comparisonDetails.verdict}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                {selectedSimilarScheme.explanation}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <Button variant="primary" size="sm" onClick={() => setSelectedSimilarScheme(null)}>
                Close Comparison
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Download Report Preview (UI Only) */}
      {isDownloadModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 'var(--z-modal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '560px',
              width: '100%',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-2xl)',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={() => setIsDownloadModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary)'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <Printer size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Verification Report Summary
              </h3>
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Ready to print or save. Full automated PDF export will connect with backend reporting service.
            </p>

            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-medium)',
                fontSize: 'var(--text-xs)',
                lineHeight: 1.6,
                marginBottom: 'var(--space-5)'
              }}
            >
              <div><strong>Scheme:</strong> {schemeDisplayName}</div>
              <div><strong>Verdict:</strong> {resolvedStatus} (Risk Score: {activeResult.riskScore}/100)</div>
              <div><strong>AI Confidence:</strong> {activeResult.confidenceScore}%</div>
              <div><strong>Report ID:</strong> {activeResult.id}</div>
              <div><strong>Timestamp:</strong> {activeResult.verifiedAt}</div>
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
                <strong>Summary:</strong> {activeResult.summary}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.print();
                  setIsDownloadModalOpen(false);
                }}
              >
                Print Browser View
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  showToast('Report downloaded successfully (demo simulation)');
                  setIsDownloadModalOpen(false);
                }}
              >
                Download PDF Summary
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Share Result Modal (UI Only) */}
      {isShareModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 'var(--z-modal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '520px',
              width: '100%',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-2xl)',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={() => setIsShareModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary)'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              Share Verification Verdict
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Help protect family, friends, and community groups by sharing this safety verdict.
            </p>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Shareable Verdict Text
              </label>
              <div
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-primary)',
                  lineHeight: 1.5
                }}
              >
                ⚠️ SchemeShield AI Alert: Verification verdict for "{schemeDisplayName}" is {resolvedStatus} (Risk: {activeResult.riskScore}/100). {activeResult.recommendation}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Copy size={14} />}
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `SchemeShield AI Verdict for "${schemeDisplayName}": Status ${resolvedStatus} (Risk: ${activeResult.riskScore}/100). Recommendation: ${activeResult.recommendation}`
                  );
                  showToast('Verification verdict copied to clipboard!');
                  setIsShareModalOpen(false);
                }}
              >
                Copy Alert Message
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
