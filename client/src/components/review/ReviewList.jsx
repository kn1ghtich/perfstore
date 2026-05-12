import StarRating from './StarRating';
import { useTranslation } from '../../hooks/useTranslation';
import { shortNameFromString } from '../../utils/formatName';

export default function ReviewList({ reviews }) {
  const { t } = useTranslation();

  if (reviews.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('reviews.noReviews')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map(review => (
        <div key={review.id} className="p-5"
          style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.25)' }}>
                {shortNameFromString(review.user_name)?.[0] || '?'}
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {shortNameFromString(review.user_name)}
              </span>
              <StarRating rating={review.rating} size="sm" />
            </div>
            <span className="text-xs" style={{ color: 'var(--text-dimmed)' }}>
              {new Date(review.created_at).toLocaleDateString('ru-RU')}
            </span>
          </div>
          {review.title && (
            <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{review.title}</h4>
          )}
          {review.body && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{review.body}</p>
          )}
        </div>
      ))}
    </div>
  );
}
