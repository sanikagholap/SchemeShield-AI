import { ChatMessage, PromptSuggestion } from '../types/assistant';
import { simulateLatency } from './apiClient';

const DEFAULT_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: 'sug-1',
    category: 'Scam Detection',
    title: 'Verify Registration Fee',
    query: 'Is there any registration fee for PM Kisan Samman Nidhi or Ayushman Bharat?'
  },
  {
    id: 'sug-2',
    category: 'Official Portals',
    title: 'Recognize Genuine Portals',
    query: 'How can I identify if a government scheme portal is authentic vs fake domain?'
  },
  {
    id: 'sug-3',
    category: 'Loan Scams',
    title: 'MUDRA Loan Sanction Letters',
    query: 'I received a WhatsApp letter offering a ₹10 Lakh Mudra Loan asking for a 5% GST deposit. Is it genuine?'
  },
  {
    id: 'sug-4',
    category: 'Document Safety',
    title: 'Safe eKYC Guidelines',
    query: 'What documents does the government ask for scheme enrollment, and when is it a scam?'
  }
];

export const assistantService = {
  /**
   * Get pre-configured prompt suggestions
   */
  async getPromptSuggestions(): Promise<PromptSuggestion[]> {
    return simulateLatency(DEFAULT_SUGGESTIONS, 150);
  },

  /**
   * Send citizen question to AI assistant (Mock response generator)
   */
  async sendMessage(userMessage: string): Promise<ChatMessage> {
    const lower = userMessage.toLowerCase();
    let reply = `SchemeShield AI Assistant: Government welfare schemes generally DO NOT charge upfront registration fees or deposits through private bank accounts, UPI IDs, or third-party websites. Always verify on official domains ending with '.gov.in' or '.nic.in'.`;

    if (lower.includes('fee') || lower.includes('money') || lower.includes('deposit') || lower.includes('gst')) {
      reply = `⚠️ **Critical Advisory**: Legitimate Central and State Government schemes do NOT demand registration fees or GST deposits via WhatsApp or unofficial portals. Any requirement to pay money to receive a grant or loan sanction is almost certainly fraudulent.`;
    } else if (lower.includes('mudra')) {
      reply = `⚠️ **Alert regarding MUDRA Loans**: MUDRA loans are processed exclusively through authorized commercial banks, RRBs, and NBFCs. The Government never issues direct sanction letters on WhatsApp and NEVER charges a processing or GST deposit beforehand.`;
    } else if (lower.includes('kisan')) {
      reply = `🌾 **PM-KISAN Guidelines**: PM-KISAN provides direct benefit transfer (₹6,000/year in 3 installments) directly to Aadhaar-seeded bank accounts. There is NO "Free Tractor Scheme" under PM-KISAN, and official eKYC can be completed free on pmkisan.gov.in or CSC centers.`;
    }

    const assistantMsg: ChatMessage = {
      id: `ast-${Date.now()}`,
      sender: 'assistant',
      content: reply,
      timestamp: 'Just now',
      sources: [
        { name: 'PIB Fact Check Registry', url: 'https://factcheck.pib.gov.in' },
        { name: 'National Portal of India', url: 'https://india.gov.in' }
      ],
      suggestedActions: [
        { label: 'Run Full Scheme Verification', route: '/verify' },
        { label: 'Explore Verified Schemes', route: '/schemes' }
      ]
    };

    return simulateLatency(assistantMsg, 600);
  }
};
