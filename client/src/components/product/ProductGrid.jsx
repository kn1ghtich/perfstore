import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '../ui/Skeleton';

export default function ProductGrid({ products, loading = false, skeletonCount = 10 }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="py-24 text-center">
        <p className="text-gray-600 mb-2">Ничего не найдено</p>
        <p className="text-xs text-gray-700 tracking-wide">Попробуйте изменить фильтры</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
