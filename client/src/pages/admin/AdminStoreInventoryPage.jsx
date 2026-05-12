import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  adminGetStore, adminGetProducts,
  adminAddStoreProduct, adminUpdateStoreQty, adminRemoveStoreProduct,
} from '../../api/admin';
import { ArrowLeft, Search, Plus, Trash2, Package, ChevronUp, ChevronDown, Store } from 'lucide-react';
import toast from 'react-hot-toast';

const GENDER_LABEL = { male: 'Мужской', female: 'Женский', unisex: 'Унисекс' };

export default function AdminStoreInventoryPage() {
  const { id } = useParams();
  const [store, setStore]         = useState(null);
  const [loading, setLoading]     = useState(true);

  // Product search state
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState([]);
  const [searching, setSearching] = useState(false);
  const [addQty, setAddQty]       = useState(1);
  const [selected, setSelected]   = useState(null); // product to add
  const [adding, setAdding]       = useState(false);
  const searchRef = useRef(null);
  const searchTimer = useRef(null);

  const loadStore = useCallback(() => {
    setLoading(true);
    adminGetStore(id)
      .then((d) => setStore(d.store))
      .catch(() => toast.error('Не удалось загрузить магазин'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { loadStore(); }, [loadStore]);

  // Close search results on outside click
  useEffect(() => {
    const h = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setResults([]); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Debounced product search
  const handleSearch = (val) => {
    setQuery(val);
    setSelected(null);
    clearTimeout(searchTimer.current);
    if (!val.trim()) { setResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await adminGetProducts({ search: val, limit: 8 });
        // Filter out already-added products
        const addedIds = new Set((store?.inventory || []).map((i) => i.product?.id || i.product?._id));
        setResults((data.products || []).filter((p) => !addedIds.has(p.id)));
      } catch { /* silent */ }
      finally { setSearching(false); }
    }, 300);
  };

  const selectProduct = (product) => {
    setSelected(product);
    setQuery(product.name);
    setResults([]);
  };

  const handleAdd = async () => {
    if (!selected) { toast.error('Выберите товар из списка'); return; }
    setAdding(true);
    try {
      const data = await adminAddStoreProduct(id, { productId: selected.id, quantity: Number(addQty) });
      setStore(data.store);
      setQuery(''); setSelected(null); setAddQty(1); setResults([]);
      toast.success('Товар добавлен в магазин');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Не удалось добавить товар');
    } finally { setAdding(false); }
  };

  const handleQtyChange = async (productId, newQty) => {
    try {
      await adminUpdateStoreQty(id, productId, newQty);
      setStore((s) => ({
        ...s,
        inventory: s.inventory.map((i) =>
          (i.product?.id || i.product?._id) === productId ? { ...i, quantity: newQty } : i
        ),
      }));
    } catch { toast.error('Не удалось обновить количество'); }
  };

  const handleRemove = async (productId, productName) => {
    if (!window.confirm(`Убрать «${productName}» из магазина?`)) return;
    try {
      await adminRemoveStoreProduct(id, productId);
      setStore((s) => ({ ...s, inventory: s.inventory.filter((i) => (i.product?.id || i.product?._id) !== productId) }));
      toast.success('Товар убран из магазина');
    } catch { toast.error('Не удалось убрать товар'); }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64 text-gray-400">
        <Store className="w-8 h-8 animate-pulse" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-8 text-center text-gray-500">
        Магазин не найден.{' '}
        <Link to="/admin/stores" className="text-purple-600 hover:underline">Назад</Link>
      </div>
    );
  }

  const inventory = store.inventory || [];

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/stores" className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700">
          <ArrowLeft className="w-4 h-4" /> Назад к магазинам
        </Link>
        <div className="flex items-center gap-3">
          {store.image_url && (
            <img src={store.image_url} alt={store.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
            <p className="text-sm text-gray-500">{inventory.length} товаров в магазине</p>
          </div>
        </div>
      </div>

      {/* Add product */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-purple-500" /> Добавить товар
        </h2>
        <div className="flex gap-3 items-end">
          {/* Search */}
          <div className="flex-1 relative" ref={searchRef}>
            <label className="block text-sm text-gray-600 mb-1">Поиск по названию</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Chanel, Tom Ford..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {/* Dropdown results */}
            {results.length > 0 && (
              <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl py-1 max-h-64 overflow-y-auto">
                {results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectProduct(p)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        : <Package className="w-4 h-4 text-gray-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.brand?.name} · ${p.price?.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="w-28">
            <label className="block text-sm text-gray-600 mb-1">Количество</label>
            <input
              type="number"
              min={0}
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Add button */}
          <button
            onClick={handleAdd}
            disabled={adding || !selected}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {adding ? 'Добавление...' : 'Добавить'}
          </button>
        </div>
        {selected && (
          <p className="text-xs text-green-600 mt-2">✓ Выбран: <span className="font-medium">{selected.name}</span></p>
        )}
      </div>

      {/* Inventory table */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Товары магазина</h2>
          <span className="text-sm text-gray-400">{inventory.length} позиций</span>
        </div>

        {inventory.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Нет товаров</p>
            <p className="text-sm mt-1">Добавьте товары с помощью поиска выше</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Товар</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Бренд</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Пол</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Цена</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Количество</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventory.map((item) => {
                const p = item.product;
                if (!p) return null;
                const pid = p.id || p._id;
                return (
                  <InventoryRow
                    key={pid}
                    product={p}
                    quantity={item.quantity}
                    onQtyChange={(q) => handleQtyChange(pid, q)}
                    onRemove={() => handleRemove(pid, p.name)}
                  />
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function InventoryRow({ product, quantity, onQtyChange, onRemove }) {
  const [qty, setQty] = useState(quantity);
  const [saving, setSaving] = useState(false);
  const timer = useRef(null);

  const handleChange = (val) => {
    const n = Math.max(0, Number(val));
    setQty(n);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      await onQtyChange(n);
      setSaving(false);
    }, 600);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
            {product.image_url
              ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              : <Package className="w-4 h-4 text-gray-300" />}
          </div>
          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{product.name}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{product.brand?.name || '—'}</td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          product.gender === 'female' ? 'bg-pink-100 text-pink-700' :
          product.gender === 'male'   ? 'bg-blue-100 text-blue-700' :
                                        'bg-green-100 text-green-700'
        }`}>
          {GENDER_LABEL[product.gender] || '—'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
        ${product.price?.toFixed(2)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {/* Minus */}
          <button
            onClick={() => handleChange(qty - 1)}
            disabled={qty <= 0}
            className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 hover:border-purple-400 text-gray-500 hover:text-purple-600 transition-colors disabled:opacity-30"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
          {/* Input */}
          <input
            type="number"
            min={0}
            value={qty}
            onChange={(e) => handleChange(e.target.value)}
            className={`w-14 text-center text-sm font-semibold border rounded px-1 py-0.5 outline-none transition-colors ${
              saving ? 'border-purple-300 bg-purple-50' : 'border-gray-200 focus:border-purple-400'
            }`}
          />
          {/* Plus */}
          <button
            onClick={() => handleChange(qty + 1)}
            className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 hover:border-purple-400 text-gray-500 hover:text-purple-600 transition-colors"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          {saving && <span className="text-[10px] text-purple-500 ml-1">сохр.</span>}
        </div>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={onRemove}
          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}
