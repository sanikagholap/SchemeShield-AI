export type RiskTier = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type VerificationStatus =
  | 'TRUSTED'
  | 'SUSPICIOUS'
  | 'HIGH RISK'
  | 'NEEDS REVIEW'
  | 'SAFE'
  | 'FAKE'
  | 'PENDING'
  | 'ANALYZING';

export type VerificationMethod = 'FORM' | 'DOCUMENT' | 'TEXT' | 'URL';

export type CheckStatus = 'PASS' | 'WARNING' | 'FAIL' | 'INCONCLUSIVE';

export type EvidenceSeverity = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskScore {
  score: number; // 0 to 100 (0 = completely safe, 100 = blatant fraud)
  tier: RiskTier;
  label: string; // e.g. "Low Risk", "Moderate Suspicion", "High Risk / Fraud"
  confidence: number; // 0 to 100%
  explanation: string;
}

export type AnalysisCheckId =
  | 'similarity'
  | 'description'
  | 'eligibility'
  | 'benefits'
  | 'official_sources'
  | 'document_ocr'
  | 'suspicious_content';

export interface AnalysisCheck {
  id: AnalysisCheckId;
  title: string;
  status: CheckStatus;
  statusLabel: string;
  confidence: number; // 0 to 100%
  summary: string;
  explanation: string;
  evidenceOrAction?: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  severity: EvidenceSeverity;
  category:
    | 'NAME_MATCH'
    | 'DOMAIN_URL'
    | 'BENEFIT_DISCREPANCY'
    | 'ELIGIBILITY'
    | 'OFFICIAL_SOURCE'
    | 'PAYMENT_FRAUD'
    | 'DOCUMENT'
    | 'GENERAL';
  categoryLabel: string;
  explanation: string;
  sourceOrReference?: string;
}

export interface SimilarScheme {
  id: string;
  schemeName: string;
  similarityPercentage: number; // e.g. 78
  matchedFields: string[]; // e.g. ["Scheme Name", "Eligibility", "Benefits"]
  explanation: string;
  officialMinistry?: string;
  officialUrl?: string;
  comparisonDetails?: {
    originalClaim: string;
    detectedClaim: string;
    verdict: string;
  };
}

export interface OfficialSource {
  id: string;
  name: string; // e.g. "MyScheme", "National Portal of India", "PIB Fact Check", "OGD Platform India"
  domain: string;
  url: string;
  status: 'MATCHED' | 'NO_MATCH' | 'UNDER_REVIEW' | 'FLAGGED_ALERT';
  statusLabel: string;
  details: string;
  isReferenceOnly: boolean;
}

export interface RiskSignal {
  id: string;
  title: string;
  severity: 'SAFE' | 'WARNING' | 'CRITICAL';
  description: string;
}

export interface EvidenceSource {
  title: string;
  sourceUrl?: string;
  sourceType: 'OFFICIAL_PORTAL' | 'GAZETTE_NOTIFICATION' | 'PIB_FACT_CHECK' | 'MINISTRY_DIRECTORY';
  matchScore: number;
  snippet: string;
}

export interface DiscrepancyFlag {
  id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  detectedPattern: string;
}

export interface VerificationRequest {
  schemeName?: string;
  schemeDescription?: string;
  eligibility?: string;
  benefits?: string;
  websiteUrl?: string;
  issuingAuthority?: string;
  additionalInfo?: string;
  documentFile?: File | null;
  method?: VerificationMethod;
  queryText?: string;
}

// Backward-compatibility alias
export interface SchemeVerificationRequest {
  schemeName?: string;
  queryText: string;
  sourceUrl?: string;
  documentFile?: File | null;
  method: VerificationMethod;
}

export interface VerificationResult {
  id: string;
  overallStatus?: 'TRUSTED' | 'SUSPICIOUS' | 'HIGH RISK' | 'NEEDS REVIEW';
  status: VerificationStatus;
  riskScore: number;
  confidenceScore: number;
  riskDetails?: RiskScore;
  schemeName?: string;
  detectedSchemeName: string;
  inputQuery?: string;
  summary: string;
  verdictDescription?: string;
  method?: VerificationMethod;
  verificationMethod?: VerificationMethod;
  verifiedAt: string;
  submittedDetails?: {
    schemeName?: string;
    description?: string;
    eligibility?: string;
    benefits?: string;
    websiteUrl?: string;
    issuingAuthority?: string;
    additionalInfo?: string;
    fileName?: string;
    fileSize?: string;
  };
  analysisBreakdown?: AnalysisCheck[];
  evidenceItems?: EvidenceItem[];
  officialSources?: OfficialSource[];
  similarSchemes?: SimilarScheme[];
  riskSignals?: RiskSignal[];
  officialSchemeMatched?: {
    name: string;
    ministry: string;
    officialUrl: string;
    schemeId: string;
  };
  recommendation: string;
  isMockDemo?: boolean;
  // Compatibility fields
  detectedFlags?: DiscrepancyFlag[];
  evidenceSources?: EvidenceSource[];
  isDuplicateOrAltered?: boolean;
  duplicateComparison?: {
    originalSchemeName: string;
    alteredDetails: string[];
  };
  riskTier?: RiskTier;
}
