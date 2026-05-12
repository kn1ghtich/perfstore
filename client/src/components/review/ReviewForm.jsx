import { useState } from 'react';
import { createReview } from '../../api/reviews';
import { useTranslation } from '../../hooks/useTranslation';
import StarRating from './StarRating';

const FIELD = {
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  color: 'var(--text-primary)',
  padding: '8px 12px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
  borderRadius: 0,
};
const LABEL = {
  display: 'block',
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
  marginBottom: 6,
  fontWeight: 500,
};

export default function ReviewForm({ productId, onReviewAdded }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle]   = useState('');
  const [body, setBody]     = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError(t('reviews.selectRating')); return; }
    setError('');
    setLoading(true);
    try {
      await createReview(productId, { rating, title, body });
      setRating(0); setTitle(''); setBody('');
      onReviewAdded?.();
    } catch (err) {
      setError(err.response?.data?.error || t('reviews.submitFailed'));
    } finally {
      setLoading(false);
    }
  };

  const focus = (e) => (e.target.style.borderColor = 'var(--gold)');
  const blur  = (e) => (e.target.style.borderColor = 'var(--input-border)');

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4"
      style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
      <h4 className="text-xs tracking-[0.18em] uppercase font-semibold" style={{ color: 'var(--gold)' }}>
        {t('reviews.writeReview')}
      </h4>

      {error && (
        <div className="px-3 py-2 text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
          {error}
        </div>
      )}

      <div>
        <label style={LABEL}>{t('reviews.rating')}</label>
        <StarRating rating={rating} onChange={setRating} />
      </div>

      <div>
        <label style={LABEL}>{t('reviews.titleOptional')}</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          style={FIELD} onFocus={focus} onBlur={blur} />
      </div>

      <div>
        <label style={LABEL}>{t('reviews.review')}</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)}
          rows={3} style={{ ...FIELD, resize: 'none' }} onFocus={focus} onBlur={blur} />
      </div>

      <button type="submit" disabled={loading}
        className="px-5 py-2.5 text-xs tracking-[0.15em] uppercase font-semibold transition-all disabled:opacity-50"
        style={{ background: loading ? 'var(--gold-dim)' : 'var(--gold)', color: '#000' }}>
        {loading ? t('reviews.submitting') : t('reviews.submit')}
      </button>
    </form>
  );
}
