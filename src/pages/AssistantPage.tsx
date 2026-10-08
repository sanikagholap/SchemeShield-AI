import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  Bot,
  User,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageContainer } from '../components/ui/PageContainer';
import { assistantService } from '../services/assistantService';
import { ChatMessage, PromptSuggestion } from '../types/assistant';

export const AssistantPage: React.FC = () => {
  const initialWelcomeMessage: ChatMessage = {
    id: 'msg-welcome',
    sender: 'assistant',
    content: `Hello! I am the **SchemeShield AI Assistant**. 

I can assist you with understanding official government welfare schemes, verifying eligibility requirements, identifying red flags in WhatsApp announcements, and guiding you on safe document practices.

Select one of the suggested topics below or ask any question in plain language.`,
    timestamp: 'Just now',
    suggestedActions: [
      { label: 'Verify a Scheme Announcement', route: '/verify' },
      { label: 'Explore Verified Schemes', route: '/schemes' }
    ]
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const [inputMessage, setInputMessage] = useState('');
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      content: text.trim(),
      timestamp: new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date())
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await assistantService.sendMessage(text.trim());
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          content: 'Unable to process your question at this moment. Please try again.',
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([initialWelcomeMessage]);
  };

  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard?.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <PageContainer style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>
          Dashboard
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>AI Assistant</span>
      </div>

      {/* Page Heading */}
      <div style={{ maxWidth: '840px', margin: '0 auto var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: '4px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              <Sparkles size={14} />
              <span>CITIZEN GUIDANCE AI</span>
            </div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0 0 var(--space-1) 0' }}>
              SchemeShield AI Assistant
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>
              Ask questions about government schemes, eligibility, benefits, and verification.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearChat}
            leftIcon={<RotateCcw size={13} />}
            style={{ fontSize: '11px' }}
          >
            Clear Conversation
          </Button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        {/* Suggested Questions Section */}
        {messages.length <= 1 && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <HelpCircle size={14} />
              <span>Frequently Asked Citizen Questions:</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
              {suggestions.map((sug) => (
                <button
                  key={sug.id}
                  type="button"
                  onClick={() => handleSendMessage(sug.query)}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-surface)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-medium)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                  }}
                >
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                    {sug.category}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {sug.query}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat History Panel */}
        <Card
          variant="default"
          padding="none"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '560px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-medium)'
          }}
        >
          {/* Scrollable Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-5)',
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
                    flexDirection: isUser ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)'
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: isUser ? 'var(--color-brand-navy)' : 'var(--color-primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {isUser ? <User size={18} /> : <Bot size={18} />}
                  </div>

                  {/* Message Bubble */}
                  <div style={{ maxWidth: '80%' }}>
                    <div
                      style={{
                        padding: 'var(--space-4) var(--space-5)',
                        borderRadius: isUser
                          ? 'var(--radius-xl) var(--radius-sm) var(--radius-xl) var(--radius-xl)'
                          : 'var(--radius-sm) var(--radius-xl) var(--radius-xl) var(--radius-xl)',
                        backgroundColor: isUser ? 'var(--color-primary)' : 'var(--bg-surface)',
                        color: isUser ? '#ffffff' : 'var(--text-primary)',
                        border: isUser ? 'none' : '1px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-xs)',
                        fontSize: 'var(--text-sm)',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {msg.content}

                      {/* Sources if present */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div
                          style={{
                            marginTop: 'var(--space-3)',
                            paddingTop: 'var(--space-2)',
                            borderTop: '1px solid var(--border-light)',
                            fontSize: '11px',
                            color: 'var(--text-tertiary)'
                          }}
                        >
                          <strong>Reference Sources:</strong>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: '4px' }}>
                            {msg.sources.map((s, idx) => (
                              <a
                                key={idx}
                                href={s.url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  color: 'var(--color-primary)',
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  fontWeight: 600
                                }}
                              >
                                <span>{s.name}</span>
                                <ExternalLink size={10} />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggested Actions if present */}
                      {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                          {msg.suggestedActions.map((act, idx) => (
                            <Link key={idx} to={act.route || '/verify'} style={{ textDecoration: 'none' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 10px',
                                  borderRadius: 'var(--radius-full)',
                                  backgroundColor: 'var(--color-primary-light)',
                                  color: 'var(--color-primary)',
                                  fontSize: '11px',
                                  fontWeight: 700
                                }}
                              >
                                <ShieldCheck size={12} />
                                <span>{act.label}</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Timestamp & Actions */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isUser ? 'flex-end' : 'flex-start',
                        gap: 'var(--space-2)',
                        marginTop: '4px',
                        padding: '0 4px',
                        fontSize: '10px',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.content, msg.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            padding: '2px 4px'
                          }}
                          title="Copy answer"
                        >
                          {copiedId === msg.id ? <Check size={11} color="var(--color-verified)" /> : <Copy size={11} />}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Bot size={18} />
                </div>
                <div
                  style={{
                    padding: '12px 18px',
                    borderRadius: 'var(--radius-sm) var(--radius-xl) var(--radius-xl) var(--radius-xl)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    SchemeShield AI is formulating guidance
                  </span>
                  <span style={{ display: 'inline-flex', gap: '3px', marginLeft: '6px' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', animation: 'pulse 1s infinite' }} />
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', animation: 'pulse 1s infinite 0.2s' }} />
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', animation: 'pulse 1s infinite 0.4s' }} />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-medium)',
              display: 'flex',
              gap: 'var(--space-3)',
              alignItems: 'center'
            }}
          >
            <div style={{ flex: 1 }}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about scheme eligibility, fees, suspicious links..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isTyping}
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                  outline: 'none'
                }}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputMessage.trim() || isTyping}
              leftIcon={<Send size={16} />}
              style={{ height: '44px', minWidth: '100px' }}
            >
              Send
            </Button>
          </form>
        </Card>

        {/* Small AI Guidance Disclaimer as required by Section 5 */}
        <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            🔒 <em>AI-generated guidance may not replace information from official government sources. Always verify important information independently through official portals (.gov.in).</em>
          </p>
        </div>
      </div>
    </PageContainer>
  );
};
