import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  FileSearch,
  ScanLine,
  Database,
  BarChart3,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Search,
  ExternalLink,
  Lock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageContainer } from '../components/ui/PageContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { StatCard } from '../components/common/StatCard';

export const LandingPage: React.FC = () => {
  const [quickQuery, setQuickQuery] = useState('');
  const navigate = useNavigate();

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/verify?q=${encodeURIComponent(quickQuery.trim())}`);
    } else {
      navigate('/verify');
    }
  };

  const featureCards = [
    {
      icon: <ShieldAlert size={24} color="var(--color-fake)" />,
      badge: 'Fraud Prevention',
      title: 'Fake Scheme Detection',
      description: 'Automatically flags non-existent government programs, spoofed scheme names, and malicious clone domains asking for registration money.'
    },
    {
      icon: <FileSearch size={24} color="var(--color-primary)" />,
      badge: 'NLP Clustering',
      title: 'Duplicate & Alteration Detection',
      description: 'Identifies genuine schemes whose benefits, eligibility, or application criteria have been altered or exaggerated on social media.'
    },
    {
      icon: <ScanLine size={24} color="var(--color-brand-accent)" />,
      badge: 'Vision AI',
      title: 'OCR Document Analysis',
      description: 'Upload viral pamphlets, WhatsApp circulars, or PDF sanction letters to detect doctored typography, spoofed stamps, and manipulated text.'
    },
    {
      icon: <Database size={24} color="var(--color-verified)" />,
      badge: 'Gazette Verified',
      title: 'Official-Source Cross-Referencing',
      description: 'Real-time semantic cross-referencing against authentic PIB fact checks, Ministry portals (.gov.in/.nic.in), and central gazettes.'
    },
    {
      icon: <BarChart3 size={24} color="#7c3aed" />,
      badge: 'Transparency',
      title: 'Risk & Confidence Score',
      description: 'Get an explainable 0–100 Threat Index along with algorithmic confidence ratings and clear evidence snippets showing why a claim is flagged.'
    },
    {
      icon: <Bot size={24} color="#0891b2" />,
      badge: 'Civil Guide',
      title: 'Citizen AI Assistant',
      description: 'Ask plain-language questions about welfare eligibility, official application channels, fee rules, and how to stay safe from cyber fraudsters.'
    }
  ];

  const workflowSteps = [
    {
      number: '01',
      title: 'Submit Information',
      description: 'Paste viral text, enter a scheme claim, submit a suspicious URL, or upload a circular image/PDF.',
      icon: <Upload size={20} color="var(--color-primary)" />
    },
    {
      number: '02',
      title: 'AI & NLP Analysis',
      description: 'Deep neural models analyze the text structure, extract financial demand patterns, and identify manipulated clauses.',
      icon: <Sparkles size={20} color="var(--color-brand-accent)" />
    },
    {
      number: '03',
      title: 'Official Gazette Verification',
      description: 'Claims are cross-checked against authentic Ministry records, PIB advisories, and authorized .gov.in endpoints.',
      icon: <Database size={20} color="var(--color-verified)" />
    },
    {
      number: '04',
      title: 'Evidence-Based Risk Result',
      description: 'Receive an immediate verdict: Risk Index (0-100), verified status badge, discrepancy flags, and safety guidelines.',
      icon: <ShieldCheck size={20} color="#7c3aed" />
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-20)', paddingBottom: 'var(--space-20)' }}>
      {/* ----------------------------------------------------------------------
         HERO SECTION
         ---------------------------------------------------------------------- */}
      <section
        style={{
          paddingTop: 'var(--space-16)',
          paddingBottom: 'var(--space-12)',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="bg-radial-gradient bg-tech-grid"
      >
        <PageContainer>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'var(--space-12)',
              alignItems: 'center'
            }}
          >
            {/* Hero Left Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>
                <span
                  className="badge badge-info"
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-full)',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <Sparkles size={13} style={{ marginRight: 4 }} />
                  Next-Gen Civic Fraud Defense
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-tertiary)',
                    fontWeight: 600
                  }}
                >
                  ₹0 Free Open Access
                </span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
                  fontWeight: 800,
                  color: 'var(--color-brand-navy)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em'
                }}
              >
                Verify Government Schemes{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #1D4ED8 0%, #0284C7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Before You Trust.
                </span>
              </h1>

              <p
                style={{
                  fontSize: 'var(--text-lg)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  maxWidth: '560px',
                  margin: 0
                }}
              >
                SchemeShield AI helps citizens, grassroot workers, and researchers analyze potentially fake, duplicate, modified, or suspicious welfare schemes. Protect your family and community from unauthorized registration fees and cyber scams.
              </p>

              {/* Quick Verification Search Box */}
              <form
                onSubmit={handleQuickVerify}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '6px',
                  boxShadow: 'var(--shadow-lg)',
                  maxWidth: '580px',
                  width: '100%'
                }}
              >
                <div style={{ paddingLeft: 'var(--space-3)', color: 'var(--text-tertiary)' }}>
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  placeholder="Paste scheme claim, WhatsApp text, or scheme name..."
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    padding: 'var(--space-3)',
                    fontSize: 'var(--text-sm)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)'
                  }}
                />
                <Button type="submit" variant="primary" size="md">
                  Verify Now
                </Button>
              </form>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'center' }}>
                <Link to="/verify">
                  <Button variant="primary" size="lg" leftIcon={<ShieldCheck size={18} />}>
                    Verify a Scheme
                  </Button>
                </Link>
                <Link to="/schemes">
                  <Button variant="outline" size="lg" rightIcon={<ArrowRight size={16} />}>
                    Explore Schemes
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap', paddingTop: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} color="var(--color-verified)" />
                  <span>No login required for verification</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} color="var(--color-verified)" />
                  <span>Official .gov.in Cross-Referencing</span>
                </div>
              </div>
            </div>

            {/* Hero Right: Visually Impressive Interactive Security Visual */}
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              {/* Outer decorative glow */}
              <div
                style={{
                  position: 'absolute',
                  width: '320px',
                  height: '320px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(2, 132, 199, 0.05) 70%, transparent 100%)',
                  filter: 'blur(30px)',
                  zIndex: 0
                }}
              />

              {/* Main Central Shield Presentation Card */}
              <div
                className="card card-glass"
                style={{
                  width: '100%',
                  maxWidth: '460px',
                  padding: 'var(--space-6)',
                  borderRadius: 'var(--radius-2xl)',
                  boxShadow: 'var(--shadow-2xl)',
                  position: 'relative',
                  zIndex: 1,
                  border: '1px solid rgba(226, 232, 240, 0.9)'
                }}
              >
                {/* Header of Security Card */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981', animation: 'pulseGlow 2s infinite' }} />
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Real-time AI Verification Core
                    </span>
                  </div>
                  <Badge variant="verified" size="sm" hasDot>
                    Online v2.4
                  </Badge>
                </div>

                {/* Central Security Shield Element */}
                <div
                  style={{
                    position: 'relative',
                    height: '210px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: 'var(--space-4) 0'
                  }}
                >
                  {/* Subtle pulsing AI ring */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '190px',
                      height: '190px',
                      borderRadius: '50%',
                      border: '2px dashed #93c5fd',
                      animation: 'spin 20s linear infinite'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(239, 246, 255, 0.7)',
                      boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)'
                    }}
                  />

                  {/* Shield graphic */}
                  <div
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: 'var(--radius-xl)',
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 12px 24px rgba(29, 78, 216, 0.35)',
                      zIndex: 2
                    }}
                  >
                    <ShieldCheck size={52} strokeWidth={2.2} />
                  </div>

                  {/* Floating Telemetry Tag 1 (Top Right) */}
                  <div
                    className="card card-glass"
                    style={{
                      position: 'absolute',
                      top: '0px',
                      right: '-10px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-md)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      zIndex: 3
                    }}
                  >
                    <CheckCircle2 size={16} color="var(--color-verified)" />
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>Official Gazette</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-verified)', fontWeight: 600 }}>Matched 100%</div>
                    </div>
                  </div>

                  {/* Floating Telemetry Tag 2 (Bottom Left) */}
                  <div
                    className="card card-glass"
                    style={{
                      position: 'absolute',
                      bottom: '0px',
                      left: '-10px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-md)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      zIndex: 3
                    }}
                  >
                    <AlertTriangle size={16} color="var(--color-fake)" />
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>Fee Demand</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-fake)', fontWeight: 600 }}>0 Tolerance</div>
                    </div>
                  </div>
                </div>

                {/* Simulated Verification Card Preview */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                      SAMPLE DETECTION RESULT
                    </span>
                    <Badge variant="fake" size="sm">
                      94% THREAT
                    </Badge>
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Fake "PM Free Tractor 2026" Scam
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '8px', lineHeight: 1.4 }}>
                    Unauthorized ₹499 fee demand detected on fraudulent domain <code>pmkisan-tractoryojana-gov.in</code>.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    <span>PIB Advisory #841</span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Confidence: 98.4%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ----------------------------------------------------------------------
         PLATFORM IMPACT / TELEMETRY METRICS
         ---------------------------------------------------------------------- */}
      <section>
        <PageContainer>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            <StatCard
              label="Verification Accuracy"
              value="99.4%"
              helper="Benchmarked against PIB archives"
              trend={{ value: "+2.1%", isPositive: true }}
              icon={<ShieldCheck size={20} />}
            />
            <StatCard
              label="Fraudulent Claims Caught"
              value="14,280+"
              helper="Fake schemes & altered circulars"
              trend={{ value: "Live Index", isPositive: true }}
              icon={<ShieldAlert size={20} />}
            />
            <StatCard
              label="Official Schemes Mapped"
              value="480+"
              helper="Central & State nodal programs"
              trend={{ value: "100% Free", isPositive: true }}
              icon={<Database size={20} />}
            />
            <StatCard
              label="Citizen Cost"
              value="₹0.00"
              helper="100% Free open public resource"
              trend={{ value: "Always Free", isPositive: true }}
              icon={<Lock size={20} />}
            />
          </div>
        </PageContainer>
      </section>

      {/* ----------------------------------------------------------------------
         HOW IT WORKS (4 STEPS)
         ---------------------------------------------------------------------- */}
      <section style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: 'var(--space-16) 0' }}>
        <PageContainer>
          <SectionHeading
            badge="Process Workflow"
            title="How SchemeShield AI Verifies"
            description="Our multi-stage verification pipeline analyzes text claims, cross-references official gazettes, and flags predatory discrepancies in seconds."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--space-6)',
              position: 'relative'
            }}
          >
            {workflowSteps.map((step) => (
              <Card key={step.number} variant="default" padding="md" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--color-primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {step.icon}
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 800,
                      color: 'var(--border-medium)'
                    }}
                  >
                    {step.number}
                  </span>
                </div>
                <CardTitle style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
                  {step.title}
                </CardTitle>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  {step.description}
                </p>
              </Card>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
            <Link to="/verify">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                Test Scheme Verification Engine
              </Button>
            </Link>
          </div>
        </PageContainer>
      </section>

      {/* ----------------------------------------------------------------------
         FEATURE CARDS (6 CORE CAPABILITIES)
         ---------------------------------------------------------------------- */}
      <section>
        <PageContainer>
          <SectionHeading
            badge="Core Technology"
            title="Engineered for Citizen Protection"
            description="Sophisticated AI models trained to spot linguistic deception, fraudulent domain architecture, and fake application requirements."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            {featureCards.map((feat) => (
              <Card key={feat.title} variant="interactive" padding="lg">
                <CardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 'var(--radius-xl)',
                        backgroundColor: 'var(--bg-surface-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {feat.icon}
                    </div>
                    <Badge variant="neutral" size="sm">
                      {feat.badge}
                    </Badge>
                  </div>
                  <CardTitle>{feat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {feat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ----------------------------------------------------------------------
         CTA BANNER
         ---------------------------------------------------------------------- */}
      <section>
        <PageContainer>
          <div
            style={{
              backgroundColor: 'var(--color-brand-navy)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'clamp(2.5rem, 5vw, 4rem)',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-2xl)'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-50%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '600px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
                filter: 'blur(50px)',
                pointerEvents: 'none'
              }}
            />

            <Badge variant="info" size="md" style={{ marginBottom: 'var(--space-4)' }}>
              Independent Civil Tech · 100% Free
            </Badge>

            <h2
              style={{
                color: '#ffffff',
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                fontWeight: 800,
                maxWidth: '700px',
                lineHeight: 1.2,
                marginBottom: 'var(--space-4)'
              }}
            >
              Spot the Scam Before Paying Any Registration Fee
            </h2>

            <p
              style={{
                color: '#cbd5e1',
                fontSize: 'var(--text-base)',
                maxWidth: '600px',
                lineHeight: 1.6,
                marginBottom: 'var(--space-8)'
              }}
            >
              Verify WhatsApp forwards, PDF circulars, and SMS links with zero sign-up friction. Protect your family and fellow citizens today.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', justifyContent: 'center' }}>
              <Link to="/verify">
                <Button variant="primary" size="lg" leftIcon={<ShieldCheck size={20} />}>
                  Start Free Verification
                </Button>
              </Link>
              <Link to="/assistant">
                <Button variant="outline" size="lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }} rightIcon={<ChevronRight size={18} />}>
                  Ask AI Assistant
                </Button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
};
