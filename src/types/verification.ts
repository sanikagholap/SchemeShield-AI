export type RiskTier = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type VerificationStatus = 'SAFE' | 'SUSPICIOUS' | 'FAKE' | 'PENDING' | 'ANALYZING';

export type VerificationMethod = 'TEXT' | 'DOCUMENT' | 'URL';

export interface EvidenceSource {
  title: string;
  sourceUrl?: string;
  sourceType: 'OFFICIAL_PORTAL' | 'GAZETTE_NOTIFICATION' | 'PIB_FACT_CHECK' | 'MINISTRY_DIRECTORY';
  matchScore: number; // 0 - 100
  snippet: string;
}

export interface DiscrepancyFlag {
  id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  detectedPattern: string;
}

export interface VerificationResult {
  id: string;
  inputQuery: string;
  detectedSchemeName: string;
  officialSchemeMatched?: {
    name: string;
    ministry: string;
    officialUrl: string;
    schemeId: string;
  };
  status: VerificationStatus;
  riskTier: RiskTier;
  riskScore: number;        // 0 to 100 (0 = very safe, 100 = blatant scam)
  confidenceScore: number;  // 0 to 100 (AI model confidence)
  summary: string;
  detectedFlags: DiscrepancyFlag[];
  evidenceSources: EvidenceSource[];
  isDuplicateOrAltered: boolean;
  duplicateComparison?: {
    originalSchemeName: string;
    alteredDetails: string[];
  };
  recommendation: string;
  verifiedAt: string;
  verificationMethod: VerificationMethod;
}

export interface SchemeVerificationRequest {
  schemeName?: string;
  queryText: string;
  sourceUrl?: string;
  documentFile?: File | null;
  method: VerificationMethod;
}
