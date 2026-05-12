import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import api from '../api/axiosInstance';
import ProductGrid from '../components/product/ProductGrid';

export default function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/auth/wishlist')
      .then(({ data }) => setProducts(data.wishlist || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8" style={{ borderBottom: '1px solid var(--dark-border)', paddingBottom: '1.5rem' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8" style={{ background: 'var(--gold)' }} />
            <span className="text-[10px] tracking-[0.35em] uppercase" style={{ color: 'var(--gold)' }}>Коллекция</span>
          </div>
          <div className="flex items-end justify-between">
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-white flex items-center gap-3">
              Избранное <Heart className="w-7 h-7" style={{ color: '#ef4444' }} fill="#ef4444" />
            </h1>
            <p className="text-xs text-gray-600 tracking-wide">{products.length} товаров</p>
          </div>
        </div>

        {!loading && products.length === 0 ? (
          <div className="py-24 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--gold)' }} />
            <p className="text-gray-500 mb-2">Список избранного пуст</p>
            <p className="text-xs text-gray-700 mb-6">Добавляйте понравившиеся ароматы</p>
            <Link to="/catalog"
              className="text-xs tracking-[0.15em] uppercase px-6 py-3 font-medium transition-colors"
              style={{ background: 'var(--gold)', color: '#000' }}>
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <ProductGrid
            products={products.map((p) => ({
              ...p,
              id: p.id || p._id,
              brand_name: p.brand?.name || p.brand_name,
            }))}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
