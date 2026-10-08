import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Building2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageContainer } from '../components/ui/PageContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { schemeService } from '../services/schemeService';
import { OfficialScheme } from '../types/scheme';

export const SchemesPage: React.FC = () => {
  const [schemes, setSchemes] = useState<OfficialScheme[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [cats, scms] = await Promise.all([
        schemeService.getCategories(),
        schemeService.searchSchemes(searchQuery, selectedCategory)
      ]);
      setCategories(cats);
      setSchemes(scms);
      setIsLoading(false);
    };
    loadData();
  }, [searchQuery, selectedCategory]);

  return (
    <PageContainer style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      <SectionHeading
        badge="Official Directory"
        title="Explore Verified Government Schemes"
        description="Browse legitimate Central and State welfare initiatives, official nodal portals, and known scam alerts to stay protected."
      />

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <Input
              placeholder="Search scheme name, ministry, or benefits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          <Link to="/verify">
            <Button variant="primary" leftIcon={<ShieldCheck size={16} />}>
              Verify a Suspicious Claim
            </Button>
          </Link>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--color-primary)' : 'var(--border-subtle)',
                backgroundColor: selectedCategory === cat ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                color: selectedCategory === cat ? 'var(--color-primary)' : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 'var(--space-6)'
        }}
      >
        {schemes.map((scheme) => (
          <Card key={scheme.id} variant="default" padding="lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <span className="badge badge-info" style={{ fontSize: '11px' }}>
                  {scheme.category}
                </span>
                <Badge variant="verified" size="sm">
                  {scheme.code}
                </Badge>
              </div>

              <CardTitle style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
                {scheme.title}
              </CardTitle>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                <Building2 size={13} />
                <span>{scheme.ministry}</span>
              </div>

              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                {scheme.shortDescription}
              </p>

              {/* Benefits list */}
              <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Key Benefit
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  {scheme.keyBenefits[0]}
                </div>
              </div>

              {/* Known scam alert badge if present */}
              {scheme.knownScamsOrAlerts && scheme.knownScamsOrAlerts.length > 0 && (
                <div style={{ backgroundColor: 'var(--color-fake-bg)', border: '1px solid var(--color-fake-border)', padding: '8px 12px', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-fake-text)', fontWeight: 700, fontSize: '11px' }}>
                    <ShieldAlert size={13} />
                    <span>Active Scam Alert</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-fake-text)', margin: '2px 0 0', lineHeight: 1.4 }}>
                    {scheme.knownScamsOrAlerts[0]}
                  </p>
                </div>
              )}
            </div>

            {/* Card Footer Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-light)' }}>
              <a
                href={scheme.officialPortalUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', fontWeight: 600 }}
              >
                <span>Official Portal</span>
                <ExternalLink size={12} />
              </a>

              <Link to={`/verify?q=${encodeURIComponent(scheme.title)}`}>
                <Button variant="outline" size="sm">
                  Verify a Claim
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};
