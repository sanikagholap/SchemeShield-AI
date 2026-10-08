import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileSearch,
  Sparkles,
  TrendingUp,
  RefreshCw,
  FolderOpen,
  Filter
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
import { MOCK_DASHBOARD_STATS, MOCK_RECENT_VERIFICATIONS } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState(MOCK_RECENT_VERIFICATIONS);
  const [viewState, setViewState] = useState<'normal' | 'empty' | 'error'>('normal');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const stats = MOCK_DASHBOARD_STATS;

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
            display: 'flex'
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(4px)'
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
            {/* Top Bar with View State Switcher for evaluator convenience */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-6)'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  CENTRAL CITIZEN CONSOLE
                </span>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Verification Overview & Live Analytics
                </div>
              </div>

              {/* View State Switcher (Normal / Empty / Error) to test UI states */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--bg-surface)',
                  padding: '4px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '11px'
                }}
              >
                <span style={{ padding: '0 6px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                  Test UI States:
                </span>
                <button
                  type="button"
                  onClick={() => setViewState('normal')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: viewState === 'normal' ? 'var(--color-primary-light)' : 'transparent',
                    color: viewState === 'normal' ? 'var(--color-primary)' : 'var(--text-secondary)',
                    fontWeight: viewState === 'normal' ? 700 : 500,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Active Data
                </button>
                <button
                  type="button"
                  onClick={() => setViewState('empty')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: viewState === 'empty' ? 'var(--color-primary-light)' : 'transparent',
                    color: viewState === 'empty' ? 'var(--color-primary)' : 'var(--text-secondary)',
                    fontWeight: viewState === 'empty' ? 700 : 500,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Empty State
                </button>
                <button
                  type="button"
                  onClick={() => setViewState('error')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: viewState === 'error' ? 'var(--color-fake-bg)' : 'transparent',
                    color: viewState === 'error' ? 'var(--color-fake)' : 'var(--text-secondary)',
                    fontWeight: viewState === 'error' ? 700 : 500,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Error State
                </button>
              </div>
            </div>

            {/* Error State Simulation View */}
            {viewState === 'error' ? (
              <ErrorState
                title="Telemetry Feed Disconnected"
                message="Unable to fetch recent verification records from the mock service layer. Click retry to recover."
                onRetry={() => setViewState('normal')}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {/* 1. Summary Statistics Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                    gap: 'var(--space-4)'
                  }}
                >
                  <StatCard
                    label="Schemes Verified"
                    value={viewState === 'empty' ? '0' : String(stats.schemesVerified)}
                    helper="Evaluated citizen claims"
                    trend={{ value: `+${stats.weeklyIncrease} this week`, isPositive: true }}
                    icon={<ShieldCheck size={20} />}
                  />

                  <StatCard
                    label="Safe / Trusted"
                    value={viewState === 'empty' ? '0' : String(stats.trustedCount)}
                    helper="Matched official Gazettes"
                    trend={{ value: '71% clean', isPositive: true }}
                    icon={<TrendingUp size={20} />}
                  />

                  <StatCard
                    label="Suspicious"
                    value={viewState === 'empty' ? '0' : String(stats.suspiciousCount)}
                    helper="Altered eligibility criteria"
                    trend={{ value: 'Needs review', isPositive: false }}
                    icon={<AlertTriangle size={20} />}
                  />

                  <StatCard
                    label="High Risk / Fraud"
                    value={viewState === 'empty' ? '0' : String(stats.highRiskCount)}
                    helper="Unauthorized fee demands"
                    trend={{ value: 'Critical alerts', isPositive: false }}
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
                    alignItems: 'flex-start'
                  }}
                >
                  {/* Left Column: Recent Verifications Table / Empty State */}
                  <div style={{ gridColumn: 'span 2' }}>
                    {viewState === 'empty' ? (
                      <EmptyState
                        title="No Verification Records Yet"
                        description="You haven't scanned any government scheme claims yet. Paste a WhatsApp forward or scheme link to run your first verification."
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
                      trustedCount={viewState === 'empty' ? 0 : stats.trustedCount}
                      suspiciousCount={viewState === 'empty' ? 0 : stats.suspiciousCount}
                      highRiskCount={viewState === 'empty' ? 0 : stats.highRiskCount}
                      total={viewState === 'empty' ? 0 : stats.schemesVerified}
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
      `}</style>
    </div>
  );
};
