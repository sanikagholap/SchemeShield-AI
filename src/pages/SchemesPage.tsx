import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  Building2,
  AlertTriangle,
  RotateCcw,
  Info,
  X,
  Eye,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageContainer } from '../components/ui/PageContainer';
import { schemeService } from '../services/schemeService';
import { GovernmentScheme } from '../types/scheme';

export const SchemesPage: React.FC = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name-asc' | 'name-desc' | 'risk-low' | 'risk-high'>('recent');
  const [isLoading, setIsLoading] = useState(true);

  // Scheme Details Modal State
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);

  // Mobile Filter Drawer Toggle
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    schemeService.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const fetchFilteredSchemes = async () => {
      setIsLoading(true);
      const data = await schemeService.searchSchemes(searchQuery, selectedCategory, selectedRisk, sortBy);
      setSchemes(data);
      setIsLoading(false);
    };

    fetchFilteredSchemes();
  }, [searchQuery, selectedCategory, selectedRisk, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedRisk('All');
    setSortBy('recent');
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || selectedRisk !== 'All' || sortBy !== 'recent';

  return (
    <PageContainer style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>
          Dashboard
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Explore Schemes</span>
      </div>

      {/* Page Heading & Tagline */}
      <div style={{ maxWidth: '820px', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: '4px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
          <Layers size={14} />
          <span>CENTRAL & STATE WELFARE DIRECTORY</span>
        </div>
        <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>
          Explore Government Schemes
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          Discover and review government schemes from a centralized interface. Browse legitimate welfare programs, official application guidelines, and active scam advisories.
        </p>
      </div>

      {/* Subtle Demo Data Notice */}
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
          <strong>Demo data:</strong> Live government-source verification will be connected through the backend. Information shown below reflects verified reference standards.
        </div>
      </div>

      {/* Search and Filter Controls Toolbar */}
      <Card variant="glass" padding="md" style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Top Search Input Row */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <Input
                placeholder="Search scheme name, ministry, target group, or benefits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={18} />}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {/* Sort Dropdown */}
              <select
                aria-label="Sort schemes"
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
                <option value="recent">Recently Reviewed</option>
                <option value="name-asc">A – Z (Title)</option>
                <option value="name-desc">Z – A (Title)</option>
                <option value="risk-low">Lowest Risk First</option>
                <option value="risk-high">Highest Risk First</option>
              </select>

              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="filter-toggle-btn"
                style={{
                  display: 'none',
                  alignItems: 'center',
                  gap: '6px',
                  height: '40px',
                  padding: '0 var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-surface)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <Filter size={15} />
                <span>Filters</span>
              </button>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  leftIcon={<RotateCcw size={13} />}
                  style={{ height: '40px', fontSize: 'var(--text-xs)' }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
              Filter by Category:
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: isSelected ? 700 : 500,
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--color-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Risk Level Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>
              Risk Level:
            </span>
            {['All', 'Low Risk', 'Moderate Risk', 'High Alert'].map((r) => {
              const isSelected = selectedRisk === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRisk(r)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: isSelected ? 700 : 500,
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--color-brand-navy)' : 'var(--border-subtle)',
                    backgroundColor: isSelected ? 'var(--color-brand-navy)' : 'var(--bg-surface-secondary)',
                    color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Schemes Grid */}
      <div style={{ marginBottom: 'var(--space-12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Showing {schemes.length} verified government welfare schemes
          </span>
          <Link to="/verify" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Cannot find your scheme? Check on Verify tool</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {isLoading ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto var(--space-3)', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: 'var(--text-sm)' }}>Filtering scheme catalog...</div>
          </div>
        ) : schemes.length === 0 ? (
          <Card variant="default" padding="lg" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <AlertTriangle size={36} color="var(--color-suspicious)" style={{ margin: '0 auto var(--space-3)' }} />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
              No schemes matched your criteria
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Try loosening your search terms, changing categories, or resetting the filter options.
            </p>
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Reset Filters
            </Button>
          </Card>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: 'var(--space-6)',
              alignItems: 'stretch'
            }}
          >
            {schemes.map((scheme) => {
              const isLowRisk = scheme.riskScore <= 25;
              const isHighRisk = scheme.riskScore > 60;

              return (
                <Card
                  key={scheme.id}
                  variant="default"
                  padding="md"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderTop: `4px solid ${isLowRisk ? 'var(--color-verified)' : isHighRisk ? 'var(--color-fake)' : 'var(--color-suspicious)'}`,
                    transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
                  }}
                >
                  <div>
                    {/* Header: Category Badge + Risk Score */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                      <span className="badge badge-info" style={{ fontSize: '11px' }}>
                        {scheme.category}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          className={`badge ${isLowRisk ? 'badge-verified' : isHighRisk ? 'badge-fake' : 'badge-suspicious'}`}
                          style={{ fontSize: '10px' }}
                        >
                          {scheme.statusLabel || 'Verified'}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: isLowRisk ? 'var(--color-verified)' : isHighRisk ? 'var(--color-fake)' : 'var(--color-suspicious)' }}>
                          {scheme.riskScore}/100
                        </span>
                      </div>
                    </div>

                    {/* Title & Code */}
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.3 }}>
                      {scheme.title}
                    </h3>

                    {/* Ministry */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
                      <Building2 size={13} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {scheme.ministry}
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {scheme.shortDescription}
                    </p>

                    {/* Quick highlights: Eligibility & Benefits snippet */}
                    <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-app)', marginBottom: 'var(--space-4)', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Eligibility:</strong>{' '}
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {scheme.eligibilityCriteria[0]}
                        </span>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Benefit:</strong>{' '}
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {scheme.keyBenefits[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Actions & Review Date */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
                      <span>Reviewed: {scheme.lastReviewedDate}</span>
                      <span>DBT: {scheme.isDirectBenefitTransfer ? 'Enabled (Direct)' : 'Service-based'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedScheme(scheme)}
                        leftIcon={<Eye size={13} />}
                        style={{ flex: 1, fontSize: '11px' }}
                      >
                        View Details
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/verify?q=${encodeURIComponent(scheme.title)}`)}
                        leftIcon={<ShieldCheck size={13} />}
                        style={{ flex: 1, fontSize: '11px' }}
                      >
                        Verify Claim
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* SCHEME DETAILS MODAL */}
      {selectedScheme && (
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
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-2xl)',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedScheme(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary)'
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                <span className="badge badge-info" style={{ fontSize: '11px' }}>
                  {selectedScheme.category}
                </span>
                <span className="badge badge-verified" style={{ fontSize: '11px' }}>
                  {selectedScheme.verifiedStatus}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  Code: {selectedScheme.code}
                </span>
              </div>

              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 var(--space-1) 0' }}>
                {selectedScheme.title}
              </h2>

              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                {selectedScheme.ministry} • {selectedScheme.nodalDepartment}
              </div>
            </div>

            {/* Risk & Confidence Metric Strip */}
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-4)',
                fontSize: 'var(--text-xs)'
              }}
            >
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Risk Index: </span>
                <strong style={{ color: 'var(--color-verified)' }}>{selectedScheme.riskScore}/100 (Low Risk)</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>AI Model Confidence: </span>
                <strong style={{ color: 'var(--color-primary)' }}>{selectedScheme.confidenceScore}%</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Application Fee: </span>
                <strong style={{ color: 'var(--color-verified)' }}>{selectedScheme.applicationFee}</strong>
              </div>
            </div>

            {/* Objective & Description */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                Detailed Objective
              </h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {selectedScheme.detailedObjective || selectedScheme.shortDescription}
              </p>
            </div>

            {/* Key Benefits */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                Key Benefits
              </h4>
              <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {selectedScheme.keyBenefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>

            {/* Eligibility Criteria */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                Eligibility Criteria
              </h4>
              <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {selectedScheme.eligibilityCriteria.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Official Source & Helpline */}
            <div style={{ padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-light)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <div>
                  <strong>Official Portal: </strong>
                  <a
                    href={selectedScheme.officialPortalUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                  >
                    <span>{selectedScheme.officialPortalUrl}</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
                {selectedScheme.officialHelpline && (
                  <div>
                    <strong>Toll-free Helpline: </strong>
                    <span>{selectedScheme.officialHelpline}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Known Scams / Alerts Warning if any */}
            {selectedScheme.knownScamsOrAlerts && selectedScheme.knownScamsOrAlerts.length > 0 && (
              <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-fake-bg)', border: '1px solid var(--color-fake-border)', marginBottom: 'var(--space-6)', fontSize: '11px', color: 'var(--color-fake-text)' }}>
                <strong>⚠️ Active Scam Warning:</strong>
                <ul style={{ margin: '4px 0 0', paddingLeft: 'var(--space-4)' }}>
                  {selectedScheme.knownScamsOrAlerts.map((alert, i) => (
                    <li key={i}>{alert}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer Modal Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-3)', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-4)' }}>
              <Button variant="outline" size="sm" onClick={() => setSelectedScheme(null)}>
                Close
              </Button>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<ShieldCheck size={14} />}
                onClick={() => {
                  const schemeToVerify = selectedScheme;
                  setSelectedScheme(null);
                  navigate(`/verify?q=${encodeURIComponent(schemeToVerify.title)}`);
                }}
              >
                Verify a Claim for this Scheme
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .filter-toggle-btn { display: inline-flex !important; }
        }
      `}</style>
    </PageContainer>
  );
};
