import StarRating from './StarRating';
import { useTranslation } from '../../hooks/useTranslation';

export default function ReviewList({ reviews }) {
  const { t } = useTranslation();

  if (reviews.length === 0) {
    return <p className="text-gray-500 text-sm">{t('reviews.noReviews')}</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <div key={review.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-900 text-sm">{review.user_name}</span>
              <StarRating rating={review.rating} size="sm" />
            </div>
            <span className="text-xs text-gray-400">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
          {review.title && <h4 className="font-medium text-gray-800 text-sm mb-1">{review.title}</h4>}
          {review.body && <p className="text-gray-600 text-sm">{review.body}</p>}
        </div>
      ))}
    </div>
  );
}
