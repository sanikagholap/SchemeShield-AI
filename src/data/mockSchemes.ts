import { OfficialScheme } from '../types/scheme';
import { VerificationResult } from '../types/verification';
import { HistoryItem } from '../types/history';

export const MOCK_OFFICIAL_SCHEMES: OfficialScheme[] = [
  {
    id: 'pm-kisan',
    code: 'PM-KISAN',
    title: 'Pradhan Mantri Kisan Samman Nidhi',
    alternateNames: ['PM Kisan', 'Kisan Samman Nidhi'],
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    nodalDepartment: 'Department of Agriculture and Farmers Welfare',
    launchYear: 2019,
    category: 'Agriculture & Farmers',
    shortDescription: 'Income support of ₹6,000 per year in three equal installments to all landholding farmer families across the country.',
    detailedObjective: 'To augment the income of all landholding farmer families for meeting their financial needs in procuring agricultural inputs and domestic obligations.',
    officialPortalUrl: 'https://pmkisan.gov.in',
    officialHelpline: '155261 / 011-24300606',
    targetBeneficiaries: ['Small and marginal landholding farmer families'],
    keyBenefits: ['₹6,000 per annum paid directly to bank accounts (DBT) in three installments of ₹2,000 each.'],
    eligibilityCriteria: ['All landholding farmer families having cultivable landholding in their names.', 'Excludes institutional landholders and tax-paying professionals.'],
    applicationFee: 'FREE',
    isDirectBenefitTransfer: true,
    knownScamsOrAlerts: [
      'Scam Alert: Fake "Free Tractor Scheme" portals charging ₹500 registration fee under PM-KISAN name.',
      'Scam Alert: Fake APK files sent via WhatsApp requesting biometric or banking OTPs for eKYC.'
    ],
    verifiedStatus: 'OFFICIALLY_ACTIVE'
  },
  {
    id: 'pmjay',
    code: 'AB-PMJAY',
    title: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana',
    alternateNames: ['PM-JAY', 'Ayushman Card'],
    ministry: 'Ministry of Health and Family Welfare',
    nodalDepartment: 'National Health Authority (NHA)',
    launchYear: 2018,
    category: 'Healthcare & Wellness',
    shortDescription: 'World’s largest health assurance scheme providing health cover of ₹5 lakh per family per year for secondary and tertiary care hospitalization.',
    detailedObjective: 'To provide catastrophic health expenditure protection and quality health care access to vulnerable socio-economic groups.',
    officialPortalUrl: 'https://pmjay.gov.in',
    officialHelpline: '14555',
    targetBeneficiaries: ['Bottom 40% vulnerable population identified by SECC 2011 & expanded state criteria'],
    keyBenefits: ['Cashless coverage up to ₹5,00,000 per eligible family per annum across empaneled public and private hospitals.'],
    eligibilityCriteria: ['Beneficiary family listed in SECC 2011 database or verified via official NHA Beneficiary Identification System.'],
    applicationFee: 'FREE',
    isDirectBenefitTransfer: false,
    knownScamsOrAlerts: [
      'Scam Alert: Phishing websites charging ₹250-₹500 for "Instant Ayushman Gold Card download".',
      'Scam Alert: Unofficial apps claiming to issue cards to unlisted citizens for upfront money.'
    ],
    verifiedStatus: 'OFFICIALLY_ACTIVE'
  },
  {
    id: 'pm-mudra',
    code: 'PMMY',
    title: 'Pradhan Mantri MUDRA Yojana',
    alternateNames: ['Mudra Loan', 'PMMY Loan'],
    ministry: 'Ministry of Finance',
    nodalDepartment: 'Department of Financial Services',
    launchYear: 2015,
    category: 'Financial Inclusion & Credit',
    shortDescription: 'Refinance support to micro enterprises with collateral-free loans up to ₹20 lakh under Shishu, Kishore, and Tarun categories.',
    detailedObjective: 'Funding the unfunded: providing formal credit access to non-corporate, non-farm small and micro enterprises.',
    officialPortalUrl: 'https://www.mudra.org.in',
    officialHelpline: '1800 180 1111',
    targetBeneficiaries: ['Small business owners, shopkeepers, artisans, street vendors, and micro entrepreneurs'],
    keyBenefits: ['Collateral-free loans: Shishu (up to ₹50k), Kishore (₹50k-₹5L), Tarun (₹5L-₹10L, up to ₹20L).'],
    eligibilityCriteria: ['Any Indian citizen with a viable business plan for a non-farm income generating activity.'],
    applicationFee: 'FREE (No upfront processing fee by authorized banks for Shishu loans)',
    isDirectBenefitTransfer: false,
    knownScamsOrAlerts: [
      'Scam Alert: Fraudulent sanction letters issued via WhatsApp demanding 5% GST/approval fee deposit.'
    ],
    verifiedStatus: 'OFFICIALLY_ACTIVE'
  },
  {
    id: 'sukanya-samriddhi',
    code: 'SSY',
    title: 'Sukanya Samriddhi Yojana',
    alternateNames: ['SSY Account', 'Beti Bachao Beti Padhao Savings'],
    ministry: 'Ministry of Women and Child Development & Ministry of Finance',
    nodalDepartment: 'Department of Posts & National Savings Institute',
    launchYear: 2015,
    category: 'Women & Child Development',
    shortDescription: 'High-interest government-backed small deposit scheme designed exclusively for the education and marriage expenses of girl children.',
    detailedObjective: 'Promote financial welfare and savings for the girl child under the Beti Bachao Beti Padhao campaign.',
    officialPortalUrl: 'https://www.indiapost.gov.in',
    officialHelpline: '1800 266 6868',
    targetBeneficiaries: ['Girl children below 10 years of age through legal guardian'],
    keyBenefits: ['Current attractive interest rate of 8.2% p.a., triple tax exemption under Section 80C.'],
    eligibilityCriteria: ['Account opened by natural/legal guardian in name of girl child aged 0-10 years. Max 2 accounts per family.'],
    applicationFee: 'FREE (Minimum deposit ₹250)',
    isDirectBenefitTransfer: false,
    knownScamsOrAlerts: [
      'Scam Alert: Fake online portals claiming to disburse ₹50,000 cash grant upon girl child registration.'
    ],
    verifiedStatus: 'OFFICIALLY_ACTIVE'
  },
  {
    id: 'pm-awas-gramin',
    code: 'PMAY-G',
    title: 'Pradhan Mantri Awaas Yojana - Gramin',
    alternateNames: ['PMAY-G', 'Indira Awaas Yojana Refactored'],
    ministry: 'Ministry of Rural Development',
    nodalDepartment: 'Department of Rural Development',
    launchYear: 2016,
    category: 'Housing & Urban Development',
    shortDescription: 'Financial assistance for construction of pucca houses with basic amenities to all houseless households in rural areas.',
    detailedObjective: 'Achieve "Housing for All" in rural India by providing financial assistance to build disaster-resilient houses.',
    officialPortalUrl: 'https://pmayg.nic.in',
    officialHelpline: '1800 116 446',
    targetBeneficiaries: ['Homeless families and households living in kutcha/dilapidated houses in rural areas'],
    keyBenefits: ['Unit assistance of ₹1.20 lakh in plain areas and ₹1.30 lakh in hilly/difficult areas via DBT.'],
    eligibilityCriteria: ['Identified based on SECC 2011 deprivation scores and verified by Gram Sabha.'],
    applicationFee: 'FREE',
    isDirectBenefitTransfer: true,
    knownScamsOrAlerts: [
      'Scam Alert: Intermediaries promising house allotment in exchange for ₹5,000 advance bribe or commission.'
    ],
    verifiedStatus: 'OFFICIALLY_ACTIVE'
  }
];

export const MOCK_VERIFICATION_SAMPLE: VerificationResult = {
  id: 'ver-89214',
  inputQuery: 'Apply for PM Free Tractor Scheme 2026 under Kisan Nidhi. Deposit ₹499 registration fee on portal www.pmkisan-tractoryojana-gov.in to receive 50% subsidy within 48 hours.',
  detectedSchemeName: 'PM Free Tractor Scheme 2026 (Altered/Fake)',
  officialSchemeMatched: {
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    officialUrl: 'https://pmkisan.gov.in',
    schemeId: 'pm-kisan'
  },
  status: 'FAKE',
  riskTier: 'CRITICAL',
  riskScore: 94,
  confidenceScore: 98,
  summary: 'HIGH CRITICAL RISK: This claim impersonates the legitimate PM-KISAN initiative. No such "Free Tractor" program exists under this name. The referenced domain is not a registered .gov.in domain and solicits an unauthorized upfront registration fee of ₹499.',
  detectedFlags: [
    {
      id: 'flag-1',
      severity: 'CRITICAL',
      title: 'Unauthorized Financial Demand',
      description: 'Demands ₹499 upfront registration fee. Legitimate central schemes do not charge private processing fees for farmer welfare benefits.',
      detectedPattern: 'Registration fee: ₹499 via private payment gateway'
    },
    {
      id: 'flag-2',
      severity: 'CRITICAL',
      title: 'Spoofed Domain Architecture',
      description: 'Domain "pmkisan-tractoryojana-gov.in" uses hyphenated keywords to mimic NIC/Gov domains. Official Indian portals strictly end in ".gov.in" or ".nic.in".',
      detectedPattern: 'Non-NIC domain pretending to be government portal'
    },
    {
      id: 'flag-3',
      severity: 'WARNING',
      title: 'Non-Existent Gazette Notification',
      description: 'No gazette notification or parliamentary budget allocation corresponds to "PM Free Tractor Scheme 2026".',
      detectedPattern: 'Zero match in PIB / MoA&FW database'
    }
  ],
  evidenceSources: [
    {
      title: 'Press Information Bureau (PIB) Fact Check Advisory',
      sourceType: 'PIB_FACT_CHECK',
      matchScore: 99,
      snippet: 'PIB Fact Check confirmed that Government of India is NOT running any PM Free Tractor Scheme. The viral portal is fraudulent.'
    },
    {
      title: 'Ministry of Agriculture & Farmers Welfare Official Directory',
      sourceUrl: 'https://pmkisan.gov.in',
      sourceType: 'OFFICIAL_PORTAL',
      matchScore: 95,
      snippet: 'Official PM-KISAN portal lists only ₹6,000 annual income support. No vehicle subsidies are managed under PM-KISAN portal.'
    }
  ],
  isDuplicateOrAltered: true,
  duplicateComparison: {
    originalSchemeName: 'PM-KISAN (Genuine)',
    alteredDetails: [
      'Genuine: Income support of ₹6,000/yr (No application fees)',
      'Fake claim: Tractor subsidy requiring ₹499 advance registration fee',
      'Genuine domain: pmkisan.gov.in vs Fake domain: pmkisan-tractoryojana-gov.in'
    ]
  },
  recommendation: 'DO NOT pay any money, DO NOT submit Aadhaar or bank credentials on this portal. Report this URL immediately to cybercrime.gov.in.',
  verifiedAt: 'Just now',
  verificationMethod: 'TEXT'
};

export const MOCK_HISTORY_ITEMS: HistoryItem[] = [
  {
    id: 'hist-1',
    schemeName: 'PM Free Tractor Scheme 2026',
    inputExcerpt: 'Deposit ₹499 registration fee on portal www.pmkisan-tractoryojana-gov.in...',
    verifiedAt: '12 minutes ago',
    riskTier: 'CRITICAL',
    riskScore: 94,
    confidenceScore: 98,
    status: 'FAKE',
    method: 'TEXT',
    flagCount: 3
  },
  {
    id: 'hist-2',
    schemeName: 'Ayushman Bharat Golden Card Registration',
    inputExcerpt: 'Download Ayushman card instantly for all citizens regardless of ration card...',
    verifiedAt: '2 hours ago',
    riskTier: 'HIGH',
    riskScore: 78,
    confidenceScore: 92,
    status: 'SUSPICIOUS',
    method: 'URL',
    flagCount: 2
  },
  {
    id: 'hist-3',
    schemeName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    inputExcerpt: 'Official guidelines on 17th installment disbursement and eKYC verification process...',
    verifiedAt: '1 day ago',
    riskTier: 'LOW',
    riskScore: 4,
    confidenceScore: 99,
    status: 'SAFE',
    method: 'DOCUMENT',
    flagCount: 0
  },
  {
    id: 'hist-4',
    schemeName: 'Beti Bachao ₹50,000 Direct Cash Transfer',
    inputExcerpt: 'Fill form to receive ₹50,000 grant in daughter bank account under Beti Padhao...',
    verifiedAt: '2 days ago',
    riskTier: 'CRITICAL',
    riskScore: 96,
    confidenceScore: 97,
    status: 'FAKE',
    method: 'TEXT',
    flagCount: 4
  },
  {
    id: 'hist-5',
    schemeName: 'Sukanya Samriddhi Yojana (Postal Circular)',
    inputExcerpt: 'Revision of interest rates for small savings schemes Q1 2026 by Ministry of Finance...',
    verifiedAt: '3 days ago',
    riskTier: 'LOW',
    riskScore: 2,
    confidenceScore: 100,
    status: 'SAFE',
    method: 'DOCUMENT',
    flagCount: 0
  }
];
