import { RiskTier, VerificationStatus, VerificationMethod } from './verification';

export interface HistoryItem {
  id: string;
  schemeName: string;
  inputExcerpt: string;
  verifiedAt: string;
  riskTier: RiskTier;
  riskScore: number;
  confidenceScore: number;
  status: VerificationStatus;
  method: VerificationMethod;
  flagCount: number;
}
