import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminGetProducts, adminDeleteProduct } from '../../api/admin';
import { Search, Edit2, Star, Package, ChevronLeft, ChevronRight, Plus, Trash2, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const GENDER_LABELS = { female: 'Женский', male: 'Мужской', unisex: 'Унисекс' };
const GENDER_COLORS = {
  female: 'bg-pink-100 text-pink-700',
  male:   'bg-blue-100 text-blue-700',
  unisex: 'bg-green-100 text-green-700',
};

function DeleteModal({ product, onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Удалить товар?</h3>
            <p className="text-sm text-gray-500">Это действие нельзя отменить</p>
          </div>
        </div>

        {/* Product preview */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-purple-50 overflow-hidden shrink-0 flex items-center justify-center">
            {product.image_url
              ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              : <span className="text-lg">🧴</span>}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
            <p className="text-xs text-gray-400">{product.brand_name} · ${parseFloat(product.price).toFixed(2)}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {deleting
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Удаление...</>
              : <><Trash2 className="w-4 h-4" /> Удалить</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [data, setData]         = useState({ products: [], pagination: {} });
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [query, setQuery]       = useState('');
  const [toDelete, setToDelete] = useState(null);   // product to confirm deletion
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetProducts({ page, limit: 20, search: query });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  };

  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminDeleteProduct(toDelete.id);
      toast.success('Товар удалён');
      setToDelete(null);
      load();
    } catch {
      toast.error('Не удалось удалить товар');
    } finally {
      setDeleting(false);
    }
  };

  const { products, pagination } = data;

  return (
    <div className="p-8">
      {/* Confirmation modal */}
      {toDelete && (
        <DeleteModal
          product={toDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => !deleting && setToDelete(null)}
          deleting={deleting}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Товары</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination.total ?? '...'} позиций в каталоге
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Создать товар
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Товар</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Бренд</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Пол</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Цена</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Рейтинг</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Количество</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Наличие</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    <Package className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                    Загрузка...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">Товары не найдены</td>
                </tr>
              ) : products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 overflow-hidden shrink-0 flex items-center justify-center">
                        {p.image_url
                          ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          : <span className="text-lg">🧴</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[220px]">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.concentration} · {p.volume_ml} мл</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.brand_name || p.brand?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${GENDER_COLORS[p.gender] || 'bg-gray-100 text-gray-600'}`}>
                      {GENDER_LABELS[p.gender] || p.gender}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">${parseFloat(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {p.avg_rating > 0 ? (
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{p.avg_rating}</span>
                        <span className="text-gray-400 text-xs">({p.review_count})</span>
                      </div>
                    ) : <span className="text-xs text-gray-400">Нет отзывов</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${
                      (p.quantity ?? 0) === 0
                        ? 'text-red-600'
                        : (p.quantity ?? 0) <= 2
                        ? 'text-orange-500'
                        : 'text-green-600'
                    }`}>
                      {p.quantity ?? 0} шт.
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {p.in_stock ? 'В наличии' : 'Нет в наличии'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setToDelete(p)}
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium border border-red-200 hover:border-red-400 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Удалить
                      </button>
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium border border-purple-200 hover:border-purple-400 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Редактировать
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Страница {pagination.page} из {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:border-purple-300 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Назад
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:border-purple-300 transition-colors"
              >
                Вперёд <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
