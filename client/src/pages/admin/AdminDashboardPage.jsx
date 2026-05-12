import { useState, useEffect } from 'react';
import { adminGetStats } from '../../api/admin';
import { TrendingUp, ShoppingBag, Users, CreditCard, Package, Clock, Truck, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

const STATUS_INFO = {
  pending:   { label: 'Принятые',     icon: Clock,       color: 'text-yellow-600 bg-yellow-50' },
  confirmed: { label: 'Подтверждённые', icon: Package,   color: 'text-blue-600   bg-blue-50'   },
  shipped:   { label: 'В пути',       icon: Truck,       color: 'text-purple-600 bg-purple-50' },
  delivered: { label: 'Доставленные', icon: CheckCircle, color: 'text-green-600  bg-green-50'  },
  cancelled: { label: 'Отменённые',   icon: XCircle,     color: 'text-red-600    bg-red-50'    },
};

function StatCard({ icon: Icon, label, value, sub, color = 'text-purple-600 bg-purple-50' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function MiniBarChart({ data }) {
  if (!data?.length) return <p className="text-sm text-gray-400 py-4 text-center">Нет данных</p>;

  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="flex items-end gap-1 h-32">
      {data.slice(-30).map((d, i) => {
        const h = Math.max(4, (d.revenue / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="w-full bg-purple-500 hover:bg-purple-600 rounded-t transition-colors cursor-default"
              style={{ height: `${h}%` }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {d._id}<br />${d.revenue.toFixed(0)} · {d.count} зак.
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return <div className="p-8 text-gray-500">Ошибка загрузки</div>;

  const fmt = (n) => `$${Number(n).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-sm text-gray-500 mt-0.5">Сводная статистика магазина</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={CreditCard}
          label="Общая выручка"
          value={fmt(stats.totalRevenue)}
          color="text-purple-600 bg-purple-50"
        />
        <StatCard
          icon={ShoppingBag}
          label="Всего заказов"
          value={stats.totalOrders}
          sub={`За месяц: ${stats.monthOrders} · Сегодня: ${stats.todayOrders}`}
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          icon={TrendingUp}
          label="Средний чек"
          value={fmt(stats.avgCheck)}
          color="text-green-600 bg-green-50"
        />
        <StatCard
          icon={Users}
          label="Новых за неделю"
          value={stats.newUsersThisWeek}
          sub="пользователей"
          color="text-orange-600 bg-orange-50"
        />
      </div>

      {/* Revenue chart + status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" /> Выручка за 30 дней
            </h2>
            <span className="text-xs text-gray-400">hover — детали</span>
          </div>
          <MiniBarChart data={stats.revenueByDay} />
          {/* X-axis labels */}
          {stats.revenueByDay?.length > 0 && (
            <div className="flex justify-between mt-1 text-[10px] text-gray-400">
              <span>{stats.revenueByDay[0]?._id?.slice(5)}</span>
              <span>{stats.revenueByDay[stats.revenueByDay.length - 1]?._id?.slice(5)}</span>
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Статусы заказов</h2>
          <div className="space-y-3">
            {Object.entries(STATUS_INFO).map(([key, { label, icon: Icon, color }]) => {
              const count = stats.byStatus?.[key] || 0;
              const total = stats.totalOrders || 1;
              const pct   = Math.round((count / total) * 100);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm text-gray-700">{label}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${color.split(' ')[0].replace('text', 'bg')}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top products */}
      {stats.topProducts?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Топ товаров по выручке</h2>
          <div className="space-y-3">
            {stats.topProducts.map((p, i) => {
              const maxRev = stats.topProducts[0].revenue;
              const pct    = Math.round((p.revenue / maxRev) * 100);
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-300 w-5 text-right shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p._id}</p>
                        <p className="text-xs text-gray-400">{p.brand} · {p.qty} шт.</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900 ml-4 shrink-0">{fmt(p.revenue)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
