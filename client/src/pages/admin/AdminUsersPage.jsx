import { useState, useEffect, useCallback } from 'react';
import { adminGetUsers, adminGetUser, adminUpdateUserRole } from '../../api/admin';
import { Search, Users, X, Phone, MapPin, CreditCard, ShoppingBag, User, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const PAYMENT_LABEL = { card: 'Банковская карта', cash: 'Наличными', bank_transfer: 'Банковский перевод' };
const STATUS_LABEL  = {
  pending:   { text: 'Принят',      color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { text: 'Подтверждён', color: 'bg-blue-100 text-blue-700' },
  shipped:   { text: 'В пути',      color: 'bg-purple-100 text-purple-700' },
  delivered: { text: 'Доставлен',   color: 'bg-green-100 text-green-700' },
  cancelled: { text: 'Отменён',     color: 'bg-red-100 text-red-700' },
};

function UserDrawer({ userId, onClose, onRoleChanged }) {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminGetUser(userId)
      .then((r) => setData(r.user))
      .finally(() => setLoading(false));
  }, [userId]);

  const toggleRole = async () => {
    if (!data) return;
    const newRole = data.role === 'admin' ? 'user' : 'admin';
    setToggling(true);
    try {
      const { user } = await adminUpdateUserRole(data.id, newRole);
      setData((d) => ({ ...d, role: user.role }));
      onRoleChanged?.();
      toast.success(newRole === 'admin' ? 'Пользователь стал администратором' : 'Права администратора сняты');
    } catch {
      toast.error('Не удалось изменить роль');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-md bg-white shadow-2xl overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900">Данные пользователя</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <User className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
        ) : !data ? (
          <p className="p-6 text-gray-500">Не удалось загрузить данные</p>
        ) : (
          <div className="flex-1 p-6 space-y-6">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 overflow-hidden flex items-center justify-center ring-2 ring-purple-200 shrink-0">
                {data.avatar
                  ? <img src={data.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <User className="w-8 h-8 text-purple-400" />}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {[data.first_name, data.last_name].filter(Boolean).join(' ') || data.name}
                </p>
                <p className="text-sm text-gray-500">{data.email}</p>
                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${
                  data.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {data.role === 'admin' ? '👑 Администратор' : 'Пользователь'}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-3">
              {data.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" /> {data.phone}
                </div>
              )}
              {data.city && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  {data.city}{data.delivery_address ? `, ${data.delivery_address}` : ''}
                </div>
              )}
              {data.payment_method && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
                  {PAYMENT_LABEL[data.payment_method] || data.payment_method}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{data.orders?.length ?? 0}</p>
                <p className="text-xs text-gray-500 mt-0.5">Заказов</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Зарегистрирован</p>
                <p className="text-sm font-semibold text-gray-700">
                  {new Date(data.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </div>

            {/* Orders */}
            {data.orders?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-purple-500" /> Последние заказы
                </h3>
                <div className="space-y-2">
                  {data.orders.map((o) => {
                    const st = STATUS_LABEL[o.status] || STATUS_LABEL.pending;
                    return (
                      <div key={o.id} className="flex items-center justify-between text-sm border border-gray-100 rounded-lg px-3 py-2.5">
                        <div>
                          <p className="font-mono text-xs text-gray-400">#{o.id?.slice(-8).toUpperCase()}</p>
                          <p className="text-xs text-gray-500">{o.items?.length ?? 0} поз.</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.text}</span>
                          <p className="text-xs font-bold text-gray-900 mt-1">${o.total?.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Role control */}
            <div className="border-t border-gray-100 pt-4">
              <button
                onClick={toggleRole}
                disabled={toggling}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${
                  data.role === 'admin'
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                {toggling
                  ? 'Применяется...'
                  : data.role === 'admin'
                  ? 'Снять права администратора'
                  : 'Назначить администратором'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [data, setData]         = useState({ users: [], pagination: {} });
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [query, setQuery]       = useState('');
  const [page, setPage]         = useState(1);
  const [selectedId, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetUsers({ page, limit: 20, search: query });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); setQuery(search); };

  const { users, pagination } = data;

  return (
    <div className="p-8">
      {selectedId && (
        <UserDrawer
          userId={selectedId}
          onClose={() => setSelected(null)}
          onRoleChanged={load}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pagination.total ?? '...'} зарегистрировано</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по имени или email..."
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Пользователь</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Телефон</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Город</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Заказы</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Роль</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Дата</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2 animate-pulse" /> Загрузка...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">Пользователи не найдены</td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-100 overflow-hidden flex items-center justify-center shrink-0">
                        {u.avatar
                          ? <img src={u.avatar} alt="av" className="w-full h-full object-cover" />
                          : <User className="w-4 h-4 text-purple-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">
                          {[u.first_name, u.last_name].filter(Boolean).join(' ') || u.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.phone || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.city || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <span className="font-semibold text-gray-900">{u.order_count}</span>
                      {u.order_count > 0 && (
                        <span className="text-gray-400 text-xs ml-1">(${u.orders_total?.toFixed(2)})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role === 'admin' ? '👑 Админ' : 'Пользователь'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(u.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelected(u.id)}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium border border-purple-200 hover:border-purple-400 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Подробнее
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
            <p className="text-xs text-gray-500">Страница {pagination.page} из {pagination.totalPages}</p>
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
