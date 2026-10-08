import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export interface AuthLayoutProps {
  children: React.ReactNode;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1080px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-2xl)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden'
      }}
    >
      {/* Left Column: Premium Security & Trust Branding Side */}
      <div
        style={{
          backgroundColor: 'var(--color-brand-navy)',
          color: '#ffffff',
          padding: 'clamp(2rem, 5vw, 3.5rem)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Soft background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-20%',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, transparent 70%)',
            filter: 'blur(45px)',
            pointerEvents: 'none'
          }}
        />

        {/* Top Branding */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ filter: 'brightness(0) invert(1)', marginBottom: 'var(--space-8)' }}>
            <BrandLogo showTagline size="md" />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 600,
              color: '#38bdf8',
              marginBottom: 'var(--space-4)'
            }}
          >
            <Sparkles size={13} />
            <span>AI-Powered Citizen Protection</span>
          </div>

          <h2
            style={{
              color: '#ffffff',
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: 'var(--space-4)',
              letterSpacing: '-0.02em'
            }}
          >
            Verify government schemes before you trust.
          </h2>

          <p style={{ color: '#94a3b8', fontSize: 'var(--text-sm)', lineHeight: 1.6, margin: 0, maxWidth: '380px' }}>
            Identify deceptive welfare claims, verify registration fee rules, and cross-reference announcements against authentic Gazettes.
          </p>
        </div>

        {/* Central 2.5D Security Shield Graphic */}
        <div
          style={{
            position: 'relative',
            height: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 'var(--space-6) 0'
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '1px dashed rgba(56, 189, 248, 0.4)',
              animation: 'spin 18s linear infinite'
            }}
          />
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 24px rgba(29, 78, 216, 0.4)',
              zIndex: 2
            }}
          >
            <ShieldCheck size={38} strokeWidth={2.2} />
          </div>
        </div>

        {/* Bottom Trust Indicators List */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', paddingTop: 'var(--space-4)', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: '#cbd5e1' }}>
            <CheckCircle2 size={15} color="#10b981" />
            <span>100% Free Open Civic Architecture (₹0 Cost)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: '#cbd5e1' }}>
            <CheckCircle2 size={15} color="#10b981" />
            <span>PIB Fact Check & Official Gazette Cross-Referenced</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: '#cbd5e1' }}>
            <Lock size={15} color="#38bdf8" />
            <span>Zero Logged Personal Data · Non-invasive</span>
          </div>
        </div>
      </div>

      {/* Right Column: Form Side */}
      <div
        style={{
          padding: 'clamp(2rem, 5vw, 3.5rem)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        {children}
      </div>
    </div>
  );
};
