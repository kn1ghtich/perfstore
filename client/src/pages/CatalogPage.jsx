import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchBrands, fetchCategories, fetchStoresForFilter } from '../api/products';
import ProductGrid from '../components/product/ProductGrid';
import FilterDropdown from '../components/product/FilterDropdown';
import { X, Check } from 'lucide-react';

const GENDER_LABELS = { female: 'Женские', male: 'Мужские', unisex: 'Унисекс' };
const SORT_LABELS   = { '': 'Новинки', price_asc: 'Цена ↑', price_desc: 'Цена ↓', name: 'А → Я' };

// Single-select dark dropdown item
const DItem = ({ active, onClick, children }) => (
  <button onClick={onClick}
    className="w-full text-left px-4 py-2.5 text-xs tracking-wide transition-colors"
    style={{ color: active ? 'var(--gold)' : '#a0a0a0', fontWeight: active ? 600 : 400 }}
    onMouseEnter={(e) => { e.currentTarget.style.background = '#1e1e1e'; if (!active) e.currentTarget.style.color = '#fff'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? 'var(--gold)' : '#a0a0a0'; }}
  >
    {children}
  </button>
);

// Multi-select dark dropdown item with checkbox
const DItemCheck = ({ active, onClick, children }) => (
  <button onClick={onClick}
    className="w-full text-left px-4 py-2.5 text-xs tracking-wide transition-colors flex items-center gap-2.5"
    style={{ color: active ? 'var(--gold)' : '#a0a0a0' }}
    onMouseEnter={(e) => { e.currentTarget.style.background = '#1e1e1e'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
  >
    {/* checkbox */}
    <span
      className="w-3.5 h-3.5 shrink-0 flex items-center justify-center transition-all"
      style={{
        border: `1px solid ${active ? 'var(--gold)' : '#555'}`,
        background: active ? 'var(--gold)' : 'transparent',
      }}
    >
      {active && <Check className="w-2.5 h-2.5" style={{ color: '#000', strokeWidth: 3 }} />}
    </span>
    <span style={{ fontWeight: active ? 600 : 400 }}>{children}</span>
  </button>
);

// Helpers for comma-separated URL params
const getMulti = (params, key) => {
  const v = params.get(key) || '';
  return v ? v.split(',').filter(Boolean) : [];
};
const setMulti = (params, key, arr) => {
  if (arr.length === 0) params.delete(key);
  else params.set(key, arr.join(','));
};
const toggleMulti = (arr, val) =>
  arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData]     = useState({ products: [], pagination: {} });
  const [brands, setBrands]   = useState([]);
  const [cats, setCats]       = useState([]);
  const [stores, setStores]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands().then((d) => setBrands(d.brands));
    fetchCategories().then((d) => setCats(d.categories));
    fetchStoresForFilter().then((d) => setStores(d.stores || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProducts(Object.fromEntries(searchParams))
      .then(setData)
      .finally(() => setLoading(false));
  }, [searchParams]);

  // Single-select setter (gender, sort, store, price)
  const set = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  // Multi-select toggler
  const toggleFilter = (key, value) => {
    const p = new URLSearchParams(searchParams);
    const current = getMulti(p, key);
    setMulti(p, key, toggleMulti(current, value));
    p.delete('page');
    setSearchParams(p);
  };

  // Read current values
  const g        = searchParams.get('gender')   || '';
  const s        = searchParams.get('sort')     || '';
  const st       = searchParams.get('store')    || '';
  const mn       = searchParams.get('minPrice') || '';
  const mx       = searchParams.get('maxPrice') || '';
  const selCats  = getMulti(searchParams, 'categories');
  const selBrands= getMulti(searchParams, 'brands');

  const hasFilters = !![g, s, st, mn, mx].find(Boolean) || selCats.length > 0 || selBrands.length > 0;
  const activeStoreName = stores.find((x) => x.id === st)?.name || '';
  const priceLabel      = mn || mx ? `${mn || '0'} – ${mx || '∞'}` : '';

  // Labels for multi-select buttons
  const catLabel = selCats.length === 0
    ? 'Семейство'
    : selCats.length === 1
      ? (cats.find((c) => c.slug === selCats[0])?.name || selCats[0])
      : `Семейств: ${selCats.length}`;

  const brandLabel = selBrands.length === 0
    ? 'Бренд'
    : selBrands.length === 1
      ? (brands.find((b) => b.slug === selBrands[0])?.name || selBrands[0])
      : `Брендов: ${selBrands.length}`;

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8" style={{ borderBottom: '1px solid var(--dark-border)', paddingBottom: '1.5rem' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8" style={{ background: 'var(--gold)' }} />
            <span className="text-[10px] tracking-[0.35em] uppercase" style={{ color: 'var(--gold)' }}>Каталог</span>
          </div>
          <div className="flex items-end justify-between">
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-white">Парфюмерия</h1>
            <p className="text-xs text-gray-600 tracking-wide">{data.pagination.total || 0} позиций</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mb-8">
          {/* Filter pills — centered and evenly spaced */}
          <div className="flex flex-wrap items-center justify-center gap-2">

            {/* Gender — single select */}
            <FilterDropdown label={g ? GENDER_LABELS[g] : 'Пол'} active={!!g} onClear={() => set('gender', '')}>
              {Object.entries(GENDER_LABELS).map(([val, lbl]) => (
                <DItem key={val} active={g === val} onClick={() => set('gender', val === g ? '' : val)}>{lbl}</DItem>
              ))}
            </FilterDropdown>

            {/* Categories — multi-select */}
            <FilterDropdown
              label={catLabel}
              active={selCats.length > 0}
              onClear={() => { const p = new URLSearchParams(searchParams); p.delete('categories'); p.delete('page'); setSearchParams(p); }}
            >
              {cats.map((cat) => (
                <DItemCheck
                  key={cat.id}
                  active={selCats.includes(cat.slug)}
                  onClick={() => toggleFilter('categories', cat.slug)}
                >
                  {cat.name}
                </DItemCheck>
              ))}
            </FilterDropdown>

            {/* Brands — multi-select */}
            <FilterDropdown
              label={brandLabel}
              active={selBrands.length > 0}
              onClear={() => { const p = new URLSearchParams(searchParams); p.delete('brands'); p.delete('page'); setSearchParams(p); }}
            >
              <div className="max-h-56 overflow-y-auto">
                {brands.map((br) => (
                  <DItemCheck
                    key={br.id}
                    active={selBrands.includes(br.slug)}
                    onClick={() => toggleFilter('brands', br.slug)}
                  >
                    {br.name}
                  </DItemCheck>
                ))}
              </div>
            </FilterDropdown>

            {/* Price */}
            <FilterDropdown label={priceLabel || 'Цена'} active={!!(mn || mx)}
              onClear={() => { set('minPrice', ''); set('maxPrice', ''); }}>
              <div className="flex gap-2 p-3">
                {['minPrice', 'maxPrice'].map((key, i) => (
                  <input key={key} type="number" placeholder={i === 0 ? 'От' : 'До'}
                    value={key === 'minPrice' ? mn : mx}
                    onChange={(e) => set(key, e.target.value)}
                    className="w-20 px-2 py-1.5 text-xs text-white outline-none"
                    style={{ background: '#0a0a0a', border: '1px solid var(--dark-border)', caretColor: 'var(--gold)' }}
                  />
                ))}
              </div>
            </FilterDropdown>

            {/* Sort — single select */}
            <FilterDropdown label={SORT_LABELS[s] || 'Сортировка'} active={!!s} onClear={() => set('sort', '')}>
              {Object.entries(SORT_LABELS).map(([val, lbl]) => (
                <DItem key={val} active={s === val} onClick={() => set('sort', val)}>{lbl}</DItem>
              ))}
            </FilterDropdown>

            {/* Store — single select */}
            {stores.length > 0 && (
              <FilterDropdown label={activeStoreName || 'Филиал'} active={!!st} onClear={() => set('store', '')}>
                {stores.map((store) => (
                  <DItem key={store.id} active={st === store.id} onClick={() => set('store', st === store.id ? '' : store.id)}>
                    {store.name}
                  </DItem>
                ))}
              </FilterDropdown>
            )}

            {/* Reset all */}
            {hasFilters && (
              <button onClick={() => setSearchParams({})}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-300 transition-colors px-3 py-2">
                <X className="w-3.5 h-3.5" /> Сбросить
              </button>
            )}
          </div>

          {/* Active chips row — also centered */}
          {(selCats.length > 0 || selBrands.length > 0) && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              {selCats.map((slug) => {
                const cat = cats.find((c) => c.slug === slug);
                return (
                  <button key={slug} onClick={() => toggleFilter('categories', slug)}
                    className="flex items-center gap-1 text-[10px] px-2.5 py-1 transition-colors"
                    style={{ background: 'rgba(201,168,76,0.12)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.25)' }}>
                    {cat?.name || slug} <X className="w-2.5 h-2.5" />
                  </button>
                );
              })}
              {selBrands.map((slug) => {
                const br = brands.find((b) => b.slug === slug);
                return (
                  <button key={slug} onClick={() => toggleFilter('brands', slug)}
                    className="flex items-center gap-1 text-[10px] px-2.5 py-1 transition-colors"
                    style={{ background: 'rgba(201,168,76,0.12)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.25)' }}>
                    {br?.name || slug} <X className="w-2.5 h-2.5" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Products */}
        <ProductGrid products={data.products} loading={loading} />
        {data.pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page}
                onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', page); setSearchParams(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-9 h-9 flex items-center justify-center text-xs font-medium transition-all"
                style={{
                  background: page === data.pagination.page ? 'var(--gold)' : 'transparent',
                  color:      page === data.pagination.page ? '#000' : '#666',
                  border:     `1px solid ${page === data.pagination.page ? 'var(--gold)' : 'var(--dark-border)'}`,
                }}>
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
