import { User } from '../types/auth';
import { DashboardStats, DashboardNotification, RecentVerificationItem } from '../types/dashboard';
import { MOCK_OFFICIAL_SCHEMES, MOCK_VERIFICATION_SAMPLE, MOCK_HISTORY_ITEMS } from './mockSchemes';

export { MOCK_OFFICIAL_SCHEMES, MOCK_VERIFICATION_SAMPLE, MOCK_HISTORY_ITEMS };

export const MOCK_CITIZEN_USER: User = {
  id: 'usr-101',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@example.org',
  phone: '+91 98765 43210',
  role: 'CITIZEN',
  organization: 'Digital Civic Watch',
  avatarUrl: '',
  joinedAt: 'January 2026',
  verificationsCount: 24,
  lastActive: 'Just now'
};

export const MOCK_VERIFIER_USER: User = {
  id: 'usr-102',
  name: 'Priya Nair',
  email: 'priya.nair@civicresearch.in',
  phone: '+91 98123 45678',
  role: 'VERIFIER',
  organization: 'Center for Civic Media & Fact Integrity',
  avatarUrl: '',
  joinedAt: 'November 2025',
  verificationsCount: 89,
  lastActive: '5 minutes ago'
};

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  schemesVerified: 24,
  trustedCount: 17,
  suspiciousCount: 4,
  highRiskCount: 3,
  averageConfidence: 94.6,
  weeklyIncrease: 4
};

export const MOCK_NOTIFICATIONS: DashboardNotification[] = [
  {
    id: 'notif-1',
    title: 'Critical Scam Alert: PM Free Tractor Scheme',
    message: 'High volume of phishing SMS and WhatsApp forwards soliciting ₹499 fee reported.',
    timestamp: '15 mins ago',
    type: 'alert',
    read: false,
    link: '/verify?q=PM+Free+Tractor+Scheme'
  },
  {
    id: 'notif-2',
    title: 'Verification Complete: National Scholarship',
    message: 'Scheme details cross-referenced successfully against NSP registry. 0 discrepancies.',
    timestamp: '2 hours ago',
    type: 'success',
    read: false,
    link: '/verification-result'
  },
  {
    id: 'notif-3',
    title: 'Gazette Registry Updated',
    message: 'Ministry of Agriculture 2026 welfare revisions indexed into verification cache.',
    timestamp: '1 day ago',
    type: 'info',
    read: true,
    link: '/schemes'
  }
];

export const MOCK_RECENT_VERIFICATIONS: RecentVerificationItem[] = [
  {
    id: 'ver-89214',
    schemeName: 'PM Free Tractor Scheme 2026',
    verificationDate: 'Today, 14:20',
    status: 'FAKE',
    riskTier: 'CRITICAL',
    riskScore: 94,
    confidenceScore: 98,
    source: 'PIB Fact Check Registry',
    summary: 'Unauthorized ₹499 fee demand detected on fraudulent clone domain. No such subsidy exists under PM-KISAN.',
    inputQuery: 'Apply for PM Free Tractor Scheme 2026 under Kisan Nidhi. Deposit ₹499 registration fee at pmkisan-tractoryojana-gov.in.'
  },
  {
    id: 'ver-89215',
    schemeName: 'Ayushman Bharat Golden Card Registration',
    verificationDate: 'Yesterday, 18:45',
    status: 'SUSPICIOUS',
    riskTier: 'HIGH',
    riskScore: 78,
    confidenceScore: 92,
    source: 'National Health Authority (NHA)',
    summary: 'Third-party agent charging ₹250 for card delivery. Official Ayushman cards are free via empaneled hospitals.',
    inputQuery: 'Download Ayushman card instantly for ₹250 home delivery without SECC 2011 documentation.'
  },
  {
    id: 'ver-89216',
    schemeName: 'National Post-Matric Merit Scholarship',
    verificationDate: 'Oct 06, 2026',
    status: 'SAFE',
    riskTier: 'LOW',
    riskScore: 18,
    confidenceScore: 91,
    source: 'National Scholarship Portal (scholarships.gov.in)',
    summary: 'All criteria match official Ministry of Social Justice guidelines. Zero application fee required.',
    inputQuery: 'Post-Matric Merit Scholarship application criteria and deadline on official portal scholarships.gov.in.'
  },
  {
    id: 'ver-89217',
    schemeName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    verificationDate: 'Oct 04, 2026',
    status: 'SAFE',
    riskTier: 'LOW',
    riskScore: 4,
    confidenceScore: 99,
    source: 'Ministry of Agriculture & Farmers Welfare',
    summary: 'Legitimate 17th installment release notification verified with official DBT guidelines.',
    inputQuery: 'Official guidelines on PM-KISAN ₹6,000 yearly income support and eKYC verification process.'
  },
  {
    id: 'ver-89218',
    schemeName: 'Mudra Loan WhatsApp Approval Letter',
    verificationDate: 'Oct 02, 2026',
    status: 'FAKE',
    riskTier: 'CRITICAL',
    riskScore: 96,
    confidenceScore: 97,
    source: 'Department of Financial Services (DFS)',
    summary: 'Fake sanction letter demanding 5% GST deposit before loan release. MUDRA loans never solicit advance GST.',
    inputQuery: 'Sanction letter offering ₹10 Lakh PMMY collateral-free loan demanding ₹12,500 advance deposit via Google Pay.'
  },
  {
    id: 'ver-89219',
    schemeName: 'Sukanya Samriddhi Yojana (Postal Circular)',
    verificationDate: 'Sep 29, 2026',
    status: 'SAFE',
    riskTier: 'LOW',
    riskScore: 2,
    confidenceScore: 100,
    source: 'Department of Posts & NSI',
    summary: 'Verified postal circular matching current 8.2% small-savings rate revisions.',
    inputQuery: 'Postal circular regarding SSY interest rates and tax deduction under 80C.'
  }
];
