import { createContext, useState, useCallback } from 'react';
import { createChatSession, sendChatMessage } from '../api/chat';

export const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const startSession = useCallback(async () => {
    if (sessionId) return sessionId;
    const data = await createChatSession();
    setSessionId(data.sessionId);
    return data.sessionId;
  }, [sessionId]);

  const sendMessage = useCallback(async (content) => {
    const sid = await startSession();

    setMessages(prev => [...prev, { role: 'user', content, timestamp: new Date() }]);
    setIsStreaming(true);

    // Add placeholder for assistant
    setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date() }]);

    await sendChatMessage(
      sid,
      content,
      (token) => {
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          updated[updated.length - 1] = { ...lastMsg, content: lastMsg.content + token };
          return updated;
        });
      },
      () => setIsStreaming(false),
      (error) => {
        setIsStreaming(false);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: '__CHAT_ERROR__',
            timestamp: new Date(),
          };
          return updated;
        });
      }
    );
  }, [startSession]);

  const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <ChatContext.Provider value={{ messages, isStreaming, isOpen, sendMessage, toggleChat }}>
      {children}
    </ChatContext.Provider>
  );
}
