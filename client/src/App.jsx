import { BrowserRouter, useLocation } from 'react-router-dom';
import { Component, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRouter from './routes/AppRouter';
import ChatWidget from './components/chat/ChatWidget';
import NotificationPanel from './components/layout/NotificationPanel';
import { Toaster } from 'react-hot-toast';

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('[ErrorBoundary]', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fff', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Что-то пошло не так</h1>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>{this.state.error.message}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 24px', background: '#C9A84C', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Перезагрузить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <NotificationProvider>
                  <ChatProvider>
                    <ScrollToTop />
                    <AppRouter />
                    <NotificationPanel />
                    <ChatWidget />
                    <Toaster position="bottom-left" />
                  </ChatProvider>
                </NotificationProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
