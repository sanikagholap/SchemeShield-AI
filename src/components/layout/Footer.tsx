import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, AlertCircle, Sparkles } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-brand-navy)',
        color: '#f8fafc',
        borderTop: '1px solid #1e293b',
        marginTop: 'auto',
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-8)'
      }}
    >
      <div className="container">
        {/* Main Footer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-10)',
            marginBottom: 'var(--space-12)'
          }}
        >
          {/* Brand Info */}
          <div style={{ maxWidth: '340px' }}>
            <div style={{ filter: 'brightness(0) invert(1)', marginBottom: 'var(--space-4)' }}>
              <BrandLogo showTagline={false} size="md" />
            </div>
            <p style={{ color: '#94a3b8', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
              SchemeShield AI helps citizens verify suspicious, duplicate, and potentially fake government-scheme information using AI verification and trusted official sources.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '11px', color: '#38bdf8' }}>
              <Sparkles size={13} />
              <span>₹0-Cost Open Civic Technology</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)' }}>
              Product
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 0 }}>
              <li>
                <Link to="/verify" style={{ color: '#cbd5e1', fontSize: 'var(--text-sm)', transition: 'color 0.15s' }}>
                  Verify Scheme
                </Link>
              </li>
              <li>
                <Link to="/schemes" style={{ color: '#cbd5e1', fontSize: 'var(--text-sm)', transition: 'color 0.15s' }}>
                  Explore Schemes
                </Link>
              </li>
              <li>
                <Link to="/assistant" style={{ color: '#cbd5e1', fontSize: 'var(--text-sm)', transition: 'color 0.15s' }}>
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/dashboard" style={{ color: '#cbd5e1', fontSize: 'var(--text-sm)', transition: 'color 0.15s' }}>
                  Citizen Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)' }}>
              Resources
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 0 }}>
              <li>
                <a href="#how-it-works" style={{ color: '#cbd5e1', fontSize: 'var(--text-sm)', transition: 'color 0.15s' }}>
                  How It Works
                </a>
              </li>
              <li>
                <Link to="/history" style={{ color: '#cbd5e1', fontSize: 'var(--text-sm)', transition: 'color 0.15s' }}>
                  Verification History
                </Link>
              </li>
              <li>
                <a
                  href="https://factcheck.pib.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#38bdf8', fontSize: 'var(--text-sm)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>PIB Fact Check</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#38bdf8', fontSize: 'var(--text-sm)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Cyber Crime Reporting</span>
                  <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)' }}>
              Legal & Safety
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 0 }}>
              <li>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Privacy Notice: SchemeShield AI stores zero personal identifiers and does not sell or share citizen scan queries.'); }} style={{ color: '#cbd5e1', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
                  Privacy
                </a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms: SchemeShield AI is an algorithmic assistance prototype provided for educational and civic scam identification purposes.'); }} style={{ color: '#cbd5e1', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
                  Terms
                </a>
              </li>
              <li>
                <span style={{ fontSize: 'var(--text-xs)', color: '#94a3b8' }}>
                  Open-Access Civic License
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Clear Independent Technology Prototype Statement */}
        <div
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid #334155',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4) var(--space-5)',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-3)'
          }}
        >
          <AlertCircle size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: 'var(--text-xs)', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
            <strong style={{ color: '#f1f5f9' }}>Independent Project Statement: </strong>
            SchemeShield AI is an independent technology prototype and is not an official government website. It is not affiliated with, authorized by, or endorsed by the Government of India or any state government. Verification results, threat indices, and confidence metrics are algorithmic evaluations designed to assist citizens in identifying potential fraud. Always confirm critical scheme requirements directly with official government gazettes.
          </p>
        </div>

        {/* Bottom copyright & tagline */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid #1e293b',
            fontSize: 'var(--text-xs)',
            color: '#64748b'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span>© {new Date().getFullYear()} SchemeShield AI. All rights reserved.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', color: '#94a3b8', fontStyle: 'italic' }}>
            "Verify Before You Trust."
          </div>
        </div>
      </div>
    </footer>
  );
};
