import { Bot, User } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const { t } = useTranslation();
  const content = message.content === '__CHAT_ERROR__' ? t('chat.error') : message.content;

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center"
        style={{
          background: isUser ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)',
          border: '1px solid ' + (isUser ? 'rgba(201,168,76,0.4)' : 'var(--dark-border)'),
        }}>
        {isUser
          ? <User className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
          : <Bot className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
        }
      </div>

      {/* Bubble */}
      <div
        className="max-w-[80%] px-3 py-2.5 text-sm"
        style={isUser ? {
          background: 'rgba(201,168,76,0.12)',
          border: '1px solid rgba(201,168,76,0.3)',
          color: '#fff',
        } : {
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--dark-border)',
          color: 'var(--text-secondary)',
        }}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{content || '...'}</p>
      </div>
    </div>
  );
}
