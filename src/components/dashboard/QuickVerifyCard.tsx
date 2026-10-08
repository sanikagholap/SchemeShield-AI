import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Upload, ArrowRight, Sparkles, FileSearch } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const QuickVerifyCard: React.FC = () => {
  const [quickClaim, setQuickClaim] = useState('');
  const navigate = useNavigate();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickClaim.trim()) {
      navigate(`/verify?q=${encodeURIComponent(quickClaim.trim())}`);
    } else {
      navigate('/verify');
    }
  };

  const handleUploadClick = () => {
    navigate('/verify?tab=document');
  };

  return (
    <Card
      variant="glass"
      padding="lg"
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(147, 197, 253, 0.45)',
        background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.6) 0%, rgba(255, 255, 255, 0.95) 100%)'
      }}
    >
      {/* Decorative accent glow */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
          filter: 'blur(25px)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
          <span
            className="badge badge-info"
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            <Sparkles size={12} style={{ marginRight: 4 }} />
            Instant Verification Engine
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
            Cross-checks PIB & Gazettes
          </span>
        </div>

        <h3
          style={{
            fontSize: 'clamp(1.25rem, 2.5vw, 1.6rem)',
            fontWeight: 800,
            color: 'var(--color-brand-navy)',
            lineHeight: 1.25,
            marginBottom: 'var(--space-2)',
            letterSpacing: '-0.02em'
          }}
        >
          Verify a Government Scheme
        </h3>

        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            lineHeight: 1.6,
            marginBottom: 'var(--space-5)'
          }}
        >
          Paste scheme information or upload a document to check for suspicious, duplicate, or modified content before sharing details or paying fees.
        </p>

        {/* Quick Input Bar Form */}
        <form
          onSubmit={handleVerify}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            alignItems: 'center'
          }}
        >
          <div style={{ flex: 1, minWidth: '280px' }}>
            <input
              type="text"
              value={quickClaim}
              onChange={(e) => setQuickClaim(e.target.value)}
              placeholder="Paste scheme claim, WhatsApp forward, or portal URL..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-medium)',
                backgroundColor: '#ffffff',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-xs)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<ShieldCheck size={16} />}
            >
              Verify Now
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleUploadClick}
              leftIcon={<Upload size={16} />}
            >
              Upload Document
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};
