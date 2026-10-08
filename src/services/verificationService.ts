import {
  VerificationRequest,
  VerificationResult,
  SchemeVerificationRequest
} from '../types/verification';
import {
  TRUSTED_MOCK_RESULT,
  SUSPICIOUS_MOCK_RESULT,
  HIGH_RISK_MOCK_RESULT,
  NEEDS_REVIEW_MOCK_RESULT,
  MOCK_VERIFICATION_RESULTS_MAP
} from '../data/mockVerificationResults';
import { simulateLatency } from './apiClient';

/**
 * Verification Service (Frontend Simulation Layer)
 * 
 * NOTE FOR BACKEND INTEGRATION:
 * When backend API is connected, replace simulateLatency calls with:
 * return apiClient.post<VerificationResult>('/api/v1/verify', request);
 * The frontend data contracts (VerificationRequest, VerificationResult)
 * are already standardized for seamless swap.
 */
export const verificationService = {
  /**
   * Primary verification entry point for the Verify workspace form and uploads.
   * Simulates intelligent classification based on user input content.
   */
  async analyzeScheme(request: VerificationRequest): Promise<VerificationResult> {
    const combinedContent = [
      request.schemeName || '',
      request.schemeDescription || '',
      request.eligibility || '',
      request.benefits || '',
      request.websiteUrl || '',
      request.issuingAuthority || '',
      request.additionalInfo || '',
      request.queryText || '',
      request.documentFile ? request.documentFile.name : ''
    ].join(' ').toLowerCase();

    let baseResult: VerificationResult;

    if (
      combinedContent.includes('tractor') ||
      combinedContent.includes('upi') ||
      combinedContent.includes('₹499') ||
      combinedContent.includes('499') ||
      combinedContent.includes('whatsapp') ||
      combinedContent.includes('urgent') ||
      combinedContent.includes('guarantee') ||
      combinedContent.includes('free tractor')
    ) {
      baseResult = HIGH_RISK_MOCK_RESULT;
    } else if (
      combinedContent.includes('ayushman') ||
      combinedContent.includes('instant') ||
      combinedContent.includes('card delivery') ||
      combinedContent.includes('doorstep') ||
      combinedContent.includes('₹250') ||
      combinedContent.includes('250') ||
      combinedContent.includes('convenience fee') ||
      (request.websiteUrl && !request.websiteUrl.includes('.gov.in') && !request.websiteUrl.includes('.nic.in'))
    ) {
      baseResult = SUSPICIOUS_MOCK_RESULT;
    } else if (
      combinedContent.includes('solar') ||
      combinedContent.includes('pilot') ||
      combinedContent.includes('discom') ||
      combinedContent.includes('regional')
    ) {
      baseResult = NEEDS_REVIEW_MOCK_RESULT;
    } else {
      // Default to Trusted for legitimate scholarship or clean government scheme input
      baseResult = TRUSTED_MOCK_RESULT;
    }

    // Enrich with actual request metadata submitted by the citizen
    const generatedId = `VER-${Date.now().toString().slice(-6)}`;
    const result: VerificationResult = {
      ...baseResult,
      id: generatedId,
      schemeName: request.schemeName || baseResult.schemeName,
      detectedSchemeName: baseResult.detectedSchemeName,
      inputQuery: request.queryText || request.schemeDescription || request.schemeName || 'Submitted Scheme Information',
      method: request.method || 'FORM',
      verificationMethod: request.method || 'FORM',
      verifiedAt: 'Just now',
      submittedDetails: {
        schemeName: request.schemeName || baseResult.submittedDetails?.schemeName,
        description: request.schemeDescription || baseResult.submittedDetails?.description,
        eligibility: request.eligibility || baseResult.submittedDetails?.eligibility,
        benefits: request.benefits || baseResult.submittedDetails?.benefits,
        websiteUrl: request.websiteUrl || baseResult.submittedDetails?.websiteUrl,
        issuingAuthority: request.issuingAuthority || baseResult.submittedDetails?.issuingAuthority,
        additionalInfo: request.additionalInfo || undefined,
        fileName: request.documentFile ? request.documentFile.name : undefined,
        fileSize: request.documentFile ? `${Math.round(request.documentFile.size / 1024)} KB` : undefined
      }
    };

    return simulateLatency(result, 1200);
  },

  /**
   * Retrieve a specific mock variant directly for UI demonstration and testing.
   */
  getMockVerificationResult(
    variant: 'TRUSTED' | 'SUSPICIOUS' | 'HIGH RISK' | 'NEEDS REVIEW' = 'TRUSTED'
  ): VerificationResult {
    return MOCK_VERIFICATION_RESULTS_MAP[variant] || TRUSTED_MOCK_RESULT;
  },

  /**
   * Retrieve verification result by ID (from mock cache or fallback).
   */
  async getVerificationById(id: string): Promise<VerificationResult | null> {
    if (id.includes('HIGH') || id.includes('TRACTOR') || id.includes('hist-1') || id.includes('hist-4')) {
      return simulateLatency({ ...HIGH_RISK_MOCK_RESULT, id }, 300);
    }
    if (id.includes('SUSP') || id.includes('AYUSH') || id.includes('hist-2')) {
      return simulateLatency({ ...SUSPICIOUS_MOCK_RESULT, id }, 300);
    }
    if (id.includes('REVIEW') || id.includes('SOLAR')) {
      return simulateLatency({ ...NEEDS_REVIEW_MOCK_RESULT, id }, 300);
    }
    return simulateLatency({ ...TRUSTED_MOCK_RESULT, id }, 300);
  },

  /**
   * Backward-compatibility wrapper for useVerification hook and dashboard quick verify.
   */
  async verifySchemeText(request: SchemeVerificationRequest): Promise<VerificationResult> {
    return this.analyzeScheme({
      schemeName: request.schemeName,
      queryText: request.queryText,
      websiteUrl: request.sourceUrl,
      documentFile: request.documentFile,
      method: request.method
    });
  },

  /**
   * Upload and analyze a scheme document file
   */
  async uploadDocument(file: File, schemeName?: string): Promise<VerificationResult> {
    return this.analyzeScheme({
      schemeName,
      documentFile: file,
      method: 'DOCUMENT'
    });
  },

  /**
   * Standardized alias for retrieving verification result
   */
  async getVerificationResult(id: string): Promise<VerificationResult | null> {
    return this.getVerificationById(id);
  },

  /**
   * Backward-compatibility wrapper for document verification.
   */
  async verifySchemeDocument(file: File, schemeName?: string): Promise<VerificationResult> {
    return this.uploadDocument(file, schemeName);
  },

  /**
   * Backward-compatibility wrapper for ID retrieval.
   */
  async getVerificationResultById(id: string): Promise<VerificationResult | null> {
    return this.getVerificationById(id);
  }
};
