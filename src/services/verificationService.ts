/**
 * SchemeShield AI - Real Verification Engine Integration Service
 * Communicates with FastAPI /api/v1/verify endpoints (text, document, url).
 * Strictly zero mock datasets, simulated delays, or fake results.
 */

import {
  VerificationRequest,
  VerificationResult,
  SchemeVerificationRequest,
  EvidenceItem,
  AnalysisCheck,
} from '../types/verification';
import { VerificationResponse } from '../types/api';
import { apiClient } from './apiClient';

export function mapVerificationResponseToResult(
  res: VerificationResponse,
  request?: VerificationRequest
): VerificationResult {
  const normLabel = (res.result_label || '').toLowerCase();
  const isGenuine = normLabel.includes('genuin') || normLabel === 'safe';
  const isSuspicious = normLabel.includes('suspicious');
  const isFraud = normLabel.includes('fraud') || normLabel.includes('fake');

  const overallStatus = isGenuine
    ? 'TRUSTED'
    : isSuspicious
    ? 'SUSPICIOUS'
    : isFraud
    ? 'HIGH RISK'
    : 'NEEDS REVIEW';

  const status = isGenuine
    ? 'TRUSTED'
    : isSuspicious
    ? 'SUSPICIOUS'
    : isFraud
    ? 'FAKE'
    : 'NEEDS REVIEW';

  const rawRisk = Number(res.risk_score ?? 0);
  const riskScore = Math.round(rawRisk <= 1.0 && rawRisk > 0 ? rawRisk * 100 : rawRisk);

  const rawConf = Number(res.confidence_score ?? 0);
  const confidenceScore = Math.round(rawConf <= 1.0 && rawConf > 0 ? rawConf * 100 : rawConf);

  // Generate structured evidence items from backend findings
  const evidenceItems: EvidenceItem[] = (res.findings || []).map((finding, idx) => {
    const isCritical = finding.toLowerCase().includes('scam') ||
      finding.toLowerCase().includes('fraud') ||
      finding.toLowerCase().includes('fee') ||
      finding.toLowerCase().includes('fake');
    const isSuspicious = finding.toLowerCase().includes('discrepancy') ||
      finding.toLowerCase().includes('suspicious') ||
      finding.toLowerCase().includes('unofficial');

    return {
      id: `ev-${idx + 1}`,
      title: finding.length > 50 ? `${finding.substring(0, 47)}...` : finding,
      severity: isCritical ? 'CRITICAL' : isSuspicious ? 'HIGH' : 'SAFE',
      category: res.domain_authenticity ? 'DOMAIN_URL' : 'GENERAL',
      categoryLabel: res.domain_authenticity ? 'Domain Verification' : 'Pattern Analysis',
      explanation: finding,
      sourceOrReference: res.matched_official_portal || undefined,
    };
  });

  // Generate analysis breakdown from backend signals
  const analysisBreakdown: AnalysisCheck[] = [
    {
      id: 'official_sources',
      title: 'Official Source & Domain Authenticity',
      status:
        res.domain_authenticity === 'VERIFIED_GOV'
          ? 'PASS'
          : res.domain_authenticity === 'COMMERCIAL_LOOKALIKE'
          ? 'FAIL'
          : res.result_label === 'GENUINE'
          ? 'PASS'
          : res.result_label === 'FRAUDULENT'
          ? 'FAIL'
          : 'WARNING',
      statusLabel:
        res.domain_authenticity === 'VERIFIED_GOV'
          ? 'Verified .gov.in Domain'
          : res.domain_authenticity || (res.result_label === 'GENUINE' ? 'Verified Government Registry' : 'Unverified Source'),
      confidence: confidenceScore,
      summary: res.matched_official_portal
        ? `Matched official portal: ${res.matched_official_portal}`
        : 'Domain verification analyzed against National Portal & NIC Registry',
      explanation:
        res.matched_official_portal
          ? `Verified match against legitimate portal: ${res.matched_official_portal}`
          : 'Originating announcement evaluated for authorized government domain extensions (.gov.in / .nic.in).',
      evidenceOrAction: res.matched_official_portal || undefined,
    },
    {
      id: 'similarity',
      title: 'Official Scheme Matching & NLP Similarity',
      status: (res.nlp_similarity_score ?? 0) >= 0.7 ? 'PASS' : (res.nlp_similarity_score ?? 0) >= 0.4 ? 'WARNING' : 'INCONCLUSIVE',
      statusLabel: res.official_scheme_matched
        ? `Matched: ${res.official_scheme_matched}`
        : 'Semantic Pattern Analysis',
      confidence: Math.round((res.nlp_similarity_score ?? 0.8) * 100),
      summary: res.official_scheme_matched
        ? `High correlation with ${res.official_scheme_matched}`
        : 'Analyzed scheme syntax against centralized government directory',
      explanation: `NLP similarity match score: ${Math.round((res.nlp_similarity_score ?? 0) * 100)}% against indexed government schemes.`,
    },
    {
      id: 'suspicious_content',
      title: 'Scam & Financial Demand Scan',
      status: res.result_label === 'FRAUDULENT' ? 'FAIL' : res.result_label === 'SUSPICIOUS' ? 'WARNING' : 'PASS',
      statusLabel: res.result_label === 'FRAUDULENT' ? 'Critical Fraud Signal' : res.result_label === 'SUSPICIOUS' ? 'Suspicious Language' : 'Clean & Non-Coercive',
      confidence: confidenceScore,
      summary: (res.findings && res.findings[0]) || 'Analysis of upfront fees, urgent deadlines, and payment gateways',
      explanation: 'Official Indian welfare schemes never demand upfront registration or courier fees via UPI or WhatsApp.',
    },
  ];

  const summary =
    res.findings && res.findings.length > 0
      ? res.findings[0]
      : res.result_label === 'GENUINE'
      ? 'Scheme information matches authentic government records with no fraudulent indicators.'
      : res.result_label === 'SUSPICIOUS'
      ? 'Discrepancies identified between submitted claims and official welfare gazettes.'
      : 'Critical alert: fraudulent circular or unauthorized payment request detected.';

  const recommendation =
    res.recommendations && res.recommendations.length > 0
      ? res.recommendations.join('\n')
      : 'Do not pay upfront fees or share banking OTPs. Verify all claims on myscheme.gov.in.';

  return {
    id: res.id,
    overallStatus,
    status,
    riskScore,
    confidenceScore,
    schemeName: res.scheme_name,
    detectedSchemeName: res.official_scheme_matched || res.scheme_name,
    inputQuery: request?.queryText || request?.schemeDescription || res.scheme_name,
    summary,
    verdictDescription: res.findings ? res.findings.join('\n') : summary,
    recommendation,
    method: request?.method || (res.input_type?.toUpperCase() as any) || 'TEXT',
    verificationMethod: request?.method || (res.input_type?.toUpperCase() as any) || 'TEXT',
    verifiedAt: res.created_at ? new Date(res.created_at).toLocaleString('en-IN') : 'Just now',
    submittedDetails: {
      schemeName: request?.schemeName || res.scheme_name,
      description: request?.schemeDescription,
      eligibility: request?.eligibility,
      benefits: request?.benefits,
      websiteUrl: request?.websiteUrl || res.matched_official_portal || undefined,
      issuingAuthority: request?.issuingAuthority,
      additionalInfo: request?.additionalInfo,
      fileName: request?.documentFile ? request.documentFile.name : undefined,
      fileSize: request?.documentFile ? `${Math.round(request.documentFile.size / 1024)} KB` : undefined,
    },
    findings: res.findings || [],
    analysisBreakdown,
    evidenceItems,
    officialSchemeMatched: res.official_scheme_matched
      ? {
          name: res.official_scheme_matched,
          ministry: '',
          officialUrl: res.matched_official_portal || '',
          schemeId: '',
        }
      : undefined,
    isMockDemo: false,
  };
}

export const verificationService = {
  /**
   * Primary verification entry point: routes to live FastAPI backend
   * (/api/v1/verify, /api/v1/verify/document, or /api/v1/verify/url).
   */
  async analyzeScheme(request: VerificationRequest): Promise<VerificationResult> {
    // 1. Document Upload Verification
    if (request.documentFile) {
      const formData = new FormData();
      formData.append('file', request.documentFile);
      if (request.schemeName?.trim()) {
        formData.append('scheme_name', request.schemeName.trim());
      }

      const backendRes = await apiClient.postFormData<VerificationResponse>('/verify/document', formData);
      return mapVerificationResponseToResult(backendRes, request);
    }

    // 2. URL Verification
    if (request.method === 'URL' || (request.websiteUrl && !request.schemeDescription && !request.queryText)) {
      const backendRes = await apiClient.post<VerificationResponse>('/verify/url', {
        url: request.websiteUrl,
        scheme_name: request.schemeName || 'Government Scheme Portal Inquiry',
      });
      return mapVerificationResponseToResult(backendRes, request);
    }

    // 3. Text & Form Verification
    const combinedDescription = [
      request.schemeDescription,
      request.eligibility ? `Eligibility: ${request.eligibility}` : '',
      request.benefits ? `Benefits: ${request.benefits}` : '',
      request.issuingAuthority ? `Authority: ${request.issuingAuthority}` : '',
      request.additionalInfo ? `Additional Details: ${request.additionalInfo}` : '',
      request.websiteUrl ? `Claimed Website: ${request.websiteUrl}` : '',
      request.queryText,
    ]
      .filter(Boolean)
      .join('\n\n');

    const backendRes = await apiClient.post<VerificationResponse>('/verify', {
      scheme_name: request.schemeName?.trim() || 'Government Scheme Inquiry',
      description: combinedDescription || request.schemeName || 'Government Scheme Verification Inquiry',
      input_type: 'text',
    });

    return mapVerificationResponseToResult(backendRes, request);
  },

  /**
   * Retrieve verification result by ID directly from live FastAPI backend.
   */
  async getVerificationById(id: string): Promise<VerificationResult | null> {
    try {
      const backendRes = await apiClient.get<VerificationResponse>(`/verify/${encodeURIComponent(id)}`);
      return mapVerificationResponseToResult(backendRes);
    } catch {
      return null;
    }
  },

  /**
   * Quick text verification backward-compatibility wrapper.
   */
  async verifySchemeText(request: SchemeVerificationRequest): Promise<VerificationResult> {
    return this.analyzeScheme({
      schemeName: request.schemeName,
      queryText: request.queryText,
      websiteUrl: request.sourceUrl,
      documentFile: request.documentFile,
      method: request.method,
    });
  },

  /**
   * Upload and analyze a scheme document file.
   */
  async uploadDocument(file: File, schemeName?: string): Promise<VerificationResult> {
    return this.analyzeScheme({
      schemeName,
      documentFile: file,
      method: 'DOCUMENT',
    });
  },

  async getVerificationResult(id: string): Promise<VerificationResult | null> {
    return this.getVerificationById(id);
  },

  async verifySchemeDocument(file: File, schemeName?: string): Promise<VerificationResult> {
    return this.uploadDocument(file, schemeName);
  },

  async getVerificationResultById(id: string): Promise<VerificationResult | null> {
    return this.getVerificationById(id);
  },
};
