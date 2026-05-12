import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, Users, LogOut, LayoutDashboard, ShoppingCart, Store, Tag, Sparkles, Bell, Layers } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';
import axios from 'axios';

const adminApi = axios.create({ baseURL: '/api/admin' });
adminApi.interceptors.request.use((c) => { const t = localStorage.getItem('token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [newOrders, setNewOrders] = useState(0);

  // Poll for new pending orders every 60s
  useEffect(() => {
    const fetch = () => adminApi.get('/orders/new-count').then(({ data }) => setNewOrders(data.count)).catch(() => {});
    fetch();
    const timer = setInterval(fetch, 60_000);
    return () => clearInterval(timer);
  }, []);

  const NAV = [
    { to: '/admin/dashboard',   icon: LayoutDashboard, label: 'Дашборд' },
    { to: '/admin/products',    icon: Package,          label: 'Товары' },
    { to: '/admin/orders',      icon: ShoppingCart,     label: 'Заказы', badge: newOrders },
    { to: '/admin/stores',      icon: Store,            label: 'Магазины' },
    { to: '/admin/categories',  icon: Tag,              label: 'Категории' },
    { to: '/admin/brands',         icon: Sparkles,  label: 'Бренды' },
    { to: '/admin/slides',         icon: Layers,    label: 'Карусель' },
    { to: '/admin/notifications',  icon: Bell,      label: 'Уведомления' },
    { to: '/admin/users',          icon: Users,     label: 'Пользователи' },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-purple-400" />
            <span className="text-white font-bold text-lg">PerfStore</span>
          </Link>
          <p className="text-gray-500 text-xs mt-0.5">Панель администратора</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white min-w-[18px] text-center">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-gray-800">
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(user?.name || 'A')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Выйти
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
