import { useState } from 'react';
import { Send } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export default function ChatInput({ onSend, disabled }) {
  const [message, setMessage] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-3 shrink-0"
      style={{ borderTop: '1px solid var(--dark-border)', background: '#0f0f0f' }}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t('chat.inputPlaceholder')}
        disabled={disabled}
        className="flex-1 text-sm disabled:opacity-50"
        style={{
          background: 'var(--input-bg)',
          border: '1px solid var(--input-border)',
          color: 'var(--text-primary)',
          padding: '8px 12px',
          outline: 'none',
          borderRadius: 0,
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'}
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="flex items-center justify-center transition-all disabled:opacity-30"
        style={{
          width: '38px',
          background: 'var(--gold)',
          color: '#000',
          border: 'none',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--gold-light)'; }}
        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gold)'}
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
