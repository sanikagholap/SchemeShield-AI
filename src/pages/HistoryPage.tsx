import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Trash2,
  ShieldCheck,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { PageContainer } from '../components/ui/PageContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { historyService } from '../services/historyService';
import { HistoryItem } from '../types/history';

export const HistoryPage: React.FC = () => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    historyService.getHistory().then(setItems);
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesFilter = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesSearch = item.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.inputExcerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    await historyService.deleteHistoryItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <PageContainer style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>
      <SectionHeading
        badge="Record Audit"
        title="Verification History"
        description="Inspect all previous scheme assessments and export audit trails."
      />

      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Search & Filter Header */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <Input
              placeholder="Search past verification records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['ALL', 'FAKE', 'SUSPICIOUS', 'SAFE'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: filterStatus === status ? 'var(--color-primary)' : 'var(--border-subtle)',
                  backgroundColor: filterStatus === status ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                  color: filterStatus === status ? 'var(--color-primary)' : 'var(--text-secondary)'
                }}
              >
                {status === 'ALL' ? 'All Records' : status}
              </button>
            ))}
          </div>
        </div>

        {/* History List Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filteredItems.length === 0 ? (
            <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
              <HistoryIcon size={36} color="var(--text-tertiary)" style={{ margin: '0 auto var(--space-2)' }} />
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
                No verification records found
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Try adjusting your search criteria or run a new scheme scan.
              </p>
              <Link to="/verify" style={{ marginTop: 'var(--space-4)', display: 'inline-block' }}>
                <Button variant="primary" size="sm">Verify a Scheme</Button>
              </Link>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} variant="default" padding="md">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.schemeName}
                      </span>
                      <StatusIndicator status={item.status} size="sm" />
                    </div>

                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '6px', lineHeight: 1.5 }}>
                      "{item.inputExcerpt}"
                    </p>

                    <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      <span>Scanned {item.verifiedAt}</span>
                      <span>Mode: {item.method}</span>
                      <span>Confidence: {item.confidenceScore}%</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: item.riskScore > 60 ? 'var(--color-fake)' : 'var(--color-verified)' }}>
                        {item.riskScore}<span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/100</span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Risk Index</span>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <Link to="/verification-result">
                        <Button variant="outline" size="sm">
                          Inspect
                        </Button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        style={{ padding: '6px', color: 'var(--text-tertiary)', borderRadius: 'var(--radius-sm)' }}
                        title="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  );
};
