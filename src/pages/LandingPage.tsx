import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ScanLine,
  Database,
  BarChart3,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Search,
  ExternalLink,
  Sparkles,
  Brain,
  Lock,
  Layers,
  Info
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageContainer } from '../components/ui/PageContainer';
import { SectionHeading } from '../components/ui/SectionHeading';

export const LandingPage: React.FC = () => {
  const [quickQuery, setQuickQuery] = useState('');
  const [previewTab, setPreviewTab] = useState<'genuine' | 'scam'>('genuine');
  const [selectedAiPrompt, setSelectedAiPrompt] = useState<string>('Is this scholarship genuine?');
  const navigate = useNavigate();

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/verify?q=${encodeURIComponent(quickQuery.trim())}`);
    } else {
      navigate('/verify');
    }
  };

  // AI assistant preview responses based on selected question
  const aiChatData: Record<string, {
    userQuery: string;
    aiResponse: string;
    evidenceTitle: string;
    evidenceUrl: string;
    evidenceNote: string;
  }> = {
    'Is this scholarship genuine?': {
      userQuery: 'Is this scholarship genuine?',
      aiResponse: 'Legitimate central and state scholarships are listed exclusively on the **National Scholarship Portal (scholarships.gov.in)** or verified state portals. Genuine government scholarship schemes **NEVER charge an upfront application or processing fee**. If you are asked to pay money to receive a scholarship grant, it is almost certainly fraudulent.',
      evidenceTitle: 'National Scholarship Portal (NSP)',
      evidenceUrl: 'https://scholarships.gov.in',
      evidenceNote: 'Official centralized repository for Ministry of Minority Affairs, Social Justice, and Department of Higher Education.'
    },
    'Which schemes am I eligible for?': {
      userQuery: 'Which schemes am I eligible for?',
      aiResponse: 'Eligibility for government schemes depends on key demographic and socio-economic criteria such as state of residence, age, landholding status, occupation, and annual family income. You can explore verified categories in our Scheme Directory or use official portals like **myScheme.gov.in**.',
      evidenceTitle: 'myScheme Citizen Eligibility Portal',
      evidenceUrl: 'https://www.myscheme.gov.in',
      evidenceNote: 'Authorized digital initiative providing single-window access to all government benefit criteria.'
    },
    'Why was this scheme marked suspicious?': {
      userQuery: 'Why was this scheme marked suspicious?',
      aiResponse: 'A scheme claim is marked **Suspicious** or **High Risk** when our algorithmic verification detects: (1) An upfront registration fee demanded via UPI or private bank, (2) A non-governmental domain without `.gov.in` or `.nic.in`, (3) Altered subsidy amounts that do not match the official Gazette notification, or (4) Active advisories issued by PIB Fact Check.',
      evidenceTitle: 'PIB Fact Check Advisory Registry',
      evidenceUrl: 'https://factcheck.pib.gov.in',
      evidenceNote: 'Press Information Bureau public advisory bulletins against trending welfare misinformation.'
    },
    'How can I verify this information?': {
      userQuery: 'How can I verify this information?',
      aiResponse: 'To verify safely: (1) Paste the text claim or link directly into the **SchemeShield Verification Engine**, (2) Check if the application domain ends strictly with `.gov.in` or `.nic.in`, (3) Confirm that no private payment is requested, and (4) Cross-check with your local Gram Panchayat or authorized CSC center.',
      evidenceTitle: 'National Portal of India',
      evidenceUrl: 'https://india.gov.in',
      evidenceNote: 'Central directory for all official Union and State Ministry websites and gazettes.'
    }
  };

  const currentChat = aiChatData[selectedAiPrompt] || aiChatData['Is this scholarship genuine?'];

  const trustStripItems = [
    {
      icon: <Brain size={22} color="var(--color-primary)" />,
      title: 'AI Analysis',
      description: 'Pattern matching across welfare criteria and benefit models'
    },
    {
      icon: <Sparkles size={22} color="var(--color-brand-accent)" />,
      title: 'NLP Detection',
      description: 'Identifies predatory language, fake deadlines, and demand triggers'
    },
    {
      icon: <ScanLine size={22} color="#7c3aed" />,
      title: 'OCR Analysis',
      description: 'Automated document tampering & typography inspection'
    },
    {
      icon: <Database size={22} color="var(--color-verified)" />,
      title: 'Official Source Verification',
      description: 'Cross-checks against authentic .gov.in gazettes & PIB records'
    }
  ];

  const workflowSteps = [
    {
      number: '01',
      title: 'Submit Information',
      description: 'Paste viral text, enter a scheme claim, submit a portal link, or upload a circular image/PDF.',
      icon: <Upload size={20} color="var(--color-primary)" />
    },
    {
      number: '02',
      title: 'AI Analysis',
      description: 'NLP and semantic models parse claims, extract fee requests, and identify altered clauses.',
      icon: <Brain size={20} color="var(--color-brand-accent)" />
    },
    {
      number: '03',
      title: 'Official Source Check',
      description: 'Claims are cross-checked against authentic Ministry records, PIB alerts, and authorized .gov.in portals.',
      icon: <Database size={20} color="var(--color-verified)" />
    },
    {
      number: '04',
      title: 'Risk & Confidence Result',
      description: 'Get an immediate verdict: 0–100 Threat Index, verified status badge, discrepancy flags, and guidance.',
      icon: <ShieldCheck size={20} color="#7c3aed" />
    }
  ];

  const featureCards = [
    {
      icon: <ShieldAlert size={26} color="var(--color-fake)" />,
      badge: 'Fraud Detection',
      title: 'Fake Scheme Detection',
      description: 'Detect potentially suspicious scheme information, spoofed names, and non-existent programs designed to steal money.'
    },
    {
      icon: <Layers size={26} color="var(--color-primary)" />,
      badge: 'NLP Clustering',
      title: 'Duplicate Scheme Detection',
      description: 'Compare scheme information to identify potentially duplicated schemes, altered eligibility terms, or exaggerated claims.'
    },
    {
      icon: <ScanLine size={26} color="var(--color-brand-accent)" />,
      badge: 'Vision OCR',
      title: 'OCR Document Analysis',
      description: 'Analyze uploaded scheme documents, viral WhatsApp circulars, or newspaper notices for spoofed seals and tampering.'
    },
    {
      icon: <Database size={26} color="var(--color-verified)" />,
      badge: 'Gazette Verified',
      title: 'Official Source Verification',
      description: 'Compare information against trusted official sources including PIB Fact Check and authentic .gov.in/.nic.in registries.'
    },
    {
      icon: <BarChart3 size={26} color="#7c3aed" />,
      badge: 'Threat Index',
      title: 'Risk & Confidence Score',
      description: 'Present an understandable verification score with transparent evidence snippets and algorithmic confidence ratings.'
    },
    {
      icon: <Bot size={26} color="#0891b2" />,
      badge: 'Citizen Guide',
      title: 'AI Assistant',
      description: 'Help users understand schemes, eligibility criteria, upfront fee rules, and how to verify questionable announcements.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-20)', paddingBottom: 'var(--space-20)' }}>
      {/* ----------------------------------------------------------------------
         1. HERO SECTION & HERO 3D VISUAL & BACKGROUND
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
        {/* Subtle decorative background glow nodes */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '5%',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '8%',
            width: '340px',
            height: '340px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(2, 132, 199, 0.07) 0%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }}
        />

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
              {/* Trust/Status Indicator */}
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
                  AI-Powered Scheme Verification
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-tertiary)',
                    fontWeight: 600
                  }}
                >
                  ₹0 Open Civic Platform
                </span>
              </div>

              {/* Main Heading */}
              <h1
                style={{
                  fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
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

              {/* Supporting Text */}
              <p
                style={{
                  fontSize: 'var(--text-lg)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  maxWidth: '560px',
                  margin: 0
                }}
              >
                SchemeShield AI helps you analyze suspicious, duplicate and potentially fake government-scheme information using AI-powered verification and trusted official sources.
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
                  placeholder="Paste scheme claim, WhatsApp forward, or scheme title..."
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
                  <span>Authentic .gov.in Cross-Referencing</span>
                </div>
              </div>

              {/* Public Platform Notice */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  backgroundColor: 'rgba(30, 41, 59, 0.04)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                  maxWidth: '540px'
                }}
              >
                <Info size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Public Notice:</strong> SchemeShield AI is an independent verification platform and is not an official government website.
                </span>
              </div>
            </div>

            {/* Hero Right: 3D AI Verification Centerpiece */}
            <div className="hero-visual-stage">
              {/* Outer ambient glow */}
              <div
                style={{
                  position: 'absolute',
                  width: '380px',
                  height: '380px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(37, 99, 235, 0.16) 0%, rgba(2, 132, 199, 0.04) 70%, transparent 100%)',
                  filter: 'blur(36px)',
                  zIndex: 0
                }}
              />

              {/* Main 3D Console Presentation Card */}
              <div
                className="hero-main-card card card-glass"
                style={{
                  width: '100%',
                  maxWidth: '470px',
                  padding: 'var(--space-6)',
                  borderRadius: 'var(--radius-2xl)',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {/* Header bar of 3D Card */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', animation: 'pulseGlow 2s infinite' }} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      AI Verification Engine
                    </span>
                  </div>
                  <Badge variant="neutral" size="sm">
                    Interactive Preview
                  </Badge>
                </div>

                {/* Central Security Shield & Scanning Ring Assembly */}
                <div
                  style={{
                    position: 'relative',
                    height: '220px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: 'var(--space-4) 0'
                  }}
                >
                  {/* Concentric Rotating Orbit Rings */}
                  <div
                    className="rotating-orbit-ring"
                    style={{
                      position: 'absolute',
                      width: '200px',
                      height: '200px',
                      borderRadius: '50%',
                      border: '1.5px dashed rgba(59, 130, 246, 0.45)',
                      pointerEvents: 'none'
                    }}
                  />
                  <div
                    className="counter-orbit-ring"
                    style={{
                      position: 'absolute',
                      width: '160px',
                      height: '160px',
                      borderRadius: '50%',
                      border: '1px solid rgba(2, 132, 199, 0.25)',
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Radar pulse beam */}
                  <div className="scan-radar-beam" />

                  {/* Soft central glow backdrop */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '130px',
                      height: '130px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(239, 246, 255, 0.85)',
                      boxShadow: '0 0 35px rgba(37, 99, 235, 0.25)'
                    }}
                  />

                  {/* Central Security Shield Element */}
                  <div
                    style={{
                      width: '92px',
                      height: '92px',
                      borderRadius: 'var(--radius-xl)',
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 14px 28px rgba(29, 78, 216, 0.35)',
                      zIndex: 2,
                      transform: 'translateZ(20px)'
                    }}
                  >
                    <ShieldCheck size={50} strokeWidth={2.2} />
                  </div>

                  {/* Floating Telemetry Card 1 (Top Right) */}
                  <div
                    className="floating-pill card card-glass"
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-8px',
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
                      <div style={{ fontSize: '10px', color: 'var(--color-verified)', fontWeight: 600 }}>100% Match</div>
                    </div>
                  </div>

                  {/* Floating Telemetry Card 2 (Bottom Left) */}
                  <div
                    className="floating-pill-delayed card card-glass"
                    style={{
                      position: 'absolute',
                      bottom: '-6px',
                      left: '-8px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-md)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      zIndex: 3
                    }}
                  >
                    <Lock size={15} color="var(--color-primary)" />
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>Fee Demands</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-verified)', fontWeight: 600 }}>0 Detected</div>
                    </div>
                  </div>
                </div>

                {/* Centerpiece Visual Information Strip */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)',
                    border: '1px solid var(--border-light)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 'var(--space-3)',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ padding: '4px', borderRight: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      AI CONFIDENCE
                    </div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-primary)', marginTop: '2px' }}>
                      94%
                    </div>
                  </div>

                  <div style={{ padding: '4px', borderRight: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      STATUS
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-verified)', marginTop: '4px' }}>
                      VERIFIED
                    </div>
                  </div>

                  <div style={{ padding: '4px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      SOURCE
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.2 }}>
                      Official Portal
                    </div>
                  </div>
                </div>

                {/* Subtext note clarifying mockup */}
                <div style={{ marginTop: 'var(--space-3)', textAlign: 'center', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  Interactive visual product preview — simulated verification model
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ----------------------------------------------------------------------
         2. TRUST STRIP (Immediately Below Hero)
         ---------------------------------------------------------------------- */}
      <section>
        <PageContainer>
          <div className="trust-strip-container">
            {trustStripItems.map((item) => (
              <div key={item.title} className="trust-strip-item">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ----------------------------------------------------------------------
         3. HOW IT WORKS (Connected 4-Step Pipeline)
         ---------------------------------------------------------------------- */}
      <section id="how-it-works" style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: 'var(--space-16) 0' }}>
        <PageContainer>
          <SectionHeading
            badge="Process Workflow"
            title="How SchemeShield AI Works"
            description="From suspicious information to an evidence-based verification result."
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
              <div key={step.number} className="workflow-step-card">
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
                  <span className="workflow-step-badge">
                    {step.number}
                  </span>
                </div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
            <Link to="/verify">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                Verify a Scheme Now
              </Button>
            </Link>
          </div>
        </PageContainer>
      </section>

      {/* ----------------------------------------------------------------------
         4. FEATURE SECTION (6 Core Feature Cards)
         ---------------------------------------------------------------------- */}
      <section>
        <PageContainer>
          <SectionHeading
            badge="Platform Capabilities"
            title="Everything You Need to Verify a Scheme"
            description="Engineered to protect citizens from deceptive welfare announcements, altered eligibility guidelines, and unauthorized fee demands."
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
                        width: 50,
                        height: 50,
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
         5. LIVE-STYLE VERIFICATION PREVIEW (Realistic Embedded App Interface)
         ---------------------------------------------------------------------- */}
      <section style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: 'var(--space-16) 0' }}>
        <PageContainer>
          <SectionHeading
            badge="Live Demonstration"
            title="See What Verification Looks Like"
            description="Experience our evidence breakdown interface comparing genuine government schemes against predatory fraud claims."
          />

          {/* Interactive Toggle Pill */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-full)',
                padding: '4px',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <button
                type="button"
                onClick={() => setPreviewTab('genuine')}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: previewTab === 'genuine' ? 'var(--color-primary)' : 'transparent',
                  color: previewTab === 'genuine' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                Sample 1: Genuine Scholarship Scheme
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('scam')}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: previewTab === 'scam' ? 'var(--color-fake)' : 'transparent',
                  color: previewTab === 'scam' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                Sample 2: PM Free Tractor Scam (Flagged)
              </button>
            </div>
          </div>

          {/* Realistic Application Window Container */}
          <div className="mock-window-frame" style={{ maxWidth: '920px', margin: '0 auto' }}>
            {/* Titlebar with window control dots */}
            <div className="mock-window-titlebar">
              <div className="mock-window-dots">
                <span className="mock-dot" style={{ backgroundColor: '#ef4444' }} />
                <span className="mock-dot" style={{ backgroundColor: '#f59e0b' }} />
                <span className="mock-dot" style={{ backgroundColor: '#10b981' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: '8px', fontWeight: 600 }}>
                  SchemeShield AI Analysis Console · Verification Report #{previewTab === 'genuine' ? 'SCH-2041' : 'TRC-9942'}
                </span>
              </div>
              <Badge variant={previewTab === 'genuine' ? 'verified' : 'fake'} size="sm">
                Interactive Preview
              </Badge>
            </div>

            {/* Window Content Body */}
            <div style={{ padding: 'var(--space-8)' }}>
              {previewTab === 'genuine' ? (
                /* Genuine Scheme Mockup View */
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-verified)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        VERIFIED GENUINE SCHEME
                      </div>
                      <h3 style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-primary)', marginTop: '4px' }}>
                        Sample Government Scholarship Scheme
                      </h3>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                        Ministry of Social Justice & Empowerment · Central Sector Scheme
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                      <div style={{ textAlign: 'right', padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-verified-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-verified-border)' }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-verified-text)', fontWeight: 700 }}>
                          AI CONFIDENCE
                        </div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-verified)' }}>
                          91%
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                          RISK SCORE
                        </div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-verified)' }}>
                          18<span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>/100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4 Analysis Checks Checklist */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                      <CheckCircle2 size={16} color="var(--color-verified)" />
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>Scheme Information Matched</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                      <CheckCircle2 size={16} color="var(--color-verified)" />
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>Duplicate Check Clear</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                      <CheckCircle2 size={16} color="var(--color-verified)" />
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>NLP Analysis Passed</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                      <CheckCircle2 size={16} color="var(--color-verified)" />
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>Official Source Check Matched</span>
                    </div>
                  </div>

                  {/* Status & Evidence Section */}
                  <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        VERDICT STATUS: LIKELY GENUINE
                      </span>
                      <Badge variant="verified" size="sm">
                        Zero Fee Demand
                      </Badge>
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      Official source information available on <code>scholarships.gov.in</code>. All application processes are free of cost and managed strictly through authorized nodal institutions.
                    </p>
                  </div>
                </div>
              ) : (
                /* Scam Scheme Mockup View */
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-fake)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        CRITICAL THREAT DETECTED
                      </div>
                      <h3 style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-primary)', marginTop: '4px' }}>
                        PM Free Tractor Scheme 2026 (Fraudulent)
                      </h3>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                        Impersonation of PM-KISAN · Unauthorized ₹499 Registration Fee
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                      <div style={{ textAlign: 'right', padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-fake-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-fake-border)' }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-fake-text)', fontWeight: 700 }}>
                          AI CONFIDENCE
                        </div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-fake)' }}>
                          98%
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-fake-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-fake-border)' }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-fake-text)', fontWeight: 700 }}>
                          RISK SCORE
                        </div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-fake)' }}>
                          94<span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>/100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4 Analysis Checks Checklist with Flags */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'var(--color-fake-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-fake-border)' }}>
                      <AlertTriangle size={16} color="var(--color-fake)" />
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-fake-text)' }}>Impersonation Detected</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'var(--color-fake-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-fake-border)' }}>
                      <AlertTriangle size={16} color="var(--color-fake)" />
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-fake-text)' }}>Fake Domain Mimicry</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'var(--color-fake-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-fake-border)' }}>
                      <AlertTriangle size={16} color="var(--color-fake)" />
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-fake-text)' }}>Unauthorized ₹499 Fee</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'var(--color-fake-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-fake-border)' }}>
                      <AlertTriangle size={16} color="var(--color-fake)" />
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-fake-text)' }}>PIB Fact-Check Flagged</span>
                    </div>
                  </div>

                  {/* Status & Evidence Section */}
                  <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-fake-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-fake-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-fake-text)' }}>
                        VERDICT STATUS: CONFIRMED SCAM / FRAUDULENT
                      </span>
                      <Badge variant="fake" size="sm">
                        DO NOT PAY
                      </Badge>
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      Evidence confirmed via PIB Fact Check: The Government of India is NOT running any PM Free Tractor Scheme. The viral portal <code>pmkisan-tractoryojana-gov.in</code> is a phishing trap soliciting private UPI deposits.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ----------------------------------------------------------------------
         6. AI SECTION (Ask SchemeShield AI & Interactive Mock Chat Preview)
         ---------------------------------------------------------------------- */}
      <section>
        <PageContainer>
          <SectionHeading
            badge="Citizen Guidance"
            title="Ask SchemeShield AI"
            description="Have questions regarding scheme legitimacy, fee rules, or eligibility guidelines? Our AI assistant provides instant clarity citing official government sources."
          />

          <div style={{ maxWidth: '880px', margin: '0 auto' }}>
            {/* Suggested Question Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
              {Object.keys(aiChatData).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setSelectedAiPrompt(q)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: selectedAiPrompt === q ? 'var(--color-primary)' : 'var(--border-subtle)',
                    backgroundColor: selectedAiPrompt === q ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                    color: selectedAiPrompt === q ? 'var(--color-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  "{q}"
                </button>
              ))}
            </div>

            {/* Mock Chat Conversation Container */}
            <Card variant="glass" padding="none" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
              <div
                style={{
                  padding: 'var(--space-6)',
                  backgroundColor: 'var(--bg-app)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)'
                }}
              >
                {/* User Message Bubble */}
                <div className="mock-chat-bubble-user">
                  {currentChat.userQuery}
                </div>

                {/* AI Assistant Response Bubble */}
                <div className="mock-chat-bubble-ai">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Bot size={14} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)' }}>
                      SchemeShield AI Assistant
                    </span>
                  </div>

                  <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-primary)' }}>
                    {currentChat.aiResponse}
                  </p>

                  {/* Official Evidence Source Card */}
                  <div
                    style={{
                      marginTop: 'var(--space-4)',
                      padding: 'var(--space-3)',
                      backgroundColor: 'var(--bg-surface-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Database size={12} color="var(--color-verified)" />
                        {currentChat.evidenceTitle}
                      </span>
                      <a
                        href={currentChat.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '11px', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>Official Link</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      {currentChat.evidenceNote}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Footer with Action & Disclaimer */}
              <div
                style={{
                  padding: 'var(--space-4) var(--space-6)',
                  backgroundColor: 'var(--bg-surface)',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 'var(--space-3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  <Info size={13} />
                  <span>AI-generated guidance should be verified using official sources.</span>
                </div>

                <Link to="/assistant">
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
                    Launch Full AI Assistant
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </PageContainer>
      </section>

      {/* ----------------------------------------------------------------------
         7. FINAL CALL-TO-ACTION (Don't Guess. Verify.)
         ---------------------------------------------------------------------- */}
      <section>
        <PageContainer>
          <div
            style={{
              backgroundColor: 'var(--color-brand-navy)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'clamp(2.5rem, 5vw, 4.5rem)',
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
            {/* Ambient light ring backdrop */}
            <div
              style={{
                position: 'absolute',
                top: '-40%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '650px',
                height: '420px',
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.28) 0%, transparent 70%)',
                filter: 'blur(55px)',
                pointerEvents: 'none'
              }}
            />

            <Badge variant="info" size="md" style={{ marginBottom: 'var(--space-4)', backgroundColor: 'rgba(2, 132, 199, 0.2)', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}>
              Free Open Civic Software · 100% Free
            </Badge>

            <h2
              style={{
                color: '#ffffff',
                fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
                fontWeight: 800,
                maxWidth: '720px',
                lineHeight: 1.15,
                marginBottom: 'var(--space-4)',
                letterSpacing: '-0.02em'
              }}
            >
              Don't Guess. Verify.
            </h2>

            <p
              style={{
                color: '#cbd5e1',
                fontSize: 'var(--text-lg)',
                maxWidth: '620px',
                lineHeight: 1.6,
                marginBottom: 'var(--space-8)'
              }}
            >
              Check suspicious scheme information before sharing your personal details or applying. Protect your family and fellow citizens today.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', justifyContent: 'center', zIndex: 1 }}>
              <Link to="/verify">
                <Button variant="primary" size="lg" leftIcon={<ShieldCheck size={20} />}>
                  Verify a Scheme
                </Button>
              </Link>
              <Link to="/schemes">
                <Button
                  variant="outline"
                  size="lg"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.25)',
                    color: '#ffffff'
                  }}
                  rightIcon={<ArrowRight size={18} />}
                >
                  Explore Schemes
                </Button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
};
