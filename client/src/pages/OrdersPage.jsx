import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft, ShoppingBag, MapPin, CreditCard } from 'lucide-react';
import { getOrdersApi } from '../api/orders';

const STATUS = {
  pending:   { text: 'Принят',       bg: 'rgba(201,168,76,0.15)',  color: '#C9A84C',  border: 'rgba(201,168,76,0.35)' },
  confirmed: { text: 'Подтверждён',  bg: 'rgba(96,165,250,0.12)',  color: '#93c5fd',  border: 'rgba(96,165,250,0.3)'  },
  shipped:   { text: 'В пути',       bg: 'rgba(167,139,250,0.12)', color: '#c4b5fd',  border: 'rgba(167,139,250,0.3)' },
  delivered: { text: 'Доставлен',    bg: 'rgba(34,197,94,0.12)',   color: '#86efac',  border: 'rgba(34,197,94,0.3)'   },
  cancelled: { text: 'Отменён',      bg: 'rgba(239,68,68,0.12)',   color: '#f87171',  border: 'rgba(239,68,68,0.3)'   },
};

const PAYMENT_LABEL = {
  card:          'Банковская карта',
  cash:          'Наличными',
  bank_transfer: 'Банковский перевод',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrdersApi()
      .then((data) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ background: 'var(--dark)', minHeight: '100vh' }}>
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse"
              style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Back */}
        <Link to="/profile"
          className="inline-flex items-center gap-1.5 text-xs tracking-wide transition-colors mb-8"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
          <ArrowLeft className="w-3.5 h-3.5" /> Назад
        </Link>

        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-8" style={{ background: 'var(--gold)' }} />
          <span className="text-[10px] tracking-[0.35em] uppercase" style={{ color: 'var(--gold)' }}>История</span>
        </div>
        <h1 className="font-serif text-3xl font-semibold text-white mb-8">Мои заказы</h1>

        {/* Empty */}
        {orders.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: '#141414', border: '1px solid var(--dark-border)' }}>
              <Package className="w-9 h-9" style={{ color: '#333' }} />
            </div>
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>У вас пока нет заказов</p>
            <Link to="/catalog"
              className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase px-6 py-3 font-medium"
              style={{ background: 'var(--gold)', color: '#000' }}>
              <ShoppingBag className="w-4 h-4" />
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const s = STATUS[order.status] || STATUS.pending;
              return (
                <div key={order.id}
                  style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>

                  {/* Header */}
                  <div className="flex items-start justify-between p-5"
                    style={{ borderBottom: '1px solid var(--dark-border)' }}>
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                        {new Date(order.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric', month: 'long', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                      <p className="text-xs font-mono tracking-widest" style={{ color: 'var(--text-dimmed)' }}>
                        #{order.id?.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 tracking-wide"
                      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                      {s.text}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="p-5 space-y-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-11 h-14 overflow-hidden shrink-0 flex items-center justify-center"
                          style={{ background: '#0e0e0e', border: '1px solid var(--dark-border)' }}>
                          {item.image_url
                            ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            : <span className="text-xl">🧴</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.name}</p>
                          {item.brand_name && (
                            <p className="text-[10px] tracking-[0.15em] uppercase mt-0.5"
                              style={{ color: 'var(--gold)' }}>{item.brand_name}</p>
                          )}
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {item.quantity} шт. × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-white shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
                    style={{ borderTop: '1px solid var(--dark-border)', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="space-y-1">
                      {(order.city || order.delivery_address) && (
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <MapPin className="w-3 h-3 shrink-0" style={{ color: 'var(--gold)' }} />
                          {[order.city, order.delivery_address].filter(Boolean).join(', ')}
                        </div>
                      )}
                      {order.payment_method && (
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <CreditCard className="w-3 h-3 shrink-0" style={{ color: 'var(--gold)' }} />
                          {PAYMENT_LABEL[order.payment_method] || order.payment_method}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] tracking-[0.15em] uppercase mb-0.5" style={{ color: 'var(--text-muted)' }}>Итого</p>
                      <p className="font-serif text-lg font-semibold text-white">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
