import { useState, useEffect, useCallback, useRef } from 'react';
import { adminGetOrders, adminUpdateOrderStatus } from '../../api/admin';
import { Search, ChevronLeft, ChevronRight, ShoppingBag, ChevronDown, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const handleExport = () => {
  const token = localStorage.getItem('token');
  const a = document.createElement('a');
  a.href = `/api/admin/orders/export`;
  a.setAttribute('download', '');
  // send token via header not possible with <a>, use fetch+blob
  fetch('/api/admin/orders/export', { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders_${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    })
    .catch(() => toast.error('Ошибка экспорта'));
};

const STATUSES = [
  { value: 'pending',   label: 'Принят',       color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'confirmed', label: 'Подтверждён',  color: 'bg-blue-100   text-blue-700   border-blue-200'   },
  { value: 'shipped',   label: 'В пути',       color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'delivered', label: 'Доставлен',    color: 'bg-green-100  text-green-700  border-green-200'  },
  { value: 'cancelled', label: 'Отменён',      color: 'bg-red-100    text-red-600    border-red-200'    },
];
const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.value, s]));
const PAYMENT_LABEL = { card: 'Карта', cash: 'Наличные', bank_transfer: 'Перевод' };

function StatusBadge({ status, orderId, onChanged }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const info = STATUS_MAP[status] || STATUS_MAP.pending;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const change = async (newStatus) => {
    if (newStatus === status) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    try {
      await adminUpdateOrderStatus(orderId, newStatus);
      toast.success(`Статус изменён: ${STATUS_MAP[newStatus]?.label}`);
      onChanged(newStatus);
    } catch {
      toast.error('Не удалось изменить статус');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-opacity ${info.color} ${loading ? 'opacity-50' : 'hover:opacity-80'}`}
      >
        {info.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl py-1 min-w-[160px]">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => change(s.value)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-50 ${s.value === status ? 'font-semibold text-purple-700' : 'text-gray-700'}`}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${s.color.split(' ')[0]}`} />
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [data, setData]       = useState({ orders: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [query, setQuery]     = useState('');
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]       = useState(1);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetOrders({ page, limit: 20, search: query, status: statusFilter });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [page, query, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); setQuery(search); };

  const updateStatus = (id, newStatus) => {
    setData((d) => ({
      ...d,
      orders: d.orders.map((o) => o.id === id ? { ...o, status: newStatus } : o),
    }));
  };

  const { orders, pagination } = data;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Заказы</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pagination.total ?? '...'} заказов всего</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:border-purple-400 hover:text-purple-600 transition-colors"
        >
          <Download className="w-4 h-4" /> Экспорт CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Имя, email, телефон..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-60 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </form>

        {/* Status filter */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => { setStatus(''); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              !statusFilter ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            Все
          </button>
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => { setStatus(s.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === s.value ? `${s.color}` : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div>
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Заказ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Клиент</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Сумма</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Оплата</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Статус</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Дата</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 animate-pulse" /> Загрузка...
                </td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">Заказы не найдены</td></tr>
              ) : orders.map((order) => (
                <>
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-gray-900 font-semibold">#{order.id?.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400">{order.items?.length} поз.</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900 font-medium">{order.contact?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{order.contact?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      ${order.total?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {PAYMENT_LABEL[order.payment_method] || '—'}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <StatusBadge
                        status={order.status}
                        orderId={order.id}
                        onChanged={(s) => updateStatus(order.id, s)}
                      />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('ru-RU', {
                        day: '2-digit', month: '2-digit', year: '2-digit',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {expanded === order.id ? '▲' : '▼'}
                    </td>
                  </tr>
                  {/* Expanded row */}
                  {expanded === order.id && (
                    <tr key={`${order.id}-detail`} className="bg-purple-50/40">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Items */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Состав заказа</p>
                            <div className="space-y-2">
                              {order.items?.map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-purple-100 overflow-hidden shrink-0 flex items-center justify-center">
                                    {item.image_url
                                      ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                      : <span className="text-sm">🧴</span>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.quantity} шт. × ${item.price?.toFixed(2)}</p>
                                  </div>
                                  <span className="text-xs font-semibold text-gray-900 shrink-0">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Delivery info */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Доставка</p>
                            <div className="space-y-1 text-sm text-gray-700">
                              {order.contact?.email && <p>📧 {order.contact.email}</p>}
                              {order.city && <p>📍 {order.city}{order.delivery_address ? `, ${order.delivery_address}` : ''}</p>}
                              {order.user?.email && (
                                <p className="text-xs text-gray-400 mt-2">
                                  Аккаунт: {order.user.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Страница {pagination.page} из {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pagination.page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:border-purple-300">
                <ChevronLeft className="w-3.5 h-3.5" /> Назад
              </button>
              <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={pagination.page >= pagination.totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:border-purple-300">
                Вперёд <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
