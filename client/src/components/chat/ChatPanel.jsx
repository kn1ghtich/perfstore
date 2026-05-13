import { useRef, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useTranslation } from '../../hooks/useTranslation';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function ChatPanel() {
  const { messages, isStreaming, isOpen, sendMessage, toggleChat } = useChat();
  const { t } = useTranslation();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-20 right-4 sm:right-6 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] flex flex-col z-50 overflow-hidden"
      style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--dark-border)', background: '#0f0f0f' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 flex items-center justify-center shrink-0" style={{ background: 'var(--gold)' }}>
            <Sparkles className="w-3.5 h-3.5 text-black" />
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-[0.1em] uppercase text-white">{t('chat.title')}</h3>
            <p className="text-[10px] tracking-wide" style={{ color: 'var(--text-muted)' }}>{t('chat.subtitle')}</p>
          </div>
        </div>
        <button onClick={toggleChat}
          className="w-7 h-7 flex items-center justify-center transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: '#0a0a0a' }}>
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center"
              style={{ border: '1px solid var(--dark-border)', background: 'rgba(201,168,76,0.06)' }}>
              <Sparkles className="w-5 h-5" style={{ color: 'var(--gold)' }} />
            </div>
            <p className="text-sm leading-relaxed mb-6 font-light" style={{ color: 'var(--text-secondary)' }}>
              {t('chat.greeting')}
            </p>
            <div className="space-y-2">
              {[t('chat.suggestion1'), t('chat.suggestion2'), t('chat.suggestion3')].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(suggestion)}
                  className="block w-full text-left text-xs px-3 py-2.5 transition-all"
                  style={{
                    border: '1px solid var(--dark-border)',
                    color: 'var(--gold)',
                    background: 'transparent',
                    letterSpacing: '0.03em',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; e.currentTarget.style.borderColor = 'var(--gold)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--dark-border)'; }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
