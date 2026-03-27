import { MessageCircle } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import ChatPanel from './ChatPanel';

export default function ChatWidget() {
  const { isOpen, toggleChat } = useChat();

  return (
    <>
      <ChatPanel />
      <button
        onClick={toggleChat}
        className={`fixed bottom-4 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isOpen
            ? 'bg-gray-600 hover:bg-gray-700'
            : 'bg-purple-600 hover:bg-purple-700 animate-bounce'
        }`}
        style={{ animationIterationCount: 3 }}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    </>
  );
}
