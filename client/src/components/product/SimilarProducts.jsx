import { useEffect, useState } from 'react';
import { fetchSimilarProducts } from '../../api/products';
import ProductCard from './ProductCard';

export default function SimilarProducts({ productId }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!productId) return;
    setProducts([]);
    fetchSimilarProducts(productId)
      .then(({ products }) => setProducts(products || []))
      .catch(() => setProducts([]));
  }, [productId]);

  if (products.length === 0) return null;

  return (
    <section className="mt-16" style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '3rem' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-px w-8" style={{ background: 'var(--gold)' }} />
        <span className="text-[10px] tracking-[0.35em] uppercase" style={{ color: 'var(--gold)' }}>
          Похожие ароматы
        </span>
      </div>
      <h2 className="font-serif text-2xl font-semibold text-white mb-8">
        Вам также может понравиться
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
