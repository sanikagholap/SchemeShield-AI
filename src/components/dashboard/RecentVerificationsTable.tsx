import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, ShieldCheck, AlertTriangle, ShieldAlert, ArrowRight, Eye } from 'lucide-react';
import { RecentVerificationItem } from '../../types/dashboard';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { StatusIndicator } from '../ui/StatusIndicator';

export interface RecentVerificationsTableProps {
  items: RecentVerificationItem[];
}

export const RecentVerificationsTable: React.FC<RecentVerificationsTableProps> = ({ items }) => {
  const navigate = useNavigate();

  const handleViewResult = (item: RecentVerificationItem) => {
    // Navigate to /verification-result passing state in clean frontend manner
    navigate('/verification-result', {
      state: {
        result: {
          id: item.id,
          inputQuery: item.inputQuery,
          detectedSchemeName: item.schemeName,
          status: item.status,
          riskTier: item.riskTier,
          riskScore: item.riskScore,
          confidenceScore: item.confidenceScore,
          summary: item.summary,
          detectedFlags: item.riskScore > 50 ? [
            {
              id: 'flag-mock',
              severity: item.riskScore > 80 ? 'CRITICAL' : 'WARNING',
              title: item.riskScore > 80 ? 'Unauthorized Financial Solicitation' : 'Altered Application Criteria',
              description: item.summary,
              detectedPattern: 'Discrepancy identified against official gazette notification'
            }
          ] : [],
          evidenceSources: [
            {
              title: item.source,
              sourceType: 'OFFICIAL_PORTAL',
              matchScore: item.confidenceScore,
              snippet: item.summary
            }
          ],
          isDuplicateOrAltered: item.riskScore > 50,
          recommendation: item.riskScore > 50
            ? 'Do not pay any advance fees. Cross-verify announcement on official state portals.'
            : 'Information aligns with verified central welfare guidelines.',
          verifiedAt: item.verificationDate,
          verificationMethod: 'TEXT'
        }
      }
    });
  };

  return (
    <Card variant="default" padding="lg">
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div>
            <CardTitle style={{ fontSize: 'var(--text-lg)' }}>
              Recent Scheme Verifications
            </CardTitle>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Historical checks evaluated against official registries and threat patterns
            </p>
          </div>
          <button
            onClick={() => navigate('/history')}
            style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <span>View All ({items.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </CardHeader>

      {/* Desktop Table View */}
      <div className="recent-table-wrapper" style={{ overflowX: 'auto', marginTop: 'var(--space-2)' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 'var(--text-sm)',
            textAlign: 'left'
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-tertiary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '10px 12px', fontWeight: 700 }}>Scheme Name</th>
              <th style={{ padding: '10px 12px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '10px 12px', fontWeight: 700 }}>Threat Index</th>
              <th style={{ padding: '10px 12px', fontWeight: 700 }}>Source</th>
              <th style={{ padding: '10px 12px', fontWeight: 700 }}>Date</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: '1px solid var(--border-light)',
                  transition: 'background-color var(--transition-fast)'
                }}
                className="table-row-hover"
              >
                {/* Scheme Name */}
                <td style={{ padding: '14px 12px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '240px' }}>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.schemeName}>
                    {item.schemeName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 400, marginTop: '2px' }}>
                    ID: {item.id}
                  </div>
                </td>

                {/* Status */}
                <td style={{ padding: '14px 12px' }}>
                  <StatusIndicator status={item.status} size="sm" />
                </td>

                {/* Risk Score */}
                <td style={{ padding: '14px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '6px',
                        backgroundColor: 'var(--bg-surface-secondary)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${item.riskScore}%`,
                          backgroundColor: item.riskScore > 60 ? 'var(--color-fake)' : item.riskScore > 25 ? 'var(--color-suspicious)' : 'var(--color-verified)'
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        color: item.riskScore > 60 ? 'var(--color-fake)' : item.riskScore > 25 ? 'var(--color-suspicious)' : 'var(--color-verified)'
                      }}
                    >
                      {item.riskScore}/100
                    </span>
                  </div>
                </td>

                {/* Source */}
                <td style={{ padding: '14px 12px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  <span style={{ maxWidth: '180px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.source}>
                    {item.source}
                  </span>
                </td>

                {/* Date */}
                <td style={{ padding: '14px 12px', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                  {item.verificationDate}
                </td>

                {/* Action */}
                <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewResult(item)}
                    rightIcon={<Eye size={12} />}
                  >
                    View Result
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .table-row-hover:hover {
          background-color: var(--bg-surface-secondary);
        }
      `}</style>
    </Card>
  );
};
