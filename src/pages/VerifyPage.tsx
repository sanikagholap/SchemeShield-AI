import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Upload,
  Globe,
  Sparkles,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  X,
  FileUp,
  AlertTriangle,
  Building,
  Info,
  Layers
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card } from '../components/ui/Card';
import { PageContainer } from '../components/ui/PageContainer';
import { verificationService } from '../services/verificationService';
import { VerificationRequest, VerificationResult } from '../types/verification';
import { useToast } from '../hooks/useToast';

export const VerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Active Input Mode: 'FORM' | 'DOCUMENT'
  const [activeTab, setActiveTab] = useState<'FORM' | 'DOCUMENT'>('FORM');

  // Form State initialized optionally from query param ?q=
  const [schemeName, setSchemeName] = useState('');
  const [schemeDescription, setSchemeDescription] = useState(() => searchParams.get('q') || '');
  const [eligibility, setEligibility] = useState('');
  const [benefits, setBenefits] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Document Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Submission & Validation State
  const [formError, setFormError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Demo Samples
  const handleLoadSample = (sampleKey: 'trusted' | 'suspicious' | 'high_risk') => {
    setFormError(null);
    setActiveTab('FORM');

    if (sampleKey === 'trusted') {
      setSchemeName('National Post-Matric Merit Scholarship Scheme 2026');
      setSchemeDescription(
        'Central sector scholarship providing annual financial maintenance allowance to meritorious students from disadvantaged socio-economic backgrounds enrolled in accredited higher secondary and university courses.'
      );
      setEligibility('Class 11 through Post-Graduate students with annual household income below ₹2.5 Lakhs. Minimum 55% marks in previous examination.');
      setBenefits('Direct financial grant of ₹12,00,0 to ₹20,000 per academic year disbursed directly via PFMS into Aadhaar-seeded bank account.');
      setWebsiteUrl('https://scholarships.gov.in');
      setIssuingAuthority('Ministry of Social Justice and Empowerment');
      setAdditionalInfo('Application is completely free on the National Scholarship Portal. No processing fees charged.');
    } else if (sampleKey === 'suspicious') {
      setSchemeName('Ayushman Bharat Golden Card Instant Delivery Portal');
      setSchemeDescription(
        'Get your official 5-Lakh Ayushman Bharat Gold Card laminated and delivered to your doorstep within 48 hours without needing BPL ration card or socio-economic survey validation.'
      );
      setEligibility('All Indian citizens regardless of state, income level, or SECC ration list qualification.');
      setBenefits('Instant smart health card with 5 Lakh cashless hospital admission guarantee across all local private clinics.');
      setWebsiteUrl('https://ayushman-card-instant-delivery.com');
      setIssuingAuthority('Claimed: National Health Authority / Ayushman Kendra');
      setAdditionalInfo('Requires ₹250 instant door-delivery processing fee payable via QR code.');
    } else {
      setSchemeName('PM Free Tractor Subsidy Scheme 2026');
      setSchemeDescription(
        'Government is giving 50% subsidy tractors and farm equipment to all farmers under Kisan Nidhi. Pay ₹499 registration fee immediately at pmkisan-tractoryojana-gov.in to book your subsidy slot before quota expires.'
      );
      setEligibility('All farmers and rural youth aged 18-50 across India without requiring landholding papers.');
      setBenefits('50% discount on new Mahindra/Swaraj tractors plus direct ₹1,00,000 cash grant.');
      setWebsiteUrl('https://pmkisan-tractoryojana-gov.in/apply');
      setIssuingAuthority('Ministry of Agriculture & Farmers Welfare');
      setAdditionalInfo('Demands instant ₹499 registration fee deposit to UPI ID: pmkisan.tractor@okaxis.');
    }
  };

  // File Handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const allowedExtensions = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    if (!allowedExtensions.includes(file.type) && !file.name.match(/\.(pdf|png|jpg|jpeg)$/i)) {
      setFileError('Invalid file format. Please upload a PDF, PNG, or JPG document.');
      setSelectedFile(null);
      return;
    }

    if (file.size > maxSizeBytes) {
      setFileError('File size exceeds 10MB limit. Please upload a smaller file.');
      setSelectedFile(null);
      return;
    }

    setFileError(null);
    setSelectedFile(file);
    // Autofill scheme name if empty
    if (!schemeName) {
      setSchemeName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Handler with 5-step animated progress flow
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (activeTab === 'FORM') {
      if (!schemeName.trim() && !schemeDescription.trim() && !websiteUrl.trim()) {
        setFormError('Please enter at least the Scheme Name, Description, or Application URL to start verification.');
        return;
      }
    } else {
      if (!selectedFile) {
        setFormError('Please select or drag & drop a PDF or image document to analyze.');
        return;
      }
    }

    setIsAnalyzing(true);
    setCurrentStep(1);

    const verificationPayload: VerificationRequest = {
      schemeName: schemeName.trim() || undefined,
      schemeDescription: schemeDescription.trim() || undefined,
      eligibility: eligibility.trim() || undefined,
      benefits: benefits.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      issuingAuthority: issuingAuthority.trim() || undefined,
      additionalInfo: additionalInfo.trim() || undefined,
      documentFile: selectedFile,
      method: activeTab
    };

    // Sequential 5-step progress simulation
    const runAnalysisSteps = async () => {
      // Step 1: Reading scheme information
      setCurrentStep(1);
      await new Promise((resolve) => setTimeout(resolve, 550));

      // Step 2: Comparing scheme details
      setCurrentStep(2);
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Step 3: Checking for suspicious similarities
      setCurrentStep(3);
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Step 4: Evaluating source information
      setCurrentStep(4);
      await new Promise((resolve) => setTimeout(resolve, 550));

      // Step 5: Preparing verification result
      setCurrentStep(5);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const analyzedResult: VerificationResult = await verificationService.analyzeScheme(verificationPayload);

      setIsAnalyzing(false);
      toast.success('Verification analysis completed.');
      navigate('/verification-result', { state: { result: analyzedResult } });
    };

    try {
      await runAnalysisSteps();
    } catch {
      setIsAnalyzing(false);
      setFormError('Verification process could not be completed. Please try again.');
    }
  };

  const progressSteps = [
    { number: 1, title: 'Reading scheme information', desc: 'Parsing extracted text, entities, and claimed benefits' },
    { number: 2, title: 'Comparing scheme details', desc: 'Cross-referencing against verified central & state gazettes' },
    { number: 3, title: 'Checking for suspicious similarities', desc: 'Scanning for duplicate scheme mimicry and predatory patterns' },
    { number: 4, title: 'Evaluating source information', desc: 'Verifying domain authenticity on myScheme and NIC registry' },
    { number: 5, title: 'Preparing verification result', desc: 'Synthesizing evidence, confidence, and risk score index' }
  ];

  return (
    <PageContainer style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
        <Link to="/dashboard" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>
          Dashboard
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Verify Scheme</span>
      </div>

      {/* Header Section */}
      <div style={{ maxWidth: '800px', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: '4px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
          <ShieldCheck size={14} />
          <span>AI-POWERED VERIFICATION WORKSPACE</span>
        </div>
        <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 'var(--space-3)', lineHeight: 1.2 }}>
          Verify a Government Scheme
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          Check scheme information for suspicious, duplicate, misleading, or modified content. Enter details directly or upload circulars and pamphlets to cross-reference against official Indian government records.
        </p>
      </div>

      {/* Quick Test Demo Presets Bar */}
      <Card variant="glass" padding="md" style={{ marginBottom: 'var(--space-8)', border: '1px dashed var(--color-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Sparkles size={16} color="var(--color-primary)" />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
              Quick Demo Prefills:
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Click to load realistic test cases
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleLoadSample('trusted')}
              style={{ fontSize: '11px', borderColor: 'var(--color-verified-border)', color: 'var(--color-verified-text)', backgroundColor: 'var(--color-verified-bg)' }}
            >
              ✓ Load Trusted Sample
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleLoadSample('suspicious')}
              style={{ fontSize: '11px', borderColor: 'var(--color-suspicious-border)', color: 'var(--color-suspicious-text)', backgroundColor: 'var(--color-suspicious-bg)' }}
            >
              ⚠ Load Suspicious Sample
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleLoadSample('high_risk')}
              style={{ fontSize: '11px', borderColor: 'var(--color-fake-border)', color: 'var(--color-fake-text)', backgroundColor: 'var(--color-fake-bg)' }}
            >
              🚨 Load High Risk Sample
            </Button>
          </div>
        </div>
      </Card>

      {/* Dual Input Methods Navigation Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-2)' }}>
        <button
          type="button"
          onClick={() => setActiveTab('FORM')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            border: 'none',
            background: activeTab === 'FORM' ? 'var(--bg-surface)' : 'transparent',
            borderBottom: activeTab === 'FORM' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'FORM' ? 'var(--color-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'FORM' ? 700 : 500,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <FileText size={16} />
          <span>A. Enter Scheme Information</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DOCUMENT')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            border: 'none',
            background: activeTab === 'DOCUMENT' ? 'var(--bg-surface)' : 'transparent',
            borderBottom: activeTab === 'DOCUMENT' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'DOCUMENT' ? 'var(--color-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'DOCUMENT' ? 700 : 500,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Upload size={16} />
          <span>B. Upload Document</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: 'var(--space-8)', alignItems: 'start' }}>
        {/* Left Column: Form or Document Upload */}
        <div>
          {formError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-fake-bg)', border: '1px solid var(--color-fake-border)', color: 'var(--color-fake-text)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{formError}</div>
            </div>
          )}

          <form onSubmit={handleAnalyze}>
            {activeTab === 'FORM' ? (
              <Card variant="default" padding="lg">
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                    Scheme Information Form
                  </h2>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>
                    Provide known details about the scheme or message you received. Optional fields can be left blank.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                  {/* Scheme Name */}
                  <Input
                    label="Scheme Name"
                    placeholder="Enter the government scheme name"
                    value={schemeName}
                    onChange={(e) => setSchemeName(e.target.value)}
                    helperText="e.g., PM Free Tractor Scheme, Ayushman Bharat, Post-Matric Scholarship"
                    required
                  />

                  {/* Scheme Description */}
                  <Textarea
                    label="Scheme Description"
                    placeholder="Paste the scheme description or information you received..."
                    value={schemeDescription}
                    onChange={(e) => setSchemeDescription(e.target.value)}
                    rows={4}
                    helperText="Copy the WhatsApp text, pamphlet claims, SMS announcement, or portal summary."
                  />

                  {/* Two column grid for Eligibility & Benefits */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
                    <Textarea
                      label="Eligibility Criteria"
                      placeholder="Who is eligible for this scheme?"
                      value={eligibility}
                      onChange={(e) => setEligibility(e.target.value)}
                      rows={3}
                      helperText="e.g. All farmers, students with income < ₹2.5L, unlisted citizens."
                    />

                    <Textarea
                      label="Claimed Benefits"
                      placeholder="What benefits does the scheme claim to provide?"
                      value={benefits}
                      onChange={(e) => setBenefits(e.target.value)}
                      rows={3}
                      helperText="e.g. ₹50,000 direct grant, free equipment, 5 Lakh medical card."
                    />
                  </div>

                  {/* Website / Portal URL */}
                  <Input
                    label="Application / Website URL"
                    type="url"
                    placeholder="https://..."
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    leftIcon={<Globe size={16} />}
                    helperText="The link provided in the message or advertisement to apply or pay."
                  />

                  {/* Optional Issuing Authority */}
                  <Input
                    label="Issuing Authority (Optional)"
                    placeholder="e.g. Ministry of Agriculture, State Education Department, National Health Authority"
                    value={issuingAuthority}
                    onChange={(e) => setIssuingAuthority(e.target.value)}
                    leftIcon={<Building size={16} />}
                    helperText="The claimed ministry or administrative body."
                  />

                  {/* Optional Additional Information */}
                  <Textarea
                    label="Additional Information (Optional)"
                    placeholder="e.g. Fees requested (₹499), helpline numbers mentioned, WhatsApp forward source, deadline urgency..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    rows={2}
                    helperText="Any fee demands, personal UPI IDs, or unusual instructions given to applicants."
                  />

                  {/* Action Button */}
                  <div style={{ marginTop: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                      🔒 Zero data is shared externally. Analysis is simulated locally for prototype evaluation.
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isAnalyzing}
                      disabled={isAnalyzing}
                      leftIcon={<Sparkles size={18} />}
                      style={{ minWidth: '180px' }}
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Scheme'}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card variant="default" padding="lg">
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                    Upload Scheme Document
                  </h2>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>
                    Upload official gazette circulars, WhatsApp posters, application forms, or promotional brochures for visual OCR verification.
                  </p>
                </div>

                {/* Dropzone Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragOver ? 'var(--color-primary)' : fileError ? 'var(--color-fake)' : 'var(--border-medium)'}`,
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-10) var(--space-6)',
                    textAlign: 'center',
                    backgroundColor: isDragOver ? 'var(--color-primary-light)' : 'var(--bg-app)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    position: 'relative'
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg"
                    style={{ display: 'none' }}
                  />

                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto var(--space-4)',
                      boxShadow: 'var(--shadow-sm)',
                      color: isDragOver ? 'var(--color-primary)' : 'var(--color-brand-accent)'
                    }}
                  >
                    <FileUp size={30} />
                  </div>

                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                    Drag & Drop your document here
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', maxWidth: '420px', margin: '0 auto var(--space-4)' }}>
                    or click to browse files from your computer or smartphone
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <span className="badge badge-info" style={{ fontSize: '11px' }}>PDF</span>
                    <span className="badge badge-info" style={{ fontSize: '11px' }}>PNG</span>
                    <span className="badge badge-info" style={{ fontSize: '11px' }}>JPG / JPEG</span>
                    <span className="badge" style={{ fontSize: '11px', backgroundColor: 'var(--bg-surface-secondary)' }}>Max 10 MB</span>
                  </div>
                </div>

                {fileError && (
                  <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-fake)', fontSize: 'var(--text-xs)' }}>
                    <AlertTriangle size={14} />
                    <span>{fileError}</span>
                  </div>
                )}

                {/* Selected File Card Preview */}
                {selectedFile && (
                  <div
                    style={{
                      marginTop: 'var(--space-6)',
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--color-primary-light)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 'var(--space-3)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-surface)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-primary)',
                          flexShrink: 0
                        }}
                      >
                        <FileText size={22} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {selectedFile.name}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                          {(selectedFile.size / 1024).toFixed(1)} KB • Ready for OCR extraction
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      title="Remove selected file"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}

                {/* Optional Scheme Title for the file */}
                <div style={{ marginTop: 'var(--space-6)' }}>
                  <Input
                    label="Scheme Name (Optional if clearly shown in document)"
                    placeholder="Enter the claimed scheme name"
                    value={schemeName}
                    onChange={(e) => setSchemeName(e.target.value)}
                    helperText="If known, helps cross-reference against official catalogs more rapidly."
                  />
                </div>

                {/* Clear Prototype Disclaimer as required */}
                <div
                  style={{
                    marginTop: 'var(--space-6)',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-info-bg)',
                    border: '1px solid var(--color-info-border)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)'
                  }}
                >
                  <Info size={18} color="var(--color-info-text)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-info-text)', lineHeight: 1.5 }}>
                    <strong>Notice:</strong> Document analysis uses OCR and verification services. This prototype currently uses simulated analysis. No document files are uploaded to an external server.
                  </p>
                </div>

                {/* Document Action Button */}
                <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={!selectedFile || isAnalyzing}
                    isLoading={isAnalyzing}
                    leftIcon={<Sparkles size={18} />}
                    style={{ minWidth: '180px' }}
                  >
                    {isAnalyzing ? 'Extracting OCR...' : 'Analyze Document'}
                  </Button>
                </div>
              </Card>
            )}
          </form>
        </div>

        {/* Right Column: Citizen Guidance & Verification Objectives */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* How SchemeShield Verifies */}
          <Card variant="glass" padding="md">
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Layers size={16} color="var(--color-primary)" />
              <span>What We Check For</span>
            </h3>
            <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <li><strong>Duplicate Scheme Mimicry:</strong> Fake clones disguised as PM-KISAN, Ayushman Bharat, or Mudra.</li>
              <li><strong>Advance Fee Fraud:</strong> Unauthorized registration fees, QR codes, or UPI payment handles.</li>
              <li><strong>Domain Discrepancies:</strong> Spoof websites masquerading as legitimate <code>.gov.in</code> portals.</li>
              <li><strong>Modified Benefits:</strong> Inflated cash promises or unverified giveaways not backed by gazettes.</li>
              <li><strong>PIB Fact Check Bulletins:</strong> Matched alerts from national fact-checking authorities.</li>
            </ul>
          </Card>

          {/* Quick Tips for Citizens */}
          <Card variant="default" padding="md">
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <HelpCircle size={16} color="var(--color-verified)" />
              <span>Citizen Safety Rule #1</span>
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Genuine Indian central government welfare schemes <strong>never charge registration fees</strong> via WhatsApp, Telegram, or personal UPI IDs. All legitimate portals end in <strong>.gov.in</strong> or <strong>.nic.in</strong>.
            </p>
          </Card>

          {/* Official Verification Reference Sources */}
          <Card variant="default" padding="md">
            <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
              Verified Portals We Cross-Check
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>myScheme</span>
                <span style={{ color: 'var(--text-muted)' }}>myscheme.gov.in</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>National Portal of India</span>
                <span style={{ color: 'var(--text-muted)' }}>india.gov.in</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>PIB Fact Check Bureau</span>
                <span style={{ color: 'var(--text-muted)' }}>factcheck.pib.gov.in</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Open Government Data</span>
                <span style={{ color: 'var(--text-muted)' }}>data.gov.in</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Verification Flow Progress Modal / Overlay (5 Steps) */}
      {isAnalyzing && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
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
              borderRadius: 'var(--radius-2xl)',
              maxWidth: '560px',
              width: '100%',
              padding: 'var(--space-8)',
              boxShadow: 'var(--shadow-2xl)',
              border: '1px solid var(--border-subtle)',
              animation: 'fadeIn 0.25s ease-out'
            }}
          >
            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-3)'
                }}
              >
                <Sparkles size={28} className="animate-spin" />
              </div>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                Verifying Scheme Information
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>
                PROTOTYPE SIMULATION • Running cross-referencing pipeline
              </p>
            </div>

            {/* 5-Step Process List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              {progressSteps.map((step) => {
                const isCompleted = currentStep > step.number;
                const isCurrent = currentStep === step.number;

                return (
                  <div
                    key={step.number}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: isCurrent ? 'var(--color-primary-light)' : isCompleted ? 'var(--color-verified-bg)' : 'transparent',
                      border: `1px solid ${isCurrent ? 'var(--color-primary)' : isCompleted ? 'var(--color-verified-border)' : 'var(--border-light)'}`,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ flexShrink: 0, marginTop: '2px' }}>
                      {isCompleted ? (
                        <CheckCircle2 size={18} color="var(--color-verified)" />
                      ) : isCurrent ? (
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: '2px solid var(--color-primary)',
                            borderTopColor: 'transparent',
                            animation: 'spin 1s linear infinite'
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: '1px solid var(--border-medium)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: 'var(--text-muted)'
                          }}
                        >
                          {step.number}
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: isCurrent ? 700 : 600, color: isCurrent ? 'var(--color-primary)' : isCompleted ? 'var(--color-verified-text)' : 'var(--text-secondary)' }}>
                        Step {step.number}: {step.title}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: isCurrent ? 'var(--color-primary-hover)' : 'var(--text-tertiary)', marginTop: '2px' }}>
                        {step.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Demo Banner */}
            <div style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-4)' }}>
              Preparing comprehensive verification verdict and evidence report...
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
