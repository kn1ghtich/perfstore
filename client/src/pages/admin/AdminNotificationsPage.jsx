import { useState, useEffect, useCallback } from 'react';
import { adminGetNotifications, adminCreateNotification, adminDeleteNotification } from '../../api/admin';
import { Bell, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_OPTIONS = [
  { value: 'info',        label: 'Информация' },
  { value: 'promotion',   label: 'Акция' },
  { value: 'restock',     label: 'Поступление' },
  { value: 'new_product', label: 'Новинка' },
];

const TYPE_COLORS = {
  info:        'bg-gray-100 text-gray-700',
  promotion:   'bg-yellow-100 text-yellow-700',
  restock:     'bg-green-100 text-green-700',
  new_product: 'bg-blue-100 text-blue-700',
};

const TYPE_LABELS = Object.fromEntries(TYPE_OPTIONS.map(t => [t.value, t.label]));

const EMPTY_FORM = { type: 'info', title: '', message: '', link: '' };

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин. назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`;
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AdminNotificationsPage() {
  const [data, setData]         = useState({ notifications: [], pagination: {} });
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetNotifications({ page, limit: 20 });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Введите заголовок'); return; }
    setCreating(true);
    try {
      await adminCreateNotification(form);
      toast.success('Уведомление создано');
      setForm(EMPTY_FORM);
      setShowForm(false);
      setPage(1);
      load();
    } catch {
      toast.error('Не удалось создать уведомление');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить уведомление?')) return;
    try {
      await adminDeleteNotification(id);
      toast.success('Удалено');
      load();
    } catch {
      toast.error('Ошибка удаления');
    }
  };

  const { notifications, pagination } = data;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Уведомления</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination.total ?? '...'} уведомлений
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Новое уведомление
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Создать уведомление</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
                <select
                  value={form.type}
                  onChange={set('type')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {TYPE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка (необязательно)</label>
                <input
                  type="text"
                  value={form.link}
                  onChange={set('link')}
                  placeholder="/product/some-slug"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={set('title')}
                  required
                  placeholder="Новая акция на парфюмерию..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Сообщение (необязательно)</label>
                <textarea
                  value={form.message}
                  onChange={set('message')}
                  rows={3}
                  placeholder="Подробное описание уведомления..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-60"
              >
                <Bell className="w-4 h-4" />
                {creating ? 'Создание...' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                className="px-5 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Тип</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Заголовок</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Сообщение</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ссылка</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Дата</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                    Загрузка...
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">Уведомлений нет</td>
                </tr>
              ) : notifications.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[n.type] || 'bg-gray-100 text-gray-600'}`}>
                      {TYPE_LABELS[n.type] || n.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[200px] truncate">{n.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{n.message || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono truncate max-w-[120px]">{n.link || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{timeAgo(n.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:border-purple-300 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Назад
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
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
