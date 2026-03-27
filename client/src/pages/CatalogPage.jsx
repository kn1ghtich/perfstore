import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api/products';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters from '../components/product/ProductFilters';
import Spinner from '../components/ui/Spinner';
import { Filter } from 'lucide-react';

export default function CatalogPage() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({ products: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(searchParams);
    fetchProducts(params)
      .then(setData)
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Perfume Catalog</h1>
          <p className="text-gray-500 text-sm mt-1">
            {data.pagination.total || 0} fragrances
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-2 text-sm text-gray-600 border border-gray-300 px-3 py-2 rounded-lg"
        >
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0`}>
          <div className="sticky top-20 bg-white rounded-xl border border-gray-200 p-5">
            <ProductFilters />
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          {loading ? (
            <Spinner size="lg" />
          ) : (
            <>
              <ProductGrid products={data.products} />
              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <a
                      key={page}
                      href={`?${new URLSearchParams({ ...Object.fromEntries(searchParams), page }).toString()}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm ${
                        page === data.pagination.page
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:border-purple-300'
                      }`}
                    >
                      {page}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
