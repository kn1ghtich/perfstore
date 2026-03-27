import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchBrands, fetchCategories } from '../../api/products';
import { useTranslation } from '../../hooks/useTranslation';
import { X } from 'lucide-react';

export default function ProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    fetchBrands().then(d => setBrands(d.brands));
    fetchCategories().then(d => setCategories(d.categories));
  }, []);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = searchParams.toString().length > 0;

  const genderLabels = {
    female: t('filters.female'),
    male: t('filters.male'),
    unisex: t('filters.unisex'),
  };

  return (
    <div className="space-y-6">
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
        >
          <X className="w-4 h-4" /> {t('filters.clearFilters')}
        </button>
      )}

      {/* Gender */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">{t('filters.gender')}</h3>
        <div className="space-y-1">
          {['female', 'male', 'unisex'].map(g => (
            <label key={g} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                checked={searchParams.get('gender') === g}
                onChange={() => updateFilter('gender', searchParams.get('gender') === g ? '' : g)}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{genderLabels[g]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">{t('filters.scentFamily')}</h3>
        <div className="space-y-1">
          {categories.map(c => (
            <label key={c.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={searchParams.get('category') === c.slug}
                onChange={() => updateFilter('category', searchParams.get('category') === c.slug ? '' : c.slug)}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">{t('filters.brand')}</h3>
        <div className="space-y-1">
          {brands.map(b => (
            <label key={b.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="brand"
                checked={searchParams.get('brand') === b.slug}
                onChange={() => updateFilter('brand', searchParams.get('brand') === b.slug ? '' : b.slug)}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{b.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">{t('filters.priceRange')}</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={t('filters.min')}
            value={searchParams.get('minPrice') || ''}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
          />
          <input
            type="number"
            placeholder={t('filters.max')}
            value={searchParams.get('maxPrice') || ''}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">{t('filters.sortBy')}</h3>
        <select
          value={searchParams.get('sort') || ''}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        >
          <option value="">{t('filters.newest')}</option>
          <option value="price_asc">{t('filters.priceLowHigh')}</option>
          <option value="price_desc">{t('filters.priceHighLow')}</option>
          <option value="name">{t('filters.nameAZ')}</option>
        </select>
      </div>
    </div>
  );
}
