import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { fetchRecommendations } from '../../api/products';
import ProductCarousel from '../product/ProductCarousel';
import Spinner from '../ui/Spinner';

export default function RecommendationsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetchRecommendations()
      .then(({ products }) => setProducts(products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  // Don't render if no recommendations
  if (!loading && products.length === 0) return null;

  return (
    <section className="py-20" style={{ background: '#0a0a0a', borderTop: '1px solid var(--dark-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8" style={{ background: 'var(--gold)' }} />
              <span className="text-[10px] tracking-[0.35em] uppercase flex items-center gap-1.5" style={{ color: 'var(--gold)' }}>
                <Sparkles className="w-3 h-3" /> Только для вас
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-white">
              Рекомендуем вам
            </h2>
            <p className="text-xs mt-2 font-light" style={{ color: 'var(--text-muted)' }}>
              На основе ваших покупок и избранного
            </p>
          </div>
          <Link to="/catalog"
            className="hidden sm:flex items-center gap-2 text-xs tracking-[0.15em] uppercase pb-px transition-colors"
            style={{ color: 'var(--gold)', borderBottom: '1px solid var(--gold)' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Весь каталог <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="md" />
          </div>
        ) : (
          <ProductCarousel products={products} autoPlay={false} />
        )}
      </div>
    </section>
  );
}
