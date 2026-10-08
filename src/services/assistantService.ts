import { ChatMessage, PromptSuggestion } from '../types/assistant';
import { SUGGESTED_ASSISTANT_QUESTIONS, MOCK_ASSISTANT_KNOWLEDGE_BASE } from '../data/mockAssistant';
import { simulateLatency } from './apiClient';

export const assistantService = {
  /**
   * Get pre-configured prompt suggestions
   */
  async getPromptSuggestions(): Promise<PromptSuggestion[]> {
    return simulateLatency(SUGGESTED_ASSISTANT_QUESTIONS, 150);
  },

  /**
   * Send citizen question to AI assistant (Mock response generator)
   */
  async sendMessage(userMessage: string): Promise<ChatMessage> {
    const normalized = userMessage.toLowerCase().trim().replace(/[?.,!]/g, '');

    // Check exact or partial matches from knowledge base
    let matchedAnswer: string | undefined;

    for (const [key, answer] of Object.entries(MOCK_ASSISTANT_KNOWLEDGE_BASE)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        matchedAnswer = answer;
        break;
      }
    }

    if (!matchedAnswer) {
      if (
        normalized.includes('tractor') ||
        normalized.includes('free tractor')
      ) {
        matchedAnswer = `🚨 **Scam Alert — PM Free Tractor Scheme**:
The Government of India is **NOT** running any free tractor scheme under PM-KISAN.
• The official PM-KISAN initiative only provides ₹6,000 annual direct income support.
• Fraudulent circulars demand ₹499 upfront registration fee via personal UPI.
• PIB Fact Check has officially flagged this as a cyber scam. **Do not pay any money.**`;
      } else if (
        normalized.includes('ayushman') ||
        normalized.includes('golden card')
      ) {
        matchedAnswer = `🏥 **Ayushman Bharat (PM-JAY) Official Guidance**:
• The official Ayushman Golden Card is issued **100% free of cost** at government hospitals and Common Service Centres (CSCs).
• Never pay ₹250 or any doorstep delivery fee to private websites ending in *.com*.
• Eligible families are determined by SECC 2011 records. Self-verify at **beneficiary.nha.gov.in**.`;
      } else if (
        normalized.includes('fee') ||
        normalized.includes('money') ||
        normalized.includes('payment') ||
        normalized.includes('upi')
      ) {
        matchedAnswer = `⚠️ **Critical Citizen Warning**:
Genuine Central and State welfare programs **never charge registration fees** via WhatsApp, SMS links, or personal UPI IDs.
If an announcement asks for an application fee, deposit, or document courier charge:
1. Do not transfer funds.
2. Verify the scheme on our **/verify** tool.
3. Report the fraud to the National Cyber Crime Reporting Portal at **cybercrime.gov.in** or dial **1930**.`;
      } else if (
        normalized.includes('mudra') ||
        normalized.includes('loan')
      ) {
        matchedAnswer = `💼 **MUDRA Loan Guidelines**:
• MUDRA loans up to ₹20 Lakh are sanctioned directly through scheduled commercial banks and NBFCs.
• The Ministry of Finance **never** issues WhatsApp sanction letters or requests 5% advance GST deposits.
• Apply only through bank branches or the official **udyamimitra.in** portal.`;
      } else if (
        normalized.includes('scholarship')
      ) {
        matchedAnswer = `🎓 **National Scholarship Portal (NSP)**:
• All verified Central Sector and Post-Matric scholarships are submitted via **scholarships.gov.in**.
• Application submission is strictly free.
• Disbursal occurs directly into the student's Aadhaar-linked PFMS bank account.`;
      } else {
        matchedAnswer = `SchemeShield AI Assistant:
Government welfare initiatives never solicit advance registration fees, personal UPI transfers, or sensitive banking OTPs.
• Check if the portal URL ends in **.gov.in** or **.nic.in**.
• Cross-reference official guidelines on **myScheme (myscheme.gov.in)**.
• You can test any suspicious text or upload documents directly on our **/verify** page for instant automated analysis.`;
      }
    }

    const assistantMsg: ChatMessage = {
      id: `ast-${Date.now()}`,
      sender: 'assistant',
      content: matchedAnswer,
      timestamp: new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
      sources: [
        { name: 'myScheme Official Catalog', url: 'https://myscheme.gov.in' },
        { name: 'PIB Fact Check Bureau', url: 'https://factcheck.pib.gov.in' },
        { name: 'National Portal of India', url: 'https://india.gov.in' }
      ],
      suggestedActions: [
        { label: 'Verify a Suspicious Claim', route: '/verify' },
        { label: 'Explore Verified Schemes', route: '/schemes' }
      ]
    };

    return simulateLatency(assistantMsg, 500);
  }
};
