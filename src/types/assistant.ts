export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    route?: string;
    action?: string;
  }[];
  sources?: {
    name: string;
    url?: string;
  }[];
}

export type AssistantMessage = ChatMessage;

export interface PromptSuggestion {
  id: string;
  category: string;
  title: string;
  query: string;
}
