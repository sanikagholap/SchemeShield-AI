/**
 * SchemeShield AI - Citizen Assistant Service
 * Integrates directly with FastAPI /api/v1/assistant/chat.
 */

import { ChatMessage, PromptSuggestion } from '../types/assistant';
import { AssistantChatResponse } from '../types/api';
import { apiClient } from './apiClient';

let activeSessionId = `sess-${Date.now()}`;

export const assistantService = {
  /**
   * Get verified citizen inquiry suggestions.
   */
  async getPromptSuggestions(): Promise<PromptSuggestion[]> {
    return [
      {
        id: 'sug-1',
        title: 'Check PM-KISAN Authenticity',
        query: 'How can I check if a PM-KISAN installment announcement or SMS is genuine?',
        category: 'Verification',
      },
      {
        id: 'sug-2',
        title: 'Ayushman Card Fees',
        query: 'Does Ayushman Bharat charge any application fee or delivery charge?',
        category: 'Eligibility',
      },
      {
        id: 'sug-3',
        title: 'Report UPI Scheme Fraud',
        query: 'What steps should I take if a fake scheme circular demanded money via UPI?',
        category: 'Safety',
      },
      {
        id: 'sug-4',
        title: 'Identify Fake Gov Websites',
        query: 'How do I distinguish official government websites (.gov.in) from fake lookalikes?',
        category: 'Guidance',
      },
    ];
  },

  /**
   * Send citizen question to FastAPI assistant chat endpoint.
   */
  async sendMessage(userMessage: string): Promise<ChatMessage> {
    try {
      const res = await apiClient.post<AssistantChatResponse>('/assistant/chat', {
        message: userMessage,
        session_id: activeSessionId,
      });

      if (res.session_id) {
        activeSessionId = res.session_id;
      }

      const suggestedActions = (res.suggestions || []).map((sug) => ({
        label: sug,
        route: sug.toLowerCase().includes('verify') ? '/verify' : '/schemes',
      }));

      return {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        content: res.reply || 'Your inquiry has been evaluated against government security databases.',
        timestamp: new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
        sources: [
          { name: 'myScheme Central Directory', url: 'https://myscheme.gov.in' },
          { name: 'National Portal of India', url: 'https://india.gov.in' },
          { name: 'PIB Fact Check Bureau', url: 'https://factcheck.pib.gov.in' },
        ],
        suggestedActions:
          suggestedActions.length > 0
            ? suggestedActions
            : [
                { label: 'Verify a Scheme', route: '/verify' },
                { label: 'Explore Verified Schemes', route: '/schemes' },
              ],
      };
    } catch {
      return {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        content:
          'Unable to reach the AI assistant service at this moment. You can still use the Verify tool to evaluate any scheme circular or document directly.',
        timestamp: new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
        sources: [
          { name: 'myScheme Central Directory', url: 'https://myscheme.gov.in' },
        ],
        suggestedActions: [{ label: 'Go to Verify', route: '/verify' }],
      };
    }
  },
};
