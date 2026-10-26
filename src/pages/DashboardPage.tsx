import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { PageContainer } from '../components/ui/PageContainer';
import { StatCard } from '../components/common/StatCard';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { QuickVerifyCard } from '../components/dashboard/QuickVerifyCard';
import { RiskOverview } from '../components/dashboard/RiskOverview';
import { RecentVerificationsTable } from '../components/dashboard/RecentVerificationsTable';
import { TrustArchitectureCard } from '../components/dashboard/TrustArchitectureCard';
import { Sidebar } from '../components/layout/Sidebar';
import { RecentVerificationItem } from '../types/dashboard';
import { VerificationStatsResponse } from '../types/api';
import { historyService } from '../services/historyService';
import { useAuth } from '../hooks/useAuth';

export const DashboardPage: React.FC = () => {
  useAuth(); // keep auth context active
  const [items, setItems] = useState<RecentVerificationItem[]>([]);
  const [stats, setStats] = useState<VerificationStatsResponse>({
    total_verifications: 0,
    genuine_count: 0,
    suspicious_count: 0,
    fraudulent_count: 0,
    flagged_fraud_rate: 0,
    top_flagged_schemes: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const [statsData, historyData] = await Promise.all([
        historyService.getStats(),
        historyService.getHistory(1, 10),
      ]);

      setStats(statsData);

      const mappedItems: RecentVerificationItem[] = (historyData || []).map((h) => ({
        id: h.id,
        schemeName: h.schemeName,
        verificationDate: h.verifiedAt,
        status: h.status,
        riskTier: h.riskTier,
        riskScore: h.riskScore,
        confidenceScore: h.confidenceScore,
        source: h.method || 'Citizen Submission',
        summary: h.summary || `Verification logged for ${h.schemeName}`,
        inputQuery: h.inputExcerpt,
      }));

      setItems(mappedItems);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-app)' }}>
      {/* Desktop Sticky Sidebar */}
      <div className="dashboard-desktop-sidebar" style={{ display: 'none' }}>
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 'var(--z-modal)',
            display: 'flex',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(4px)',
            }}
          />
          {/* Drawer Content */}
          <div style={{ position: 'relative', zIndex: 1, animation: 'fadeIn var(--transition-fast)' }}>
            <Sidebar onClose={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <DashboardHeader onToggleSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Dashboard Body */}
        <main style={{ padding: 'var(--space-6) var(--space-4) var(--space-16)' }}>
          <PageContainer variant="wide">
            {/* Top Bar with Live Refresh */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-6)',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  CENTRAL CITIZEN CONSOLE
                </span>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Verification Overview & Live Analytics
                </div>
              </div>

              <button
                type="button"
                onClick={loadDashboardData}
                disabled={isLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                title="Refresh live telemetry from FastAPI backend"
              >
                <RefreshCw size={13} className={isLoading ? 'spin-icon' : ''} />
                <span>{isLoading ? 'Updating...' : 'Sync Telemetry'}</span>
              </button>
            </div>

            {/* Error State View */}
            {hasError ? (
              <ErrorState
                title="Telemetry Feed Disconnected"
                message="Unable to fetch live verification records from the FastAPI backend service. Please ensure the backend is running and retry."
                onRetry={loadDashboardData}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {/* 1. Summary Statistics Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                    gap: 'var(--space-4)',
                  }}
                >
                  <StatCard
                    label="Schemes Verified"
                    value={isLoading ? '...' : String(stats.total_verifications)}
                    helper="Evaluated citizen claims"
                    icon={<ShieldCheck size={20} />}
                  />

                  <StatCard
                    label="Safe / Trusted"
                    value={isLoading ? '...' : String(stats.genuine_count)}
                    helper="Matched official records"
                    trend={
                      stats.total_verifications > 0
                        ? {
                            value: `${Math.round((stats.genuine_count / stats.total_verifications) * 100)}% verified`,
                            isPositive: true,
                          }
                        : undefined
                    }
                    icon={<TrendingUp size={20} />}
                  />

                  <StatCard
                    label="Suspicious"
                    value={isLoading ? '...' : String(stats.suspicious_count)}
                    helper="Altered eligibility criteria"
                    icon={<AlertTriangle size={20} />}
                  />

                  <StatCard
                    label="High Risk / Fraud"
                    value={isLoading ? '...' : String(stats.fraudulent_count)}
                    helper="Unauthorized fee demands"
                    trend={
                      stats.flagged_fraud_rate > 0
                        ? {
                            value: `${Math.round(stats.flagged_fraud_rate * 100)}% fraud rate`,
                            isPositive: false,
                          }
                        : undefined
                    }
                    icon={<ShieldAlert size={20} />}
                  />
                </div>

                {/* 2. Quick Verify Action Card */}
                <QuickVerifyCard />

                {/* 3. Main Analytics & Activity Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 'var(--space-6)',
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Left Column: Recent Verifications Table / Empty State */}
                  <div style={{ gridColumn: 'span 2' }}>
                    {items.length === 0 && !isLoading ? (
                      <EmptyState
                        title="No Verification Records Yet"
                        description="You haven't scanned any government scheme claims yet. Enter details or upload documents on the Verify tool to run your first assessment."
                        actionText="Run Your First Verification"
                        onAction={() => navigate('/verify')}
                      />
                    ) : (
                      <RecentVerificationsTable items={items} />
                    )}
                  </div>

                  {/* Right Column: Risk Overview & Methodology Architecture */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <RiskOverview
                      trustedCount={stats.genuine_count}
                      suspiciousCount={stats.suspicious_count}
                      highRiskCount={stats.fraudulent_count}
                      total={stats.total_verifications}
                    />

                    <TrustArchitectureCard />
                  </div>
                </div>
              </div>
            )}
          </PageContainer>
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .dashboard-desktop-sidebar { display: block !important; }
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
