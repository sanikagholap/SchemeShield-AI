import { PromptSuggestion } from '../types/assistant';

export const SUGGESTED_ASSISTANT_QUESTIONS: PromptSuggestion[] = [
  {
    id: 'q-1',
    category: 'Verification Guide',
    title: 'How to Verify a Scheme',
    query: 'How can I verify a government scheme?'
  },
  {
    id: 'q-2',
    category: 'Scam Detection',
    title: 'Signs of a Fake Scheme',
    query: 'What are common signs of a fake scheme?'
  },
  {
    id: 'q-3',
    category: 'Risk Scoring',
    title: 'Understanding Risk Scores',
    query: 'What does a high risk score mean?'
  },
  {
    id: 'q-4',
    category: 'Document Safety',
    title: 'Safe Document Sharing',
    query: 'What should I check before sharing my documents?'
  },
  {
    id: 'q-5',
    category: 'Duplicate Detection',
    title: 'Detecting Cloned Schemes',
    query: 'How does SchemeShield AI detect duplicate schemes?'
  }
];

export const MOCK_ASSISTANT_KNOWLEDGE_BASE: Record<string, string> = {
  'how can i verify a government scheme': `To verify a government scheme safely with SchemeShield AI:
1. **Check the Domain Extension**: Legitimate Indian government portals end exclusively in **.gov.in** or **.nic.in**. Avoid commercial *.com*, *.org*, or *.in* domains claiming official affiliation.
2. **Cross-Check Official Repositories**: Search on **myScheme (myscheme.gov.in)** or the **National Portal of India (india.gov.in)**.
3. **Inspect Application Fees**: Statutory central schemes are almost always free. Any demand for registration fees or UPI deposits is a red flag.
4. **Use SchemeShield AI**: Submit the scheme name, circular text, or brochure on our **/verify** page for automated gazette and duplicate cross-referencing.`,

  'what are common signs of a fake scheme': `Here are the top warning signals of fraudulent or spoofed schemes:
• **Upfront Payment Demands**: Requesting ₹250 to ₹1,000 for "instant delivery", registration fees, or processing charges.
• **Private Payment Gateways**: Personal UPI QR codes, GooglePay handles, or unofficial payment links.
• **Deceptive Domains**: Hyphenated imitation URLs like *pmkisan-tractoryojana-gov.in* instead of *pmkisan.gov.in*.
• **Artificial Urgency**: Phrases like *"Apply within 24 hours"* or *"Limited slots available under PM quota"*.
• **Universal Eligibility**: Claiming that all citizens can receive high-value assets without income, land, or caste documentation.
• **WhatsApp/Telegram Circulars**: Official notifications are issued via ministerial press releases, never via untraceable forward links.`,

  'what does a high risk score mean': `In SchemeShield AI, the Risk Score ranges from 0 to 100:
• **Low Risk (0–25)**: Scheme parameters match verified government gazettes, approved nodal portals, and zero fee demands.
• **Moderate Risk (26–60)**: Potential discrepancies, altered terms, third-party intermediaries, or unverified regional addendums.
• **High Risk / Critical (61–100)**: Strong indicators of malicious fraud, confirmed advance fee traps, fake domains, or direct matches with PIB Fact Check debunk bulletins.

*Remember: Lower risk scores indicate fewer detected warning signals.*`,

  'what should i check before sharing my documents': `Before submitting documents (Aadhaar, PAN, Bank Passbook, Ration Card):
1. **Never share OTPs**: Officials will never call or message asking for Aadhaar OTPs or banking PINs.
2. **Masked Aadhaar**: Where possible, use Masked Aadhaar (showing only the last 4 digits) for initial verification.
3. **Verify Portal Security**: Ensure the site uses HTTPS with a valid certificate registered to National Informatics Centre (NIC).
4. **Physical CSC Verification**: When in doubt, visit an authorized **Common Service Centre (CSC)** or district collectorate office in person.`,

  'how does schemeshield ai detect duplicate schemes': `SchemeShield AI detects duplicate and altered schemes using multi-layer NLP and comparison algorithms:
• **Lexical & Semantic Similarity**: Compares the scheme name, objectives, and phrasing against 1,000+ indexed central and state schemes.
• **Benefit & Clause Discrepancy Engine**: Flags when a known scheme name (e.g. *PM-KISAN*) has unauthorized benefits attached (e.g. *Free Tractor Giveaway*).
• **Domain Hierarchy Analysis**: Detects lookalike typo-squatting domains impersonating government ministries.
• **PIB Fact Check Integration**: Automatically matches viral claims against debunks published by the Press Information Bureau.`
};
