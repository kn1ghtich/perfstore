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
    <div className="fixed bottom-20 right-4 sm:right-6 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-purple-600 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <div>
            <h3 className="font-semibold text-sm">{t('chat.title')}</h3>
            <p className="text-xs text-purple-200">{t('chat.subtitle')}</p>
          </div>
        </div>
        <button onClick={toggleChat} className="hover:bg-purple-500 p-1 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="w-10 h-10 text-purple-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{t('chat.greeting')}</p>
            <div className="mt-4 space-y-2">
              {[t('chat.suggestion1'), t('chat.suggestion2'), t('chat.suggestion3')].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(suggestion)}
                  className="block w-full text-left text-sm text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-lg transition-colors"
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
