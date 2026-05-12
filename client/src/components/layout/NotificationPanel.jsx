import { useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Bell, Tag, RotateCcw, PackageCheck, Info } from 'lucide-react';
import { NotificationContext } from '../../context/NotificationContext';

const TYPE_META = {
  restock:     { icon: PackageCheck, color: '#22c55e', label: 'Поступление' },
  promotion:   { icon: Tag,          color: 'var(--gold)', label: 'Акция' },
  new_product: { icon: RotateCcw,    color: '#7eb8e8', label: 'Новинка' },
  info:        { icon: Info,         color: '#a0a0a0', label: 'Информация' },
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин. назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`;
  return `${Math.floor(diff / 86400)} дн. назад`;
}

export default function NotificationPanel() {
  const { notifications, loading, panelOpen, closePanel, unreadCount } = useContext(NotificationContext);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!panelOpen) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) closePanel(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [panelOpen, closePanel]);

  if (!panelOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={closePanel} />

      {/* Panel */}
      <div ref={ref}
        className="fixed top-0 right-0 z-50 h-full w-full max-w-sm flex flex-col shadow-2xl"
        style={{ background: '#0f0f0f', borderLeft: '1px solid var(--dark-border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--dark-border)' }}>
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4" style={{ color: 'var(--gold)' }} />
            <span className="text-sm font-semibold text-white tracking-wide">Уведомления</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--gold)', color: '#000' }}>
                {unreadCount} новых
              </span>
            )}
          </div>
          <button onClick={closePanel}
            className="text-gray-600 hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-600 text-sm">Загрузка...</div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <Bell className="w-10 h-10 mb-3 opacity-20" style={{ color: 'var(--gold)' }} />
              <p className="text-sm text-gray-600">Уведомлений пока нет</p>
            </div>
          ) : notifications.map((n) => {
            const meta = TYPE_META[n.type] || TYPE_META.info;
            const Icon = meta.icon;
            const inner = (
              <div className="flex gap-3 px-5 py-4 transition-colors hover:bg-white/5 cursor-pointer"
                style={{ borderBottom: '1px solid var(--dark-border)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}44` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] tracking-[0.15em] uppercase font-medium mb-0.5" style={{ color: meta.color }}>
                    {meta.label}
                  </p>
                  <p className="text-sm text-white font-medium leading-snug">{n.title}</p>
                  {n.message && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>}
                  <p className="text-[10px] text-gray-700 mt-1">{timeAgo(n.created_at)}</p>
                </div>
              </div>
            );
            return n.link ? (
              <Link key={n.id} to={n.link} onClick={closePanel}>{inner}</Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      </div>
    </>
  );
}
