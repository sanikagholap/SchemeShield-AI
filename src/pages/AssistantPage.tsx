import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  Bot,
  User,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageContainer } from '../components/ui/PageContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { assistantService } from '../services/assistantService';
import { ChatMessage, PromptSuggestion } from '../types/assistant';

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: 'Hello! I am the **SchemeShield Citizen Assistant**. Ask me about government scheme rules, official application procedures, upfront fee warnings, or paste a WhatsApp forward to see if it shows signs of a scam.',
      timestamp: 'Online',
      suggestedActions: [
        { label: 'Check PM-KISAN tractor scam', action: 'Is there any tractor scheme under PM-KISAN?' },
        { label: 'Learn about genuine .gov.in domains', action: 'How to check if a scheme portal is genuine?' }
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    assistantService.getPromptSuggestions().then(setSuggestions);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await assistantService.sendMessage(text);
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          content: 'Unable to connect to assistant logic. Please retry.',
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <PageContainer style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      <SectionHeading
        badge="Citizen Support"
        title="SchemeShield AI Assistant"
        description="Ask any question regarding scheme authenticity, eligibility rules, and how to verify questionable announcements."
      />

      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        {/* Suggested Queries Grid */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
            Suggested Queries
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
            {suggestions.map((sug) => (
              <button
                key={sug.id}
                type="button"
                onClick={() => handleSendMessage(sug.query)}
                style={{
                  textAlign: 'left',
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)' }}>
                  {sug.category}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {sug.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Conversation Card */}
        <Card variant="glass" padding="none" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
          {/* Messages Stream */}
          <div
            style={{
              height: '460px',
              overflowY: 'auto',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              backgroundColor: 'var(--bg-app)'
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%'
                  }}
                >
                  {!isUser && (
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Bot size={18} />
                    </div>
                  )}

                  <div
                    style={{
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-xl)',
                      backgroundColor: isUser ? 'var(--color-primary)' : 'var(--bg-surface)',
                      color: isUser ? '#ffffff' : 'var(--text-primary)',
                      border: isUser ? 'none' : '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-xs)',
                      fontSize: 'var(--text-sm)',
                      lineHeight: 1.6
                    }}
                  >
                    <div style={{ whiteSpace: 'pre-line' }}>{msg.content}</div>

                    {/* Sources Citations */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                          Verified Gazette Reference:
                        </div>
                        {msg.sources.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '11px', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '8px' }}
                          >
                            <span>{s.name}</span>
                            <ExternalLink size={10} />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Suggested follow-up actions */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {msg.suggestedActions.map((act, i) => (
                          act.route ? (
                            <Link key={i} to={act.route}>
                              <button
                                type="button"
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  backgroundColor: 'var(--color-primary-light)',
                                  color: 'var(--color-primary)',
                                  padding: '4px 10px',
                                  borderRadius: 'var(--radius-full)',
                                  border: '1px solid #bfdbfe',
                                  cursor: 'pointer'
                                }}
                              >
                                {act.label} →
                              </button>
                            </Link>
                          ) : (
                            <button
                              key={i}
                              type="button"
                              onClick={() => act.action && handleSendMessage(act.action)}
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                backgroundColor: 'var(--color-primary-light)',
                                color: 'var(--color-primary)',
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                border: '1px solid #bfdbfe',
                                cursor: 'pointer'
                              }}
                            >
                              {act.label}
                            </button>
                          )
                        ))}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-brand-navy)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <User size={18} />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
                <Bot size={16} />
                <span>Assistant is consulting verified gazette index...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              gap: 'var(--space-2)'
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question about government scheme legitimacy or fee rules..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-medium)',
                fontSize: 'var(--text-sm)',
                outline: 'none'
              }}
            />
            <Button type="submit" variant="primary" disabled={!inputMessage.trim() || isTyping} rightIcon={<Send size={16} />}>
              Send
            </Button>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
};
