import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, Heart, AlertCircle, FileText } from 'lucide-react';
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-10)',
            marginBottom: 'var(--space-12)'
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ filter: 'brightness(0) invert(1)', marginBottom: 'var(--space-4)' }}>
              <BrandLogo showTagline={false} size="md" />
            </div>
            <p style={{ color: '#94a3b8', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
              SchemeShield AI empowers citizens, journalists, and researchers with AI verification to uncover fake, duplicate, modified, or predatory government scheme claims.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', color: '#38bdf8' }}>
              <ShieldCheck size={14} />
              <span>₹0-Cost Open Civic Architecture</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)', letterSpacing: '0.02em' }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 0 }}>
              <li>
                <Link to="/" style={{ color: '#cbd5e1', fontSize: 'var(--text-sm)' }}>
                  Home & Overview
                </Link>
              </li>
              <li>
                <Link to="/verify" style={{ color: '#cbd5e1', fontSize: 'var(--text-sm)' }}>
                  Verify a Scheme
                </Link>
              </li>
              <li>
                <Link to="/schemes" style={{ color: '#cbd5e1', fontSize: 'var(--text-sm)' }}>
                  Explore Official Schemes
                </Link>
              </li>
              <li>
                <Link to="/assistant" style={{ color: '#cbd5e1', fontSize: 'var(--text-sm)' }}>
                  SchemeShield AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/dashboard" style={{ color: '#cbd5e1', fontSize: 'var(--text-sm)' }}>
                  Citizen Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Verification Scope */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)', letterSpacing: '0.02em' }}>
              Detection Capabilities
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 0, color: '#94a3b8', fontSize: 'var(--text-sm)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#10b981' }}>✓</span> Fake Scheme & Fee Detection
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#10b981' }}>✓</span> Altered Eligibility Clustering
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#10b981' }}>✓</span> Official Gazette Cross-Matching
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#10b981' }}>✓</span> OCR Document Tampering Analysis
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#10b981' }}>✓</span> Algorithmic Threat & Confidence Scoring
              </li>
            </ul>
          </div>

          {/* Official Verification Resources */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)', letterSpacing: '0.02em' }}>
              Official Portals
            </h4>
            <p style={{ color: '#94a3b8', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-3)' }}>
              Always confirm authentic notifications directly with government repositories:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <a
                href="https://factcheck.pib.gov.in"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#38bdf8', fontSize: 'var(--text-xs)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span>PIB Fact Check Portal</span>
                <ExternalLink size={12} />
              </a>
              <a
                href="https://www.myscheme.gov.in"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#38bdf8', fontSize: 'var(--text-xs)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span>myScheme (Official Repository)</span>
                <ExternalLink size={12} />
              </a>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#38bdf8', fontSize: 'var(--text-xs)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span>National Cyber Crime Reporting</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Independent Civic Tech Disclaimer Box */}
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
            <strong style={{ color: '#f1f5f9' }}>Independent Project Disclaimer: </strong>
            SchemeShield AI is an independent, non-governmental civic research and AI technology project. It does not represent, partner with, or operate as an official Government of India agency. All risk ratings, match assessments, and confidence indices are algorithmic evaluations to assist citizens in spotting fraud. Always cross-verify critical announcements through official government gazettes.
          </p>
        </div>

        {/* Bottom copyright & status */}
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
            <span>© {new Date().getFullYear()} SchemeShield AI. Free & Open Civic Software.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <Link to="/schemes" style={{ color: '#94a3b8' }}>Directory</Link>
            <Link to="/verify" style={{ color: '#94a3b8' }}>Verification Engine</Link>
            <Link to="/assistant" style={{ color: '#94a3b8' }}>Assistant</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
