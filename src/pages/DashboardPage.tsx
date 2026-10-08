import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  History,
  FileSearch,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageContainer } from '../components/ui/PageContainer';
import { StatCard } from '../components/common/StatCard';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { historyService } from '../services/historyService';
import { HistoryItem } from '../types/history';

export const DashboardPage: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    historyService.getHistory().then(setHistoryItems);
  }, []);

  return (
    <PageContainer style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-16)' }}>
      {/* Top Welcome Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Citizen Intelligence Console
          </span>
          <h1 style={{ fontSize: 'var(--text-3xl)', color: 'var(--text-primary)', marginTop: '4px' }}>
            Verification Workbench
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Monitor flagged scams, inspect past verification verdicts, and cross-reference welfare records.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link to="/schemes">
            <Button variant="outline" size="md" leftIcon={<FileSearch size={16} />}>
              Scheme Directory
            </Button>
          </Link>
          <Link to="/verify">
            <Button variant="primary" size="md" leftIcon={<ShieldCheck size={16} />}>
              Verify New Claim
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-8)'
        }}
      >
        <StatCard
          label="Total Scans Run"
          value="18"
          helper="Past 30 days"
          trend={{ value: "+4 this week", isPositive: true }}
          icon={<ShieldCheck size={20} />}
        />
        <StatCard
          label="Confirmed Scams Caught"
          value="7"
          helper="Fake schemes & illegal fees"
          trend={{ value: "Critical Alerts", isPositive: false }}
          icon={<ShieldAlert size={20} />}
        />
        <StatCard
          label="Authentic Schemes Matched"
          value="11"
          helper="Verified on official gazettes"
          trend={{ value: "100% Genuine", isPositive: true }}
          icon={<TrendingUp size={20} />}
        />
        <StatCard
          label="Public Financial Defense"
          value="₹0 Cost"
          helper="Open civic technology"
          icon={<Sparkles size={20} />}
        />
      </div>

      {/* Main Grid: Activity and Scam Waves */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)' }}>
        {/* Recent Verifications Activity */}
        <div style={{ gridColumn: 'span 2' }}>
          <Card variant="default" padding="lg">
            <CardHeader>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <CardTitle style={{ fontSize: 'var(--text-xl)' }}>
                    Recent Scheme Verifications
                  </CardTitle>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                    Past queries evaluated by the SchemeShield algorithmic pipeline
                  </p>
                </div>
                <Link to="/history" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-primary)' }}>
                  View All History →
                </Link>
              </div>
            </CardHeader>

            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--bg-surface-secondary)',
                      border: '1px solid var(--border-light)',
                      flexWrap: 'wrap',
                      gap: 'var(--space-3)'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.schemeName}
                        </span>
                        <StatusIndicator status={item.status} size="sm" />
                      </div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                        {item.inputExcerpt}
                      </p>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Verified {item.verifiedAt} via {item.method} mode
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: item.riskScore > 60 ? 'var(--color-fake)' : 'var(--color-verified)' }}>
                          {item.riskScore}/100
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Risk Index</span>
                      </div>
                      <Link to="/verification-result">
                        <Button variant="outline" size="sm">
                          Inspect Report
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* High Priority Fraud Alerts Panel */}
        <div>
          <Card variant="glass" padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-fake)', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
              <AlertTriangle size={18} />
              <span>Current Scam Alerts</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-fake-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-fake-border)' }}>
                <Badge variant="fake" size="sm" style={{ marginBottom: '4px' }}>
                  Critical Severity
                </Badge>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-fake-text)' }}>
                  PM Free Tractor 2026 Fraud
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-fake-text)', margin: '4px 0 0', lineHeight: 1.4 }}>
                  Fake phishing links soliciting ₹499 via UPI to "register" under PM-KISAN.
                </p>
              </div>

              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-suspicious-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-suspicious-border)' }}>
                <Badge variant="suspicious" size="sm" style={{ marginBottom: '4px' }}>
                  High Advisory
                </Badge>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-suspicious-text)' }}>
                  Ayushman Instant Card Download
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-suspicious-text)', margin: '4px 0 0', lineHeight: 1.4 }}>
                  Fake web portals charging ₹250 for card delivery without SECC validation.
                </p>
              </div>

              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-suspicious-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-suspicious-border)' }}>
                <Badge variant="suspicious" size="sm" style={{ marginBottom: '4px' }}>
                  Caution
                </Badge>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-suspicious-text)' }}>
                  Mudra Loan WhatsApp Sanctions
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-suspicious-text)', margin: '4px 0 0', lineHeight: 1.4 }}>
                  Forged sanction letters requesting 5% GST deposit to release credit.
                </p>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-light)' }}>
              <a
                href="https://factcheck.pib.gov.in"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 'var(--text-xs)', display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontWeight: 600 }}
              >
                <span>View Full PIB Fact Check Feed</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
