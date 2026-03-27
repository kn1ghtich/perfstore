import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductBySlug } from '../api/products';
import { fetchReviews } from '../api/reviews';
import NotesPyramid from '../components/product/NotesPyramid';
import ReviewList from '../components/review/ReviewList';
import ReviewForm from '../components/review/ReviewForm';
import StarRating from '../components/review/StarRating';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft } from 'lucide-react';

export default function ProductPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgFailed, setImgFailed] = useState(false);

  const loadData = async () => {
    try {
      const { product: p } = await fetchProductBySlug(slug);
      setProduct(p);
      const { reviews: r } = await fetchReviews(p.id);
      setReviews(r);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setImgFailed(false);
    loadData();
  }, [slug]);

  if (loading) return <Spinner size="lg" />;
  if (!product) return <div className="text-center py-12">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/catalog" className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl flex items-center justify-center overflow-hidden aspect-square">
          {product.image_url && !imgFailed ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="text-center p-16">
              <div className="text-8xl mb-4">🧴</div>
              <p className="text-gray-400">{product.brand_name}</p>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="mb-2">
            <Link
              to={`/catalog?brand=${product.brand_slug}`}
              className="text-sm text-purple-600 hover:underline"
            >
              {product.brand_name}
            </Link>
            {product.brand_country && (
              <span className="text-sm text-gray-400 ml-2">({product.brand_country})</span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(parseFloat(product.avg_rating))} size="sm" />
              <span className="text-sm text-gray-600">
                {product.avg_rating > 0 ? `${product.avg_rating} (${product.review_count} reviews)` : 'No reviews'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</span>
            <Badge variant={product.gender === 'female' ? 'pink' : product.gender === 'male' ? 'blue' : 'green'}>
              {product.gender}
            </Badge>
            {product.concentration && <Badge variant="gray">{product.concentration}</Badge>}
            {product.volume_ml && <Badge variant="gray">{product.volume_ml}ml</Badge>}
          </div>

          <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

          {/* Categories */}
          {product.categories?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Scent Families</h3>
              <div className="flex gap-2">
                {product.categories.map((cat, i) => (
                  <Link key={i} to={`/catalog?category=${cat.slug}`}>
                    <Badge variant="purple">{cat.name}</Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Notes Pyramid */}
          <NotesPyramid notes={product.notes} />
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Reviews ({reviews.length})
        </h2>

        {user && (
          <div className="mb-6">
            <ReviewForm productId={product.id} onReviewAdded={loadData} />
          </div>
        )}
        {!user && (
          <p className="text-sm text-gray-500 mb-6">
            <Link to="/login" className="text-purple-600 hover:underline">Sign in</Link> to leave a review
          </p>
        )}

        <ReviewList reviews={reviews} />
      </section>
    </div>
  );
}
