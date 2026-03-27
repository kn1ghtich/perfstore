import { Bot, User } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const { t } = useTranslation();
  const content = message.content === '__CHAT_ERROR__' ? t('chat.error') : message.content;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-purple-100' : 'bg-gray-100'
      }`}>
        {isUser ? <User className="w-4 h-4 text-purple-600" /> : <Bot className="w-4 h-4 text-gray-600" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
        isUser
          ? 'bg-purple-600 text-white rounded-br-md'
          : 'bg-gray-100 text-gray-800 rounded-bl-md'
      }`}>
        <p className="whitespace-pre-wrap">{content || '...'}</p>
      </div>
    </div>
  );
}
