import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../api/products';
import ProductGrid from '../components/product/ProductGrid';
import Spinner from '../components/ui/Spinner';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchProducts({ limit: 8 }),
      fetchCategories(),
    ]).then(([prodData, catData]) => {
      setFeatured(prodData.products);
      setCategories(catData.categories);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" />;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Find Your Signature Scent
            </h1>
            <p className="text-lg text-purple-200 mb-8">
              Explore our curated collection of premium fragrances. Let our AI consultant
              help you discover the perfect perfume for any occasion.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/catalog"
                className="bg-white text-purple-700 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-colors"
              >
                Browse Catalog
              </Link>
              <button
                onClick={() => document.querySelector('[data-chat-toggle]')?.click()}
                className="border border-white/30 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Ask AI Consultant
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Shop by Scent Family</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.slug}`}
              className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md hover:border-purple-300 transition-all group"
            >
              <div className="text-3xl mb-3">
                {cat.slug === 'floral' ? '🌸' :
                 cat.slug === 'woody' ? '🌲' :
                 cat.slug === 'oriental' ? '✨' :
                 cat.slug === 'fresh' ? '🍋' :
                 cat.slug === 'gourmand' ? '🍫' :
                 cat.slug === 'aromatic' ? '🌿' : '💐'}
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Fragrances</h2>
          <Link
            to="/catalog"
            className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
    </div>
  );
}
