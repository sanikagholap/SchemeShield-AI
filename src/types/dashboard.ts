import { VerificationStatus, RiskTier } from './verification';

export interface DashboardStats {
  schemesVerified: number;
  trustedCount: number;
  suspiciousCount: number;
  highRiskCount: number;
  averageConfidence: number;
  weeklyIncrease: number;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'alert' | 'info' | 'success';
  read: boolean;
  link?: string;
}

export interface RiskDistribution {
  trustedPercent: number;
  suspiciousPercent: number;
  highRiskPercent: number;
}

export interface RecentVerificationItem {
  id: string;
  schemeName: string;
  verificationDate: string;
  status: VerificationStatus;
  riskTier: RiskTier;
  riskScore: number;
  confidenceScore: number;
  source: string;
  summary: string;
  inputQuery: string;
}
