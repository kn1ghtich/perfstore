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
    <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-gray-200">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t('chat.inputPlaceholder')}
        disabled={disabled}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 disabled:opacity-50 transition-colors"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
