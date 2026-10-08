export type SchemeCategory =
  | 'Education'
  | 'Healthcare'
  | 'Agriculture'
  | 'Employment'
  | 'Women & Child Development'
  | 'Financial Assistance'
  | 'Social Welfare'
  | 'Agriculture & Farmers'
  | 'Healthcare & Wellness'
  | 'Education & Skill'
  | 'Social Security & Pension'
  | 'Housing & Urban Development'
  | 'Financial Inclusion & Credit';

export type SchemeStatus =
  | 'VERIFIED_AUTHENTIC'
  | 'ACTIVE_CENTRAL'
  | 'UNDER_REVIEW'
  | 'FLAGGED_ALERT'
  | 'OFFICIALLY_ACTIVE'
  | 'DISCONTINUED'
  | 'SUPERSEDED';

export interface GovernmentScheme {
  id: string;
  code: string;
  title: string;
  alternateNames?: string[];
  ministry: string;
  nodalDepartment: string;
  launchYear: number;
  category: SchemeCategory;
  shortDescription: string;
  detailedObjective: string;
  officialPortalUrl: string;
  officialHelpline?: string;
  targetBeneficiaries: string[];
  keyBenefits: string[];
  eligibilityCriteria: string[];
  applicationFee: 'FREE' | string;
  isDirectBenefitTransfer: boolean;
  knownScamsOrAlerts?: string[];
  verifiedStatus: SchemeStatus;
  statusLabel?: string;
  riskScore: number; // 0 to 100
  confidenceScore: number; // 0 to 100
  lastReviewedDate: string;
  similarSchemes?: string[];
  sourceAuthority?: string;
}

// Backward-compatibility alias
export type OfficialScheme = GovernmentScheme;
