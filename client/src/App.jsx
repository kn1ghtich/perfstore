import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import AppRouter from './routes/AppRouter';
import ChatWidget from './components/chat/ChatWidget';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ChatProvider>
          <AppRouter />
          <ChatWidget />
          <Toaster position="bottom-left" />
        </ChatProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
