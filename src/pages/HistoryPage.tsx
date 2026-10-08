import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  Eye,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { PageContainer } from '../components/ui/PageContainer';
import { historyService } from '../services/historyService';
import { verificationService } from '../services/verificationService';
import { HistoryItem } from '../types/history';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'risk-high' | 'risk-low'>('recent');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination / Load More simulation
  const [visibleCount, setVisibleCount] = useState<number>(5);

  useEffect(() => {
    historyService.getHistory().then((data) => {
      setItems(data);
      setIsLoading(false);
    });
  }, []);

  const filteredItems = items
    .filter((item) => {
      const matchesFilter =
        filterStatus === 'ALL' ||
        (filterStatus === 'TRUSTED' && (item.status === 'SAFE' || item.status === 'TRUSTED')) ||
        (filterStatus === 'SUSPICIOUS' && item.status === 'SUSPICIOUS') ||
        (filterStatus === 'HIGH RISK' && (item.status === 'FAKE' || item.status === 'HIGH RISK')) ||
        (filterStatus === 'NEEDS REVIEW' && item.status === 'NEEDS REVIEW');

      const matchesSearch =
        item.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.inputExcerpt.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'risk-high') return b.riskScore - a.riskScore;
      if (sortBy === 'risk-low') return a.riskScore - b.riskScore;
      return 0; // Default order is recent
    });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await historyService.deleteHistoryItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleViewResult = async (item: HistoryItem) => {
    const resultId = item.resultId || item.id;
    const resolvedResult = await verificationService.getVerificationById(resultId);
    navigate('/verification-result', { state: { result: resolvedResult } });
  };

  return (
    <PageContainer style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>
          Dashboard
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Verification History</span>
      </div>

      {/* Page Heading */}
      <div style={{ maxWidth: '840px', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: '4px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
          <HistoryIcon size={14} />
          <span>CITIZEN AUDIT LOG</span>
        </div>
        <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>
          Verification History
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          Review previous scheme assessments, security verdicts, and confidence indices. Click "View Result" to reopen the detailed AI report.
        </p>
      </div>

      <div style={{ maxWidth: '960px' }}>
        {/* Search & Filter Toolbar */}
        <Card variant="glass" padding="md" style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <Input
                  placeholder="Search past verification records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search size={18} />}
                />
              </div>

              <select
                aria-label="Sort history records"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  height: '40px',
                  padding: '0 var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <option value="recent">Most Recent First</option>
                <option value="risk-high">Highest Risk First</option>
                <option value="risk-low">Lowest Risk First</option>
              </select>

              <Link to="/verify">
                <Button variant="primary" size="md" leftIcon={<Sparkles size={16} />}>
                  New Verification
                </Button>
              </Link>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>
                Status:
              </span>
              {[
                { label: 'All Records', value: 'ALL' },
                { label: '✓ Trusted', value: 'TRUSTED' },
                { label: '⚠ Suspicious', value: 'SUSPICIOUS' },
                { label: '🚨 High Risk', value: 'HIGH RISK' },
                { label: '🔍 Needs Review', value: 'NEEDS REVIEW' }
              ].map((pill) => {
                const isSelected = filterStatus === pill.value;
                return (
                  <button
                    key={pill.value}
                    type="button"
                    onClick={() => setFilterStatus(pill.value)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: isSelected ? 700 : 500,
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--color-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Records Count & Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          <span>Showing {Math.min(visibleCount, filteredItems.length)} of {filteredItems.length} records</span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
            >
              Clear search
            </button>
          )}
        </div>

        {/* History Records List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {isLoading ? (
            <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto var(--space-3)', animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: 'var(--text-sm)' }}>Loading verification records...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <Card variant="glass" padding="lg" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
              <HistoryIcon size={40} color="var(--text-tertiary)" style={{ margin: '0 auto var(--space-3)' }} />
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                No verification records found
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', maxWidth: '420px', margin: '0 auto var(--space-4)' }}>
                {searchTerm || filterStatus !== 'ALL'
                  ? 'No records match your current filter settings. Try resetting filters to see all previous checks.'
                  : 'You have not performed any scheme verifications yet. Start by verifying an announcement or message.'}
              </p>
              <Link to="/verify">
                <Button variant="primary" size="sm" leftIcon={<Sparkles size={14} />}>
                  Verify Your First Scheme
                </Button>
              </Link>
            </Card>
          ) : (
            filteredItems.slice(0, visibleCount).map((item) => {
              const isLowRisk = item.riskScore <= 25;
              const isHighRisk = item.riskScore > 60;

              return (
                <Card
                  key={item.id}
                  variant="default"
                  padding="md"
                  style={{
                    borderLeft: `4px solid ${isLowRisk ? 'var(--color-verified)' : isHighRisk ? 'var(--color-fake)' : 'var(--color-suspicious)'}`,
                    transition: 'box-shadow var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                    {/* Left: Scheme Info & Snippet */}
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {item.schemeName}
                        </span>

                        <span
                          className={`badge ${isLowRisk ? 'badge-verified' : isHighRisk ? 'badge-fake' : 'badge-suspicious'}`}
                          style={{ fontSize: '10px' }}
                        >
                          {item.status}
                        </span>

                        <span className="badge" style={{ fontSize: '10px', backgroundColor: 'var(--bg-app)' }}>
                          Method: {item.method}
                        </span>
                      </div>

                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '0 0 var(--space-2) 0', lineHeight: 1.5 }}>
                        "{item.inputExcerpt}"
                      </p>

                      <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: '11px', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                        <span>🕒 {item.verifiedAt}</span>
                        <span>Confidence: <strong>{item.confidenceScore}%</strong></span>
                        {item.flagCount > 0 ? (
                          <span style={{ color: 'var(--color-fake)', fontWeight: 600 }}>
                            ⚠️ {item.flagCount} Discrepancies detected
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-verified)', fontWeight: 600 }}>
                            ✓ 0 Warnings
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Risk Meter & View Result Action */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: isLowRisk ? 'var(--color-verified)' : isHighRisk ? 'var(--color-fake)' : 'var(--color-suspicious)' }}>
                          {item.riskScore}
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>/100</span>
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                          Risk Index
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Eye size={13} />}
                          onClick={() => handleViewResult(item)}
                          style={{ fontSize: '11px' }}
                        >
                          View Result
                        </Button>

                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          title="Delete from audit history"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-tertiary)',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Load More Button if records exceed visible count */}
        {filteredItems.length > visibleCount && (
          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVisibleCount((prev) => prev + 5)}
            >
              Load More Records ({filteredItems.length - visibleCount} remaining)
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
