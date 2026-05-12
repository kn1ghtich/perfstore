import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, Link } from 'react-router-dom';

const FIELD = {
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  color: 'var(--text-primary)',
  borderRadius: 0,
  padding: '10px 14px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
};
const LABEL = { display: 'block', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 };

export default function RegisterForm() {
  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError(t('auth.passwordMin'));
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
          {error}
        </div>
      )}

      <div>
        <label style={LABEL}>{t('auth.name')}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={FIELD}
          onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'}
          placeholder="Ваше имя"
        />
      </div>

      <div>
        <label style={LABEL}>{t('auth.email')}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={FIELD}
          onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'}
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label style={LABEL}>{t('auth.password')}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={FIELD}
          onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'}
          placeholder="Минимум 6 символов"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-xs tracking-[0.15em] uppercase font-semibold transition-all disabled:opacity-50"
        style={{ background: loading ? 'var(--gold-dim)' : 'var(--gold)', color: '#000' }}
      >
        {loading ? t('auth.creatingAccount') : t('auth.signUp')}
      </button>

      <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        {t('auth.hasAccount')}{' '}
        <Link to="/login" style={{ color: 'var(--gold)' }} className="hover:underline">
          {t('auth.signInLink')}
        </Link>
      </p>
    </form>
  );
}
