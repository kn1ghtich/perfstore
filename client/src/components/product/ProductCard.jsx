import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import Badge from '../ui/Badge';

export default function ProductCard({ product }) {
  const genderColors = { female: 'pink', male: 'blue', unisex: 'green' };
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = product.image_url && !imgFailed;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center overflow-hidden">
        {showImage ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-2">🧴</div>
            <p className="text-xs text-gray-400">{product.brand_name}</p>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-purple-600 font-medium mb-1">{product.brand_name}</p>
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2 mb-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</span>
          <div className="flex items-center gap-1">
            {product.avg_rating > 0 && (
              <>
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600">{product.avg_rating}</span>
              </>
            )}
          </div>
        </div>
        <div className="mt-2">
          <Badge variant={genderColors[product.gender] || 'gray'}>
            {product.gender}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
