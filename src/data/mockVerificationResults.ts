import { VerificationResult, OfficialSource } from '../types/verification';

export const REFERENCE_OFFICIAL_SOURCES: OfficialSource[] = [
  {
    id: 'src-myscheme',
    name: 'myScheme Portal',
    domain: 'myscheme.gov.in',
    url: 'https://www.myscheme.gov.in',
    status: 'MATCHED',
    statusLabel: 'Official Repository',
    details: 'National e-Governance Division (NeGD) centralized portal cataloging 1,000+ validated central and state schemes.',
    isReferenceOnly: true
  },
  {
    id: 'src-india-gov',
    name: 'National Portal of India',
    domain: 'india.gov.in',
    url: 'https://www.india.gov.in',
    status: 'MATCHED',
    statusLabel: 'National Portal',
    details: 'Single-window access to information and services provided by various Indian Government entities.',
    isReferenceOnly: true
  },
  {
    id: 'src-pib-factcheck',
    name: 'PIB Fact Check',
    domain: 'factcheck.pib.gov.in',
    url: 'https://factcheck.pib.gov.in',
    status: 'MATCHED',
    statusLabel: 'Fact-Check Bureau',
    details: 'Press Information Bureau unit dedicated to busting fake government announcements, fake schemes, and viral fraud alerts.',
    isReferenceOnly: true
  },
  {
    id: 'src-ogd-india',
    name: 'OGD Platform India',
    domain: 'data.gov.in',
    url: 'https://data.gov.in',
    status: 'MATCHED',
    statusLabel: 'Open Government Data',
    details: 'Open government data platform providing machine-readable catalogs of approved public sector welfare initiatives.',
    isReferenceOnly: true
  }
];

export const TRUSTED_MOCK_RESULT: VerificationResult = {
  id: 'VER-2026-TRUSTED',
  overallStatus: 'TRUSTED',
  status: 'TRUSTED',
  riskScore: 14,
  confidenceScore: 94,
  riskDetails: {
    score: 14,
    tier: 'LOW',
    label: 'Trusted (Low Risk)',
    confidence: 94,
    explanation: 'Lower risk scores indicate fewer detected warning signals. Information closely matches verified government records.'
  },
  schemeName: 'National Post-Matric Merit Scholarship Scheme 2026',
  detectedSchemeName: 'National Post-Matric Merit Scholarship Scheme',
  summary: 'Verified authentic scheme. All eligibility criteria, benefit amounts, and application procedures match the official Ministry of Social Justice notification with 0 fee demand.',
  verdictDescription: 'SchemeShield AI has cross-referenced this scheme against the National Scholarship Portal and gazette archives. All clauses, direct benefit transfers (DBT), and zero-fee claims adhere strictly to verified government standards.',
  method: 'FORM',
  verificationMethod: 'FORM',
  verifiedAt: 'Just now',
  submittedDetails: {
    schemeName: 'National Post-Matric Merit Scholarship Scheme 2026',
    description: 'Financial assistance for post-matriculation studies provided to eligible students across accredited colleges and universities via National Scholarship Portal.',
    eligibility: 'Class 11 through Post-Graduate students with annual household income below ₹2.5 Lakhs.',
    benefits: 'Direct financial assistance covering tuition maintenance allowance deposited directly to student Aadhaar-seeded bank account.',
    websiteUrl: 'https://scholarships.gov.in',
    issuingAuthority: 'Ministry of Social Justice and Empowerment'
  },
  analysisBreakdown: [
    {
      id: 'similarity',
      title: 'Scheme Similarity',
      status: 'PASS',
      statusLabel: '98% Official Match',
      confidence: 97,
      summary: 'Matches verified central scheme catalog on National Scholarship Portal.',
      explanation: 'Text parameters, scheme title, and structural components correspond directly with the Central Sector Scheme registered under MSJE code SCH-2018-09.',
      evidenceOrAction: 'Consistent with verified national scheme taxonomy'
    },
    {
      id: 'description',
      title: 'Description Analysis',
      status: 'PASS',
      statusLabel: 'Authentic Tone & Terminology',
      confidence: 94,
      summary: 'Professional administrative terminology without manipulative or urgent phrases.',
      explanation: 'Natural Language Processing analysis detected standard administrative phrasing, correct statutory references, and no high-pressure promotional vocabulary.',
      evidenceOrAction: 'Zero manipulative or phishing terminology detected'
    },
    {
      id: 'eligibility',
      title: 'Eligibility Comparison',
      status: 'PASS',
      statusLabel: 'Exact Match with Guidelines',
      confidence: 96,
      summary: 'Income thresholds and educational levels match published 2025-26 rules.',
      explanation: 'The ₹2.5 Lakh household ceiling and educational requirements precisely mirror the official notification gazette published on scholarships.gov.in.',
      evidenceOrAction: 'Income ceiling criteria verified against gazette rules'
    },
    {
      id: 'benefits',
      title: 'Benefit Comparison',
      status: 'PASS',
      statusLabel: 'Standard Direct Benefit Transfer',
      confidence: 95,
      summary: 'DBT allowance matches approved disbursement slabs without exaggerated claims.',
      explanation: 'Disbursement claims match the standard maintenance allowances. No promises of luxury vehicles, lotteries, or unapproved cash grants were found.',
      evidenceOrAction: 'Disbursal via Aadhaar-linked PFMS gateway verified'
    },
    {
      id: 'official_sources',
      title: 'Official Source Verification',
      status: 'PASS',
      statusLabel: 'Match Found',
      confidence: 98,
      summary: 'Scheme information appears consistent with the selected official source.',
      explanation: 'The portal domain (scholarships.gov.in) belongs to the verified National Informatics Centre (NIC) .gov.in domain space with valid SSL certification.',
      evidenceOrAction: 'NIC Gov.in domain verified with valid Ministry metadata'
    },
    {
      id: 'document_ocr',
      title: 'Document/OCR Analysis',
      status: 'PASS',
      statusLabel: 'Standard Ministry Format',
      confidence: 92,
      summary: 'Typography, seals, and formatting align with authentic official communications.',
      explanation: 'Layout analysis confirms official emblem placement and authentic circular format. No digital alterations or forged stamps were observed.',
      evidenceOrAction: 'Standard administrative document pattern observed'
    },
    {
      id: 'suspicious_content',
      title: 'Suspicious Content Detection',
      status: 'PASS',
      statusLabel: 'Zero Red Flags',
      confidence: 99,
      summary: 'No payment demands, unverified UPI IDs, or phishing indicators detected.',
      explanation: 'Scam heuristic models detected zero private contact numbers, unauthorized payment requests, or suspicious redirection scripts.',
      evidenceOrAction: '100% free application process confirmed'
    }
  ],
  evidenceItems: [
    {
      id: 'ev-trust-1',
      title: 'Official .gov.in Domain Confirmed',
      severity: 'SAFE',
      category: 'DOMAIN_URL',
      categoryLabel: 'Official Domain',
      explanation: 'The provided application portal resolves to scholarships.gov.in, managed by the National Informatics Centre (NIC).',
      sourceOrReference: 'National Informatics Centre Domain Registry'
    },
    {
      id: 'ev-trust-2',
      title: 'Zero Application Fee Requirement',
      severity: 'SAFE',
      category: 'PAYMENT_FRAUD',
      categoryLabel: 'Financial Terms',
      explanation: 'Genuine Indian central scholarship applications on NSP are 100% free. No processing fee or deposit is demanded.',
      sourceOrReference: 'MSJE Administrative Guidelines 2025'
    },
    {
      id: 'ev-trust-3',
      title: 'Standard Direct Benefit Transfer (DBT)',
      severity: 'SAFE',
      category: 'BENEFIT_DISCREPANCY',
      categoryLabel: 'Disbursement Method',
      explanation: 'Funds are transferred directly via PFMS into the applicant bank account. No cash collections or agent fees are involved.',
      sourceOrReference: 'PFMS Central Disbursement Protocol'
    },
    {
      id: 'ev-trust-4',
      title: 'Official Helpline & Grievance Match',
      severity: 'SAFE',
      category: 'OFFICIAL_SOURCE',
      categoryLabel: 'Citizen Support',
      explanation: 'The listed helpline (0120-6619540) matches the official NSP helpdesk directory recorded on myScheme.',
      sourceOrReference: 'myScheme Directory Service'
    }
  ],
  officialSources: REFERENCE_OFFICIAL_SOURCES.map((s) => ({
    ...s,
    status: 'MATCHED',
    statusLabel: 'Verified Reference'
  })),
  similarSchemes: [
    {
      id: 'sim-1',
      schemeName: 'National Means-cum-Merit Scholarship Scheme (NMMSS)',
      similarityPercentage: 74,
      matchedFields: ['Target Demographic', 'Income Criterion', 'DBT Portal'],
      explanation: 'A related central scheme under Department of School Education for Class 9-12 students with matching financial ceilings.',
      officialMinistry: 'Ministry of Education',
      officialUrl: 'https://scholarships.gov.in',
      comparisonDetails: {
        originalClaim: 'Class 11 to PG students covered with tuition support.',
        detectedClaim: 'Focuses on secondary school students from Class 9 to 12.',
        verdict: 'Both schemes are legitimate sister programs running concurrently on NSP.'
      }
    },
    {
      id: 'sim-2',
      schemeName: 'Post-Matric Scholarship for SC/ST Students',
      similarityPercentage: 68,
      matchedFields: ['Eligibility Ceiling', 'Disbursal Mode'],
      explanation: 'State-administered centrally sponsored scheme with similar documentation and DBT disbursement workflow.',
      officialMinistry: 'Ministry of Social Justice and Empowerment',
      officialUrl: 'https://socialjustice.gov.in',
      comparisonDetails: {
        originalClaim: 'National Post-Matric Merit Scholarship.',
        detectedClaim: 'Category-specific state implementation with central funding support.',
        verdict: 'Complementary program with overlapping documentation.'
      }
    }
  ],
  riskSignals: [
    {
      id: 'sig-t1',
      title: 'No major warning detected',
      severity: 'SAFE',
      description: 'Zero suspicious keywords, zero advance payments, and genuine administrative wording.'
    },
    {
      id: 'sig-t2',
      title: 'Legitimate Government Domain',
      severity: 'SAFE',
      description: 'Host domain belongs to the official NIC-administered National Scholarship Portal.'
    },
    {
      id: 'sig-t3',
      title: 'Free Public Application Process',
      severity: 'SAFE',
      description: 'No processing charges or unauthorized intermediary fees required.'
    }
  ],
  officialSchemeMatched: {
    name: 'National Post-Matric Merit Scholarship Scheme',
    ministry: 'Ministry of Social Justice and Empowerment',
    officialUrl: 'https://scholarships.gov.in',
    schemeId: 'SCH-MSJE-2018'
  },
  recommendation: 'This scheme appears legitimate and safe to proceed with. Always ensure you apply strictly on the official scholarships.gov.in portal and never share your banking OTP with any intermediaries.',
  isMockDemo: true,
  riskTier: 'LOW'
};

export const SUSPICIOUS_MOCK_RESULT: VerificationResult = {
  id: 'VER-2026-SUSPICIOUS',
  overallStatus: 'SUSPICIOUS',
  status: 'SUSPICIOUS',
  riskScore: 64,
  confidenceScore: 87,
  riskDetails: {
    score: 64,
    tier: 'MODERATE',
    label: 'Suspicious / Discrepancy Found',
    confidence: 87,
    explanation: 'Lower risk scores indicate fewer detected warning signals. Moderate risk scores signify modified criteria or unverified intermediaries.'
  },
  schemeName: 'Ayushman Bharat Golden Card Instant Delivery Portal',
  detectedSchemeName: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (Altered Intermediary)',
  summary: 'Discrepancies detected. Unofficial portal claiming to issue Ayushman cards for a ₹250 home delivery charge, bypassing official socio-economic database rules.',
  verdictDescription: 'SchemeShield AI identified significant departures from official National Health Authority (NHA) protocols. The official PM-JAY program is completely free and requires pre-qualification in official SECC records.',
  method: 'FORM',
  verificationMethod: 'FORM',
  verifiedAt: 'Just now',
  submittedDetails: {
    schemeName: 'Ayushman Bharat Golden Card Instant Delivery Portal',
    description: 'Get your Ayushman Gold Card delivered home in 48 hours for ₹250 without waiting for ration card verification.',
    eligibility: 'All citizens of India irrespective of income or BPL status.',
    benefits: '5 Lakh health cover plus instant personalized laminated plastic smart card.',
    websiteUrl: 'https://ayushman-card-instant-delivery.com',
    issuingAuthority: 'Claimed: National Health Authority / Ayushman Kendra'
  },
  analysisBreakdown: [
    {
      id: 'similarity',
      title: 'Scheme Similarity',
      status: 'WARNING',
      statusLabel: '84% Deceptive Similarity',
      confidence: 89,
      summary: 'Mimics the branding of PM Jan Arogya Yojana while altering critical delivery terms.',
      explanation: 'The name and visual emblems mimic the official Ayushman Bharat initiative, but the application channel is hosted on an unauthorized private commercial domain.',
      evidenceOrAction: 'Name matches genuine scheme, but operations are handled by an unauthorized party'
    },
    {
      id: 'description',
      title: 'Description Analysis',
      status: 'WARNING',
      statusLabel: 'Suspicious Convenience Claim',
      confidence: 86,
      summary: 'Promises "instant 48-hour delivery without ration card" contrary to official rules.',
      explanation: 'Administrative records indicate Ayushman cards cannot be issued without SECC 2011/NFSA family verification. Instant issuance promises are a known hallmark of phishing schemes.',
      evidenceOrAction: 'Non-standard claim contradicts NHA beneficiary identification process'
    },
    {
      id: 'eligibility',
      title: 'Eligibility Comparison',
      status: 'FAIL',
      statusLabel: 'Eligibility Criteria Altered',
      confidence: 91,
      summary: 'Claims universal eligibility for "all citizens" instead of target low-income families.',
      explanation: 'Official PM-JAY covers the bottom 40% vulnerable population defined by SECC criteria. Universal coverage claims without documentary proof are misleading.',
      evidenceOrAction: 'Compare against official guidelines on pmjay.gov.in'
    },
    {
      id: 'benefits',
      title: 'Benefit Comparison',
      status: 'WARNING',
      statusLabel: 'Unauthorized Premium Add-on',
      confidence: 85,
      summary: 'Charges ₹250 for home plastic card delivery.',
      explanation: 'Paper and digital e-Cards are issued free at Common Service Centres (CSCs) and public hospitals. Charging citizens for basic registration is strictly prohibited by NHA.',
      evidenceOrAction: 'Report unauthorized card fee demand'
    },
    {
      id: 'official_sources',
      title: 'Official Source Verification',
      status: 'FAIL',
      statusLabel: 'Website/Domain Mismatch',
      confidence: 94,
      summary: 'Domain is a commercial .com address, not an official .gov.in portal.',
      explanation: 'The official portal is pmjay.gov.in / beneficiary.nha.gov.in. The supplied URL (ayushman-card-instant-delivery.com) is registered through a private privacy proxy.',
      evidenceOrAction: 'Do not enter Aadhaar or banking details on private .com domains'
    },
    {
      id: 'document_ocr',
      title: 'Document/OCR Analysis',
      status: 'WARNING',
      statusLabel: 'Unofficial Watermark Detected',
      confidence: 82,
      summary: 'Emblem reproduction lacks standardized government security micro-text.',
      explanation: 'Simulated OCR analysis indicates the promotional pamphlet incorporates unauthorized NHA logos alongside commercial payment gateway badges.',
      evidenceOrAction: 'Uncertified promotional template detected'
    },
    {
      id: 'suspicious_content',
      title: 'Suspicious Content Detection',
      status: 'WARNING',
      statusLabel: 'Commercial Monetization of Free Benefit',
      confidence: 90,
      summary: 'Suspected predatory third-party intermediary or phishing trap.',
      explanation: 'The site prompts users to enter sensitive Aadhaar numbers before routing them to an unofficial payment link for delivery fees.',
      evidenceOrAction: 'Exercise extreme caution: Avoid entering personal identifiers'
    }
  ],
  evidenceItems: [
    {
      id: 'ev-susp-1',
      title: 'Website/domain mismatch detected',
      severity: 'HIGH',
      category: 'DOMAIN_URL',
      categoryLabel: 'Portal Authenticity',
      explanation: 'The domain ayushman-card-instant-delivery.com is not an authorized .gov.in endpoint. Official portals end strictly in .gov.in.',
      sourceOrReference: 'National Health Authority Official Portals Advisory'
    },
    {
      id: 'ev-susp-2',
      title: 'Unauthorized ₹250 Application/Card Fee',
      severity: 'HIGH',
      category: 'PAYMENT_FRAUD',
      categoryLabel: 'Unauthorized Fee',
      explanation: 'Ayushman Bharat cards are generated 100% free of cost at all empaneled hospitals and official beneficiary portals.',
      sourceOrReference: 'PM-JAY Official Citizen Charter'
    },
    {
      id: 'ev-susp-3',
      title: 'Eligibility wording appears modified',
      severity: 'MEDIUM',
      category: 'ELIGIBILITY',
      categoryLabel: 'Criteria Alteration',
      explanation: 'Claims that any citizen can receive benefits without checking SECC or NFSA ration card data.',
      sourceOrReference: 'myScheme PM-JAY Eligibility Criteria'
    },
    {
      id: 'ev-susp-4',
      title: 'Similar scheme name detected',
      severity: 'MEDIUM',
      category: 'NAME_MATCH',
      categoryLabel: 'Name Mimicry',
      explanation: 'Capitalizes on the name of Ayushman Bharat to collect private data and service charges from unsuspecting citizens.',
      sourceOrReference: 'PIB Fact Check Advisory Ref #FC-2024-819'
    }
  ],
  officialSources: [
    {
      id: 'src-pmjay-official',
      name: 'PM-JAY Official Portal',
      domain: 'pmjay.gov.in',
      url: 'https://pmjay.gov.in',
      status: 'NO_MATCH',
      statusLabel: 'Official Source Available',
      details: 'Official portal lists cards as 100% free. No paid doorstep delivery service exists under central guidelines.',
      isReferenceOnly: true
    },
    {
      id: 'src-pib-factcheck-2',
      name: 'PIB Fact Check',
      domain: 'factcheck.pib.gov.in',
      url: 'https://factcheck.pib.gov.in',
      status: 'FLAGGED_ALERT',
      statusLabel: 'Known Impersonation Pattern',
      details: 'PIB has repeatedly warned citizens against unofficial websites offering quick Ayushman cards for ₹200-₹500.',
      isReferenceOnly: true
    },
    {
      id: 'src-myscheme-2',
      name: 'myScheme Portal',
      domain: 'myscheme.gov.in',
      url: 'https://www.myscheme.gov.in',
      status: 'MATCHED',
      statusLabel: 'Genuine Scheme Listed',
      details: 'Legitimate PM-JAY is indexed under Ministry of Health and Family Welfare.',
      isReferenceOnly: true
    },
    {
      id: 'src-india-gov-2',
      name: 'National Portal of India',
      domain: 'india.gov.in',
      url: 'https://india.gov.in',
      status: 'MATCHED',
      statusLabel: 'Directory Available',
      details: 'Provides direct redirect to beneficiary.nha.gov.in for self-verification.',
      isReferenceOnly: true
    }
  ],
  similarSchemes: [
    {
      id: 'sim-ayush-1',
      schemeName: 'Ayushman Bharat - PM Jan Arogya Yojana (Genuine)',
      similarityPercentage: 92,
      matchedFields: ['Scheme Title', 'Benefit Amount (₹5 Lakh)', 'Health Cover'],
      explanation: 'The authentic central health scheme offering free annual hospital coverage up to ₹5 Lakh per eligible family.',
      officialMinistry: 'Ministry of Health and Family Welfare',
      officialUrl: 'https://pmjay.gov.in',
      comparisonDetails: {
        originalClaim: 'Genuine scheme provides 100% free cards at zero fee.',
        detectedClaim: 'Submitted claim asks for ₹250 delivery fee at doorstep.',
        verdict: 'Submitted claim is an unauthorized paid wrapper or phishing duplicate.'
      }
    },
    {
      id: 'sim-ayush-2',
      schemeName: 'Ayushman Bharat Digital Mission (ABDM)',
      similarityPercentage: 70,
      matchedFields: ['Ayushman Branding', 'Health Records Access'],
      explanation: 'National initiative for creating 14-digit ABHA Health IDs for citizens without any application fee.',
      officialMinistry: 'National Health Authority',
      officialUrl: 'https://abdm.gov.in',
      comparisonDetails: {
        originalClaim: 'ABHA creation is free online via Aadhaar/driving license OTP.',
        detectedClaim: 'Altered instant card portal.',
        verdict: 'Do not pay any fee for ABHA ID or Ayushman card generation.'
      }
    }
  ],
  riskSignals: [
    {
      id: 'sig-s1',
      title: 'Unverified website',
      severity: 'WARNING',
      description: 'The site is hosted on a commercial .com domain rather than an official .gov.in government portal.'
    },
    {
      id: 'sig-s2',
      title: 'Similar scheme information found',
      severity: 'WARNING',
      description: 'Heavily duplicates Ayushman Bharat branding but diverts users to a private payment gateway.'
    },
    {
      id: 'sig-s3',
      title: 'Benefit information differs from reference',
      severity: 'WARNING',
      description: 'Promises convenience features that do not exist in authorized central guidelines.'
    },
    {
      id: 'sig-s4',
      title: 'Fee requested for free government service',
      severity: 'CRITICAL',
      description: 'Requests ₹250 registration/delivery payment for an entitlement that is statutory free.'
    }
  ],
  officialSchemeMatched: {
    name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana',
    ministry: 'Ministry of Health and Family Welfare',
    officialUrl: 'https://pmjay.gov.in',
    schemeId: 'PM-JAY-NHA-2018'
  },
  recommendation: 'DO NOT pay ₹250 or submit your Aadhaar card details on this portal. To obtain an authentic Ayushman Card for free, visit beneficiary.nha.gov.in or your nearest government hospital / Common Service Centre (CSC).',
  isMockDemo: true,
  riskTier: 'MODERATE'
};

export const HIGH_RISK_MOCK_RESULT: VerificationResult = {
  id: 'VER-2026-HIGH-RISK',
  overallStatus: 'HIGH RISK',
  status: 'HIGH RISK',
  riskScore: 94,
  confidenceScore: 98,
  riskDetails: {
    score: 94,
    tier: 'CRITICAL',
    label: 'High Risk / Severe Threat',
    confidence: 98,
    explanation: 'Lower risk scores indicate fewer detected warning signals. Scores above 80 indicate high probability of fraudulent deception or financial scam.'
  },
  schemeName: 'PM Free Tractor Subsidy Scheme 2026',
  detectedSchemeName: 'Fictitious Scheme Impersonating PM-KISAN (Confirmed Scam Pattern)',
  summary: 'HIGH RISK FRAUD DETECTED. Fictitious scheme demanding an upfront registration fee of ₹499 via private UPI link. Matches active PIB Fact Check scam warnings.',
  verdictDescription: 'SchemeShield AI has detected multiple critical fraud signals. No "Free Tractor Scheme" exists under PM-KISAN. The website domain is fake, uses deceptive keywords, and targets rural citizens with fraudulent payment demands.',
  method: 'FORM',
  verificationMethod: 'FORM',
  verifiedAt: 'Just now',
  submittedDetails: {
    schemeName: 'PM Free Tractor Subsidy Scheme 2026',
    description: 'Government is giving 50% subsidy tractors to all farmers under Kisan Nidhi. Pay ₹499 registration fee immediately at pmkisan-tractoryojana-gov.in to book your slot.',
    eligibility: 'All farmers and rural youth aged 18-50.',
    benefits: '50% tractor subsidy plus immediate ₹1,00,000 cash grant.',
    websiteUrl: 'https://pmkisan-tractoryojana-gov.in/apply',
    issuingAuthority: 'Claimed: Ministry of Agriculture & Farmers Welfare'
  },
  analysisBreakdown: [
    {
      id: 'similarity',
      title: 'Scheme Similarity',
      status: 'FAIL',
      statusLabel: '78% Deceptive Name Mimicry',
      confidence: 96,
      summary: 'Exploits the name of PM-KISAN to deceive agricultural workers.',
      explanation: 'Uses a deceptive domain combining "pmkisan" with "tractoryojana" to trick users into believing it is an official Ministry of Agriculture sub-program.',
      evidenceOrAction: 'Confirmed fraudulent impersonation of PM-KISAN'
    },
    {
      id: 'description',
      title: 'Description Analysis',
      status: 'FAIL',
      statusLabel: 'Aggressive Urgency & Pressure Tactics',
      confidence: 98,
      summary: 'Employs psychological urgency: "Pay ₹499 immediately to book your slot".',
      explanation: 'Genuine government schemes never enforce countdown timers or urgent fee deadlines via unmonitored UPI addresses.',
      evidenceOrAction: 'Critical red flag: Urgency pressure used for illicit fee collection'
    },
    {
      id: 'eligibility',
      title: 'Eligibility Comparison',
      status: 'FAIL',
      statusLabel: 'Zero Statutory Validation',
      confidence: 95,
      summary: 'Broad universal eligibility without verification against land records.',
      explanation: 'Official agricultural machinery initiatives (such as SMAM) require verified landholding records, Aadhaar eKYC, and State Agriculture Department quotas.',
      evidenceOrAction: 'Fabricated eligibility parameters'
    },
    {
      id: 'benefits',
      title: 'Benefit Comparison',
      status: 'FAIL',
      statusLabel: 'Fictitious Benefit Promises',
      confidence: 99,
      summary: '50% tractor subsidy + ₹1 Lakh cash grant does not exist in any Gazette.',
      explanation: 'Cross-referencing against the Ministry of Agriculture portal and myScheme revealed no active scheme titled "PM Free Tractor Scheme 2026".',
      evidenceOrAction: 'Unsubstantiated and fictitious benefit commitments'
    },
    {
      id: 'official_sources',
      title: 'Official Source Verification',
      status: 'FAIL',
      statusLabel: 'PIB Fact Check Debunked',
      confidence: 100,
      summary: 'Official PIB Fact Check explicitly labeled this circular as FRAUD.',
      explanation: 'PIB Fact Check bulletin PIB-FC-AGRI-042 confirmed: "Government of India is NOT running any scheme called PM Free Tractor Scheme. Do not pay any registration fee."',
      evidenceOrAction: 'Matches documented PIB Fact Check scam bulletin'
    },
    {
      id: 'document_ocr',
      title: 'Document/OCR Analysis',
      status: 'FAIL',
      statusLabel: 'Counterfeit Emblem & Typo Detected',
      confidence: 94,
      summary: 'Forged State Emblem with spelling mistake: "Govt of Indla".',
      explanation: 'Computer vision analysis reveals irregular emblem proportions, incorrect Ashoka Lion capital detail, and typographical errors indicative of amateur counterfeit documents.',
      evidenceOrAction: 'High-confidence forged government credential detected'
    },
    {
      id: 'suspicious_content',
      title: 'Suspicious Content Detection',
      status: 'FAIL',
      statusLabel: 'Direct UPI Payment Fraud',
      confidence: 99,
      summary: 'Demands upfront ₹499 payment to an individual UPI VPA handle.',
      explanation: 'Government disbursements never solicit application payments to personal GooglePay/PhonePe UPI addresses. This is direct cyber financial crime.',
      evidenceOrAction: 'Report immediately to National Cyber Crime Reporting Portal (1930)'
    }
  ],
  evidenceItems: [
    {
      id: 'ev-high-1',
      title: 'Suspicious contact / application information detected',
      severity: 'CRITICAL',
      category: 'PAYMENT_FRAUD',
      categoryLabel: 'Advance Fee Fraud',
      explanation: 'The form requires an upfront non-refundable fee of ₹499 via private UPI QR code. Legitimate government schemes do not solicit fee deposits to private VPAs.',
      sourceOrReference: 'Ministry of Home Affairs / I4C Cyber Crime Alert'
    },
    {
      id: 'ev-high-2',
      title: 'Website / domain mismatch detected',
      severity: 'CRITICAL',
      category: 'DOMAIN_URL',
      categoryLabel: 'Deceptive Domain',
      explanation: 'The fake domain pmkisan-tractoryojana-gov.in mimics .gov.in using hyphens. The legitimate PM-KISAN domain is strictly pmkisan.gov.in.',
      sourceOrReference: 'National Informatics Centre (NIC) Registry'
    },
    {
      id: 'ev-high-3',
      title: 'Official PIB Fact Check debunk match found',
      severity: 'CRITICAL',
      category: 'OFFICIAL_SOURCE',
      categoryLabel: 'PIB Debunk Bulletin',
      explanation: 'PIB Fact Check has officially flagged and warned citizens against "PM Free Tractor Scheme" circulars circulating on social media.',
      sourceOrReference: 'PIB Fact Check Official Handle (@PIBFactCheck)'
    },
    {
      id: 'ev-high-4',
      title: 'Benefit description differs from reference information',
      severity: 'HIGH',
      category: 'BENEFIT_DISCREPANCY',
      categoryLabel: 'Fictitious Claims',
      explanation: 'PM-KISAN only provides ₹6,000 yearly income support. It does not provide vehicle subsidies or direct equipment delivery.',
      sourceOrReference: 'pmkisan.gov.in Official Scheme Objectives'
    },
    {
      id: 'ev-high-5',
      title: 'Similar scheme name detected',
      severity: 'HIGH',
      category: 'NAME_MATCH',
      categoryLabel: 'Brand Impersonation',
      explanation: 'Intentionally mimics PM-KISAN to exploit public brand trust and bypass common skepticism.',
      sourceOrReference: 'SchemeShield Similarity Engine (78% Lexical Match)'
    }
  ],
  officialSources: [
    {
      id: 'src-pib-high',
      name: 'PIB Fact Check',
      domain: 'factcheck.pib.gov.in',
      url: 'https://factcheck.pib.gov.in',
      status: 'FLAGGED_ALERT',
      statusLabel: 'Debunked as Fake',
      details: 'Official PIB Fact Check explicitly classified this claim as a scam on March 2025 bulletin.',
      isReferenceOnly: true
    },
    {
      id: 'src-pmkisan-high',
      name: 'PM-KISAN Portal',
      domain: 'pmkisan.gov.in',
      url: 'https://pmkisan.gov.in',
      status: 'NO_MATCH',
      statusLabel: 'No Scheme Exists',
      details: 'Official portal features an active warning banner warning against fake tractor subsidy schemes.',
      isReferenceOnly: true
    },
    {
      id: 'src-myscheme-high',
      name: 'myScheme Portal',
      domain: 'myscheme.gov.in',
      url: 'https://www.myscheme.gov.in',
      status: 'NO_MATCH',
      statusLabel: 'Zero Results Found',
      details: 'No record of any "Free Tractor Distribution Scheme 2026" under any state or central ministry.',
      isReferenceOnly: true
    },
    {
      id: 'src-india-gov-high',
      name: 'National Portal of India',
      domain: 'india.gov.in',
      url: 'https://india.gov.in',
      status: 'NO_MATCH',
      statusLabel: 'No Record',
      details: 'Verified portal lists only legitimate farm machinery subsidies under Department of Agriculture.',
      isReferenceOnly: true
    }
  ],
  similarSchemes: [
    {
      id: 'sim-tractor-1',
      schemeName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      similarityPercentage: 78,
      matchedFields: ['Prefix "PM Kisan"', 'Targeting Farmers', 'Direct Ministry Reference'],
      explanation: 'The genuine flagship scheme which disburses ₹6,000/yr in three installments with zero registration fees.',
      officialMinistry: 'Ministry of Agriculture and Farmers Welfare',
      officialUrl: 'https://pmkisan.gov.in',
      comparisonDetails: {
        originalClaim: 'Genuine PM-KISAN: ₹6,000 yearly financial support directly into bank accounts via DBT. 100% free.',
        detectedClaim: 'Fake scheme: 50% tractor subsidy requiring immediate ₹499 registration fee deposit.',
        verdict: 'Confirmed malicious clone targeting farmers with advance fee fraud.'
      }
    },
    {
      id: 'sim-tractor-2',
      schemeName: 'Sub-Mission on Agricultural Mechanization (SMAM)',
      similarityPercentage: 62,
      matchedFields: ['Agricultural Machinery', 'Farm Equipment Subsidy'],
      explanation: 'Legitimate central farm mechanization scheme implemented strictly through state agriculture departments with DBT subsidies.',
      officialMinistry: 'Ministry of Agriculture and Farmers Welfare',
      officialUrl: 'https://agrimachinery.nic.in',
      comparisonDetails: {
        originalClaim: 'Requires registered tractor dealer quotations and State Mechanization portal approval.',
        detectedClaim: 'Promises instant tractor booking via fake portal for ₹499.',
        verdict: 'Citizens must only apply on agrimachinery.nic.in via state offices.'
      }
    }
  ],
  riskSignals: [
    {
      id: 'sig-h1',
      title: 'Suspicious application instructions',
      severity: 'CRITICAL',
      description: 'Instructs applicant to pay ₹499 upfront registration fee via personal UPI link.'
    },
    {
      id: 'sig-h2',
      title: 'Unverified website / domain mismatch',
      severity: 'CRITICAL',
      description: 'Website hosted on pmkisan-tractoryojana-gov.in, a non-governmental spoof domain.'
    },
    {
      id: 'sig-h3',
      title: 'Confirmed PIB Fact Check scam alert',
      severity: 'CRITICAL',
      description: 'PIB Fact Check verified this viral message as fraudulent and warned citizens against payments.'
    },
    {
      id: 'sig-h4',
      title: 'Benefit information differs from reference',
      severity: 'WARNING',
      description: 'Fictitious 50% vehicle subsidy claims not supported by any central budget or notification.'
    }
  ],
  officialSchemeMatched: {
    name: 'PM-KISAN (Genuine Scheme Being Exploited)',
    ministry: 'Ministry of Agriculture and Farmers Welfare',
    officialUrl: 'https://pmkisan.gov.in',
    schemeId: 'PM-KISAN-GENUINE'
  },
  recommendation: 'DO NOT PAY ANY MONEY. DO NOT ENTER YOUR AADHAAR OR BANK ACCOUNT DETAILS. Report this suspicious website and the payment UPI ID immediately to the National Cyber Crime Reporting Portal at cybercrime.gov.in or dial national helpline 1930.',
  isMockDemo: true,
  riskTier: 'CRITICAL'
};

export const NEEDS_REVIEW_MOCK_RESULT: VerificationResult = {
  id: 'VER-2026-NEEDS-REVIEW',
  overallStatus: 'NEEDS REVIEW',
  status: 'NEEDS REVIEW',
  riskScore: 42,
  confidenceScore: 72,
  riskDetails: {
    score: 42,
    tier: 'MODERATE',
    label: 'Needs Review / Partial Match',
    confidence: 72,
    explanation: 'Lower risk scores indicate fewer detected warning signals. Moderate scores with lower confidence suggest state-level or newly notified programs needing manual verification.'
  },
  schemeName: 'State Green Energy Solar Rooftop Incentive Pilot',
  detectedSchemeName: 'State Solar Rooftop Pilot (Regional DISCOM Initiative)',
  summary: 'Partially verified initiative. Information appears linked to a regional electricity distribution company (DISCOM), but lacks a central gazette indexing record.',
  verdictDescription: 'SchemeShield AI identified similarities with the national PM Surya Ghar scheme, but the submitted notice appears to be a municipal or state DISCOM specific pilot without standardized central indexing.',
  method: 'FORM',
  verificationMethod: 'FORM',
  verifiedAt: 'Just now',
  submittedDetails: {
    schemeName: 'State Green Energy Solar Rooftop Incentive Pilot',
    description: 'Special additional regional subsidy for 3kW rooftop solar installations managed through participating electricity distribution companies.',
    eligibility: 'Domestic consumers with valid DISCOM electricity consumer numbers.',
    benefits: 'Additional ₹15,000 state grant over and above central benchmark subsidies.',
    websiteUrl: 'https://state-discom-energy.org/solar',
    issuingAuthority: 'State Energy Development Agency'
  },
  analysisBreakdown: [
    {
      id: 'similarity',
      title: 'Scheme Similarity',
      status: 'PASS',
      statusLabel: '76% Complementary Match',
      confidence: 75,
      summary: 'Shares framework with National PM Surya Ghar Muft Bijli Yojana.',
      explanation: 'Appears to be a supplemental state-funded top-up subsidy built on the National Rooftop Solar portal framework.',
      evidenceOrAction: 'Review state energy department gazette for local addendums'
    },
    {
      id: 'description',
      title: 'Description Analysis',
      status: 'PASS',
      statusLabel: 'Plausible Technical Content',
      confidence: 80,
      summary: 'Details technical specifications consistent with DISCOM solar guidelines.',
      explanation: 'Mentions net metering, grid synchronisation, and DISCOM consumer numbering without aggressive claims.',
      evidenceOrAction: 'Standard technical terms consistent with electricity distribution'
    },
    {
      id: 'eligibility',
      title: 'Eligibility Comparison',
      status: 'PASS',
      statusLabel: 'Matches Meter Criteria',
      confidence: 78,
      summary: 'Limited to domestic grid-connected consumers with dedicated connection.',
      explanation: 'Eligibility matches standard state distribution guidelines for residential rooftop incentives.',
      evidenceOrAction: 'Consumer number verification required at local subdivision'
    },
    {
      id: 'benefits',
      title: 'Benefit Comparison',
      status: 'WARNING',
      statusLabel: 'Regional Add-on Unindexed',
      confidence: 68,
      summary: 'Additional state ₹15,000 grant requires local DISCOM circular validation.',
      explanation: 'Central portal lists national benchmarks up to ₹78,000. Supplementary state top-ups vary across state utilities and must be checked on local DISCOM circulars.',
      evidenceOrAction: 'Verify against latest state DISCOM tariff orders'
    },
    {
      id: 'official_sources',
      title: 'Official Source Verification',
      status: 'INCONCLUSIVE',
      statusLabel: 'Under Regional Review',
      confidence: 70,
      summary: 'Central myScheme lists central scheme, but state pilot portal is separate.',
      explanation: 'The national portal directs to pmsuryaghar.gov.in. Citizen should confirm if the local portal is an approved DISCOM vendor link.',
      evidenceOrAction: 'Check with your local electricity subdivision counter'
    },
    {
      id: 'document_ocr',
      title: 'Document/OCR Analysis',
      status: 'PASS',
      statusLabel: 'DISCOM Template Match',
      confidence: 74,
      summary: 'Circular layout aligns with state public utility notifications.',
      explanation: 'No obvious tampering or malicious alteration detected in public circular copy.',
      evidenceOrAction: 'Plausible utility notice format'
    },
    {
      id: 'suspicious_content',
      title: 'Suspicious Content Detection',
      status: 'PASS',
      statusLabel: 'No Scam Signals Detected',
      confidence: 88,
      summary: 'No private UPI handles or advance registration fees demanded.',
      explanation: 'Payment adjustments are specified as credits in monthly electricity utility bills.',
      evidenceOrAction: 'Zero direct payment fraud signals detected'
    }
  ],
  evidenceItems: [
    {
      id: 'ev-rev-1',
      title: 'Official source match found for national foundation',
      severity: 'SAFE',
      category: 'OFFICIAL_SOURCE',
      categoryLabel: 'National Program',
      explanation: 'Built around the Ministry of New and Renewable Energy (MNRE) PM Surya Ghar Muft Bijli Yojana.',
      sourceOrReference: 'pmsuryaghar.gov.in MNRE National Guidelines'
    },
    {
      id: 'ev-rev-2',
      title: 'Benefit description differs from central reference',
      severity: 'MEDIUM',
      category: 'BENEFIT_DISCREPANCY',
      categoryLabel: 'State Top-up',
      explanation: 'Includes an unindexed state top-up grant of ₹15,000 which varies by municipal jurisdiction.',
      sourceOrReference: 'State Electricity Regulatory Commission'
    },
    {
      id: 'ev-rev-3',
      title: 'No major warning detected in payment terms',
      severity: 'SAFE',
      category: 'PAYMENT_FRAUD',
      categoryLabel: 'Billing Integration',
      explanation: 'Subsidies are adjusted via electricity billing credits rather than cash requests.',
      sourceOrReference: 'DISCOM Consumer Billing Framework'
    }
  ],
  officialSources: REFERENCE_OFFICIAL_SOURCES.map((s) => ({
    ...s,
    status: s.id === 'src-myscheme' ? 'MATCHED' : 'UNDER_REVIEW',
    statusLabel: s.id === 'src-myscheme' ? 'Central Scheme Found' : 'Regional Verification Pending'
  })),
  similarSchemes: [
    {
      id: 'sim-solar-1',
      schemeName: 'PM Surya Ghar: Muft Bijli Yojana',
      similarityPercentage: 86,
      matchedFields: ['Rooftop Solar', 'Subsidy Framework', 'Residential Consumer'],
      explanation: 'The flagship central solar rooftop scheme providing up to ₹78,000 central financial assistance.',
      officialMinistry: 'Ministry of New and Renewable Energy',
      officialUrl: 'https://pmsuryaghar.gov.in',
      comparisonDetails: {
        originalClaim: 'Central financial assistance up to ₹78,000 for 3kW installation.',
        detectedClaim: 'State regional add-on of ₹15,000 extra subsidy.',
        verdict: 'Central program is confirmed legitimate; local top-up requires municipal DISCOM cross-check.'
      }
    }
  ],
  riskSignals: [
    {
      id: 'sig-r1',
      title: 'No payment demand or upfront fee detected',
      severity: 'SAFE',
      description: 'The circular does not solicit unauthorized advance fees.'
    },
    {
      id: 'sig-r2',
      title: 'State pilot requires local cross-verification',
      severity: 'WARNING',
      description: 'Central gazette archives do not centrally index regional municipal addendums.'
    }
  ],
  officialSchemeMatched: {
    name: 'PM Surya Ghar: Muft Bijli Yojana (Central Anchor)',
    ministry: 'Ministry of New and Renewable Energy',
    officialUrl: 'https://pmsuryaghar.gov.in',
    schemeId: 'MNRE-SOLAR-2024'
  },
  recommendation: 'This scheme appears legitimate but is a regional pilot. Before signing any vendor contracts, verify the participating vendor list directly at your local DISCOM electricity office or at pmsuryaghar.gov.in.',
  isMockDemo: true,
  riskTier: 'MODERATE'
};

export const MOCK_VERIFICATION_RESULTS_MAP: Record<string, VerificationResult> = {
  TRUSTED: TRUSTED_MOCK_RESULT,
  SUSPICIOUS: SUSPICIOUS_MOCK_RESULT,
  'HIGH RISK': HIGH_RISK_MOCK_RESULT,
  'NEEDS REVIEW': NEEDS_REVIEW_MOCK_RESULT
};
