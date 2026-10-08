export type SchemeCategory = 
  | 'Agriculture & Farmers'
  | 'Healthcare & Wellness'
  | 'Education & Skill'
  | 'Social Security & Pension'
  | 'Women & Child Development'
  | 'Housing & Urban Development'
  | 'Financial Inclusion & Credit';

export interface OfficialScheme {
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
  verifiedStatus: 'OFFICIALLY_ACTIVE' | 'DISCONTINUED' | 'SUPERSEDED';
}
