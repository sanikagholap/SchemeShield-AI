import { VerificationResult, SchemeVerificationRequest } from '../types/verification';
import { MOCK_VERIFICATION_SAMPLE } from '../data/mockSchemes';
import { simulateLatency } from './apiClient';

export const verificationService = {
  /**
   * Placeholder: Verify scheme text / description
   */
  async verifySchemeText(request: SchemeVerificationRequest): Promise<VerificationResult> {
    // Return sample result matching input, simulated delay
    const isSuspiciousQuery = 
      request.queryText.toLowerCase().includes('free') || 
      request.queryText.toLowerCase().includes('tractor') || 
      request.queryText.toLowerCase().includes('fee') ||
      request.queryText.toLowerCase().includes('deposit');

    const result: VerificationResult = {
      ...MOCK_VERIFICATION_SAMPLE,
      id: `ver-${Date.now()}`,
      inputQuery: request.queryText,
      detectedSchemeName: request.schemeName || 'Analyzed Scheme Claim',
      riskScore: isSuspiciousQuery ? 94 : 12,
      riskTier: isSuspiciousQuery ? 'CRITICAL' : 'LOW',
      status: isSuspiciousQuery ? 'FAKE' : 'SAFE',
      summary: isSuspiciousQuery 
        ? MOCK_VERIFICATION_SAMPLE.summary 
        : 'LOW RISK: Information matches the official ministry guidelines with verified terms and zero fee demands.',
      verifiedAt: 'Just now',
      verificationMethod: request.method
    };

    return simulateLatency(result, 800);
  },

  /**
   * Placeholder: Verify document via OCR pipeline
   */
  async verifySchemeDocument(file: File, schemeName?: string): Promise<VerificationResult> {
    const result: VerificationResult = {
      ...MOCK_VERIFICATION_SAMPLE,
      id: `doc-${Date.now()}`,
      inputQuery: `Uploaded document: ${file.name} (${Math.round(file.size / 1024)} KB)`,
      detectedSchemeName: schemeName || `Extracted from ${file.name}`,
      verificationMethod: 'DOCUMENT',
      summary: `OCR Analysis completed on ${file.name}. Multiple altered clauses and non-standard typography were detected relative to the official Gazette release.`,
      verifiedAt: 'Just now'
    };

    return simulateLatency(result, 1200);
  },

  /**
   * Placeholder: Retrieve specific verification result by ID
   */
  async getVerificationResultById(id: string): Promise<VerificationResult | null> {
    return simulateLatency({
      ...MOCK_VERIFICATION_SAMPLE,
      id
    }, 300);
  }
};
