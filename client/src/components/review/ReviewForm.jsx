import { useState } from 'react';
import { createReview } from '../../api/reviews';
import { useTranslation } from '../../hooks/useTranslation';
import StarRating from './StarRating';

export default function ReviewForm({ productId, onReviewAdded }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError(t('reviews.selectRating'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createReview(productId, { rating, title, body });
      setRating(0);
      setTitle('');
      setBody('');
      onReviewAdded?.();
    } catch (err) {
      setError(err.response?.data?.error || t('reviews.submitFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-4 space-y-3">
      <h4 className="font-medium text-gray-900">{t('reviews.writeReview')}</h4>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <label className="block text-sm text-gray-600 mb-1">{t('reviews.rating')}</label>
        <StarRating rating={rating} onChange={setRating} />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">{t('reviews.titleOptional')}</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">{t('reviews.review')}</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? t('reviews.submitting') : t('reviews.submit')}
      </button>
    </form>
  );
}
