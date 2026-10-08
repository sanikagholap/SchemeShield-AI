import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Upload,
  Globe,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { PageContainer } from '../components/ui/PageContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Badge } from '../components/ui/Badge';
import { LoadingIndicator } from '../components/ui/LoadingIndicator';
import { verificationService } from '../services/verificationService';
import { VerificationMethod } from '../types/verification';

export const VerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<VerificationMethod>('TEXT');
  const [schemeName, setSchemeName] = useState('');
  const [queryText, setQueryText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQueryText(q);
    }
  }, [searchParams]);

  const handleSampleFill = (sampleType: 'tractor' | 'ayushman') => {
    if (sampleType === 'tractor') {
      setSchemeName('PM Free Tractor Scheme 2026');
      setQueryText(
        'Government is giving 50% subsidy tractors to all farmers under Kisan Nidhi. Pay ₹499 registration fee immediately at pmkisan-tractoryojana-gov.in to book your slot.'
      );
      setSourceUrl('https://pmkisan-tractoryojana-gov.in/apply');
    } else {
      setSchemeName('Ayushman Bharat Golden Card');
      setQueryText(
        'Download Ayushman Golden Card without BPL card for ₹250 instant delivery at doorstep.'
      );
      setSourceUrl('https://ayushman-card-instant-delivery.com');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeTab === 'TEXT' && !queryText.trim()) {
      setError('Please provide the scheme claim text or announcement details.');
      return;
    }

    if (activeTab === 'URL' && !sourceUrl.trim()) {
      setError('Please provide the suspicious portal URL or link.');
      return;
    }

    if (activeTab === 'DOCUMENT' && !selectedFile) {
      setError('Please select an image or PDF document for OCR verification.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await verificationService.verifySchemeText({
        schemeName: schemeName.trim() || undefined,
        queryText: queryText.trim() || sourceUrl || selectedFile?.name || 'Document Verification',
        sourceUrl: sourceUrl.trim() || undefined,
        documentFile: selectedFile,
        method: activeTab
      });

      setIsLoading(false);
      // Navigate to verification result page with state or ID
      navigate('/verification-result', { state: { result } });
    } catch {
      setIsLoading(false);
      setError('Verification could not complete. Please retry.');
    }
  };

  return (
    <PageContainer style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      <SectionHeading
        badge="AI Verification Suite"
        title="Verify Any Scheme or Welfare Claim"
        description="Cross-reference claims, WhatsApp forwards, circulars, or links against official Government gazettes and cyber threat databases."
      />

      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        {/* Method Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface-secondary)',
            padding: '4px',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-6)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <button
            type="button"
            onClick={() => { setActiveTab('TEXT'); setError(null); }}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: activeTab === 'TEXT' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'TEXT' ? 'var(--color-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'TEXT' ? 'var(--shadow-xs)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            <FileText size={16} />
            <span>Text / Message Claim</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('DOCUMENT'); setError(null); }}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: activeTab === 'DOCUMENT' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'DOCUMENT' ? 'var(--color-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'DOCUMENT' ? 'var(--shadow-xs)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Upload size={16} />
            <span>Document / OCR Image</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('URL'); setError(null); }}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: activeTab === 'URL' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'URL' ? 'var(--color-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'URL' ? 'var(--shadow-xs)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Globe size={16} />
            <span>Portal / Web Link</span>
          </button>
        </div>

        {/* Verification Form Card */}
        <Card variant="glass" padding="lg">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <Input
              label="Scheme Name (Optional)"
              placeholder="e.g. PM Kisan Samman Nidhi, Free Laptop Scheme, MUDRA Loan"
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)}
              hint="Leave blank if you're not sure of the exact title"
            />

            {activeTab === 'TEXT' && (
              <Textarea
                label="Scheme Claim Text / WhatsApp Message"
                placeholder="Paste the viral WhatsApp forward, SMS, circular text, or scheme details here..."
                rows={5}
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                hint="Include any details regarding promised subsidies, required fees, or application links."
              />
            )}

            {activeTab === 'DOCUMENT' && (
              <div className="form-group">
                <label className="form-label">Upload Circular / Pamphlet (PNG, JPG, PDF)</label>
                <div
                  style={{
                    border: '2px dashed var(--border-medium)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-8)',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-surface-secondary)',
                    cursor: 'pointer'
                  }}
                  onClick={() => document.getElementById('file-upload-input')?.click()}
                >
                  <Upload size={36} color="var(--color-primary)" style={{ margin: '0 auto var(--space-2)' }} />
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {selectedFile ? selectedFile.name : 'Click to select or drag and drop file'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    {selectedFile ? `${Math.round(selectedFile.size / 1024)} KB` : 'Supports official sanction letters, newspaper notices, and social graphics'}
                  </div>
                  <input
                    id="file-upload-input"
                    type="file"
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'URL' && (
              <Input
                label="Suspicious Portal URL / Application Link"
                placeholder="https://pmkisan-tractoryojana-gov.in"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                leftIcon={<Globe size={18} />}
                hint="We inspect domain authenticity, SSL certificate, and comparison against NIC .gov.in domains."
              />
            )}

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--color-fake-bg)',
                  border: '1px solid var(--color-fake-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-fake-text)',
                  fontSize: 'var(--text-xs)'
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Demo Pre-fills */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 'var(--space-2)'
              }}
            >
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={14} color="var(--color-brand-accent)" />
                Try quick sample scam to test:
              </span>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={() => handleSampleFill('tractor')}
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--color-primary)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  PM Free Tractor (Fake)
                </button>
                <button
                  type="button"
                  onClick={() => handleSampleFill('ayushman')}
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--color-primary)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  Ayushman Card (Phishing)
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              fullWidth
              leftIcon={<ShieldCheck size={20} />}
            >
              Run AI Verification
            </Button>
          </form>
        </Card>

        {/* Loading simulation status */}
        {isLoading && (
          <div style={{ marginTop: 'var(--space-6)' }}>
            <LoadingIndicator type="radar" label="Cross-checking against official gazettes & PIB Fact Check..." />
          </div>
        )}

        {/* Security verification guidelines */}
        <div style={{ marginTop: 'var(--space-10)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--color-verified-bg)', color: 'var(--color-verified)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              ✓
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>Genuine Portals</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Authentic portals strictly end with <code>.gov.in</code> or <code>.nic.in</code>.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--color-fake-bg)', color: 'var(--color-fake)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              ✕
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>Never Pay Upfront</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Central welfare schemes never ask for private bank deposits or UPI fees.</div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
