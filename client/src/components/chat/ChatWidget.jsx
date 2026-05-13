import { MessageCircle, X } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import ChatPanel from './ChatPanel';

export default function ChatWidget() {
  const { isOpen, toggleChat } = useChat();

  return (
    <>
      <ChatPanel />
      <button
        data-chat-toggle
        onClick={toggleChat}
        className="fixed bottom-4 right-4 sm:right-6 z-50 w-14 h-14 flex items-center justify-center transition-all hover:scale-105"
        style={{
          background: isOpen ? '#1a1a1a' : 'var(--gold)',
          border: '1px solid ' + (isOpen ? 'var(--dark-border)' : 'var(--gold)'),
          boxShadow: isOpen ? 'none' : '0 0 24px rgba(201,168,76,0.35)',
        }}
      >
        {isOpen
          ? <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          : <MessageCircle className="w-6 h-6 text-black" />
        }
      </button>
    </>
  );
}
