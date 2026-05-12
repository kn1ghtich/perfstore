import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2, Plus, Minus, ShoppingBag, ArrowLeft,
  ShoppingCart, ChevronRight, Package, User, LogIn,
  AlertCircle, CheckCircle2, MapPin, Store,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { createOrderApi } from '../api/orders';
import { fetchStoresByProduct } from '../api/stores';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const INPUT = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent';
const LABEL = 'block text-xs tracking-[0.1em] uppercase font-medium mb-1.5';

const PAYMENT_LABELS = {
  card:          'Банковская карта',
  cash:          'Наличными при получении',
  bank_transfer: 'Банковский перевод',
};

export default function CartPage() {
  const { items, removeItem, setQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // 'cart' | 'store' | 'checkout' | 'success'
  const [step, setStep]       = useState('cart');
  const [placing, setPlacing] = useState(false);
  const [orderNum, setOrderNum] = useState('');
  const [stockErrors, setStockErrors] = useState([]);

  // Store selection
  const [selectedStoreId, setSelectedStoreId]     = useState(null);
  const [selectedStoreName, setSelectedStoreName] = useState('');
  const [storeAvailability, setStoreAvailability] = useState([]);
  const [loadingStores, setLoadingStores]         = useState(false);

  const [form, setForm] = useState({
    name:             user ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.name || '' : '',
    phone:            user?.phone            || '',
    email:            user?.email            || '',
    city:             user?.city             || '',
    delivery_address: user?.delivery_address || '',
    payment_method:   'card',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  /* ── Load store availability for all cart items ─────────────────────── */
  const handleGoToStore = async () => {
    setStep('store');
    setLoadingStores(true);
    try {
      const productIds = [...new Set(items.map((i) => i.id))];
      const results = await Promise.all(
        productIds.map((pid) => fetchStoresByProduct(pid).then((d) => ({ pid, stores: d.stores })))
      );

      // Build per-store map: { storeId → { id, name, address, working_hours, items[] } }
      const storeMap = {};
      for (const { pid, stores } of results) {
        const cartItem = items.find((i) => i.id === pid);
        for (const s of stores) {
          if (!storeMap[s.id]) {
            storeMap[s.id] = {
              id: s.id, name: s.name,
              address: s.address, working_hours: s.working_hours,
              phone: s.phone, items: [],
            };
          }
          storeMap[s.id].items.push({
            pid,
            name:          cartItem.name,
            qty_available: s.quantity,
            qty_requested: cartItem.quantity,
          });
        }
      }
      setStoreAvailability(Object.values(storeMap));
    } catch {
      toast.error('Не удалось загрузить информацию о филиалах');
    } finally {
      setLoadingStores(false);
    }
  };

  const storeCanFulfill = (store) =>
    store.items.every((i) => i.qty_available >= i.qty_requested);

  /* ── Place order ────────────────────────────────────────────────────── */
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.delivery_address) {
      toast.error('Заполните имя, телефон и адрес доставки');
      return;
    }
    setPlacing(true);
    setStockErrors([]);
    try {
      const { order } = await createOrderApi({
        items: items.map((i) => ({
          product_id: i.id,
          name:       i.name,
          brand_name: i.brand_name,
          price:      i.price,
          quantity:   i.quantity,
          image_url:  i.image_url,
        })),
        total: totalPrice,
        contact: { name: form.name, phone: form.phone, email: form.email },
        city: form.city,
        delivery_address: form.delivery_address,
        payment_method: form.payment_method,
        store_id: selectedStoreId || undefined,
      });
      clearCart();
      setOrderNum(order?.id?.slice(-8).toUpperCase() || '');
      setStep('success');
    } catch (err) {
      const data = err.response?.data;
      if (data?.stockErrors?.length > 0) {
        setStockErrors(data.stockErrors);
        setTimeout(() =>
          document.getElementById('stock-error-block')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100
        );
      } else {
        toast.error('Не удалось оформить заказ. Попробуйте снова.');
      }
    } finally {
      setPlacing(false);
    }
  };

  /* ── Back navigation ────────────────────────────────────────────────── */
  const handleBack = () => {
    if (step === 'checkout') setStep('store');
    else if (step === 'store') setStep('cart');
    else navigate(-1);
  };

  const backLabel =
    step === 'checkout' ? 'Назад к выбору филиала' :
    step === 'store'    ? 'Назад в корзину' :
    'Назад';

  /* ── Empty cart ─────────────────────────────────────────────────────── */
  if (items.length === 0 && step !== 'success') {
    return (
      <div style={{ background: 'var(--dark)', minHeight: '100vh' }}>
        <div className="max-w-2xl mx-auto px-4 py-24 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: '#141414', border: '1px solid var(--dark-border)' }}>
            <ShoppingCart className="w-8 h-8" style={{ color: '#555' }} />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-white mb-2">Корзина пуста</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            Добавьте ароматы из каталога, чтобы начать покупки
          </p>
          <Link to="/catalog"
            className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase px-6 py-3 font-medium"
            style={{ background: 'var(--gold)', color: '#000' }}>
            <ShoppingBag className="w-4 h-4" />
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  /* ── Success ────────────────────────────────────────────────────────── */
  if (step === 'success') {
    return (
      <div style={{ background: 'var(--dark)', minHeight: '100vh' }}>
        <div className="max-w-lg mx-auto px-4 py-24 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: '#22c55e' }} />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-white mb-2">Заказ принят!</h1>
          {orderNum && (
            <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--gold)' }}>
              #{orderNum}
            </p>
          )}
          {selectedStoreName && (
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              Филиал: <span style={{ color: 'var(--text-secondary)' }}>{selectedStoreName}</span>
            </p>
          )}
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            {user
              ? 'Мы свяжемся с вами для подтверждения. Статус заказа можно отследить в личном кабинете.'
              : 'Мы свяжемся с вами по указанному телефону для подтверждения заказа.'}
          </p>
          <div className="flex gap-3">
            {user && (
              <Link to="/orders"
                className="text-xs tracking-[0.1em] uppercase px-5 py-2.5 font-medium"
                style={{ background: 'var(--gold)', color: '#000' }}>
                Мои заказы
              </Link>
            )}
            <Link to="/catalog"
              className="text-xs tracking-[0.1em] uppercase px-5 py-2.5 font-medium transition-colors"
              style={{ border: '1px solid var(--dark-border)', color: '#a0a0a0' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--gold)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#a0a0a0'; e.currentTarget.style.borderColor = 'var(--dark-border)'; }}>
              В каталог
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Order summary sidebar (reused across steps) ────────────────────── */
  const OrderSummary = () => (
    <div className="sticky top-24 p-5" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
      <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--gold)' }}>Ваш заказ</p>
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-10 h-12 overflow-hidden shrink-0 flex items-center justify-center"
              style={{ background: '#0e0e0e' }}>
              {item.image_url
                ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                : <span className="text-base">🧴</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium truncate">{item.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.quantity} шт.</p>
            </div>
            <span className="text-xs font-semibold text-white shrink-0">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="pt-3" style={{ borderTop: '1px solid var(--dark-border)' }}>
        <div className="flex justify-between font-semibold text-white text-sm">
          <span>К оплате</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
        {selectedStoreName && (
          <div className="flex items-center gap-1.5 mt-2">
            <MapPin className="w-3 h-3 shrink-0" style={{ color: 'var(--gold)' }} />
            <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{selectedStoreName}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Back */}
        <button onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs tracking-wide transition-colors mb-8"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
          <ArrowLeft className="w-3.5 h-3.5" />
          {backLabel}
        </button>

        {/* Header + breadcrumb */}
        <div className="mb-8" style={{ borderBottom: '1px solid var(--dark-border)', paddingBottom: '1.25rem' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8" style={{ background: 'var(--gold)' }} />
            <span className="text-[10px] tracking-[0.35em] uppercase" style={{ color: 'var(--gold)' }}>Корзина</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
              {step === 'cart'     ? `Мои товары` :
               step === 'store'   ? 'Выбор филиала' :
               'Оформление заказа'}
              {step === 'cart' && (
                <span className="ml-2 text-lg font-light" style={{ color: '#555' }}>({totalItems})</span>
              )}
            </h1>
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span style={{ color: step === 'cart' ? '#fff' : 'var(--text-muted)', fontWeight: step === 'cart' ? 600 : 400 }}>1. Корзина</span>
              <ChevronRight className="w-3.5 h-3.5" style={{ color: '#444' }} />
              <span style={{ color: step === 'store' ? '#fff' : 'var(--text-muted)', fontWeight: step === 'store' ? 600 : 400 }}>2. Филиал</span>
              <ChevronRight className="w-3.5 h-3.5" style={{ color: '#444' }} />
              <span style={{ color: step === 'checkout' ? '#fff' : 'var(--text-muted)', fontWeight: step === 'checkout' ? 600 : 400 }}>3. Оформление</span>
            </div>
          </div>
        </div>

        {/* ═══ STEP 1: CART ═══════════════════════════════════════ */}
        {step === 'cart' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Items list */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  {items.length} {items.length === 1 ? 'товар' : items.length < 5 ? 'товара' : 'товаров'}
                </span>
                <button onClick={clearCart}
                  className="text-xs transition-colors tracking-wide"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                  Очистить корзину
                </button>
              </div>

              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4"
                  style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                  <Link to={`/product/${item.slug}`} className="shrink-0">
                    <div className="w-16 h-20 overflow-hidden flex items-center justify-center"
                      style={{ background: '#0e0e0e' }}>
                      {item.image_url
                        ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        : <span className="text-2xl">🧴</span>}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] tracking-[0.15em] uppercase font-medium mb-0.5"
                      style={{ color: 'var(--gold)' }}>{item.brand_name}</p>
                    <Link to={`/product/${item.slug}`}
                      className="text-sm font-medium text-white leading-snug line-clamp-2 transition-colors"
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}>
                      {item.name}
                    </Link>
                    <p className="text-base font-semibold text-white mt-2">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <button onClick={() => removeItem(item.id)}
                      className="transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center" style={{ border: '1px solid var(--dark-border)' }}>
                      <button onClick={() => setQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-30"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.color = 'var(--gold)'; }}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-white">{item.quantity}</span>
                      <button onClick={() => setQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="p-5" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                  <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--gold)' }}>Ваш заказ</p>
                  <div className="space-y-2 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="truncate mr-2 max-w-[130px]">{item.name} × {item.quantity}</span>
                        <span className="shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 mb-5" style={{ borderTop: '1px solid var(--dark-border)' }}>
                    <div className="flex justify-between font-semibold text-white text-sm">
                      <span>К оплате</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {user ? (
                    <>
                      <button onClick={handleGoToStore}
                        className="w-full py-3 text-xs tracking-[0.15em] uppercase font-medium transition-colors"
                        style={{ background: 'var(--gold)', color: '#000' }}>
                        Выбрать филиал →
                      </button>
                      <Link to="/catalog"
                        className="block text-center text-xs transition-colors mt-3 tracking-wide"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#a0a0a0'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                        Продолжить покупки
                      </Link>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 text-xs text-center"
                        style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.2)' }}>
                        <p style={{ color: 'var(--text-muted)' }}>Войдите, чтобы отслеживать заказы</p>
                      </div>
                      <Link to="/login"
                        className="flex items-center justify-center gap-2 w-full py-3 text-xs tracking-[0.15em] uppercase font-medium"
                        style={{ background: 'var(--gold)', color: '#000' }}>
                        <LogIn className="w-3.5 h-3.5" />
                        Войти
                      </Link>
                      <Link to="/register"
                        className="flex items-center justify-center gap-2 w-full py-2.5 text-xs tracking-[0.15em] uppercase font-medium transition-colors"
                        style={{ border: '1px solid var(--dark-border)', color: '#a0a0a0' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--dark-border)'; e.currentTarget.style.color = '#a0a0a0'; }}>
                        <User className="w-3.5 h-3.5" />
                        Зарегистрироваться
                      </Link>
                      <button onClick={handleGoToStore}
                        className="w-full text-xs transition-colors py-1 tracking-wide underline underline-offset-2"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#a0a0a0'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                        Оформить без аккаунта
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 2: STORE SELECTION ════════════════════════════ */}
        {step === 'store' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Store list */}
            <div className="lg:col-span-2">
              <p className="text-xs tracking-[0.12em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                Шаг 2 из 3
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Выберите удобный филиал — товары спишутся со склада этого отделения.
                Если нужного количества нет в одном филиале, выберите другой.
              </p>

              {loadingStores ? (
                <div className="py-16 flex items-center justify-center">
                  <Spinner size="lg" />
                </div>
              ) : storeAvailability.length === 0 ? (
                <div className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                  <Store className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Нет доступных филиалов</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {storeAvailability.map((store) => {
                    const canFulfill = storeCanFulfill(store);
                    const issues     = store.items.filter((i) => i.qty_available < i.qty_requested);
                    const isSelected = selectedStoreId === store.id;

                    return (
                      <button
                        key={store.id}
                        onClick={() => { setSelectedStoreId(store.id); setSelectedStoreName(store.name); }}
                        className="w-full text-left p-5 transition-all"
                        style={{
                          background: isSelected ? 'rgba(201,168,76,0.07)' : 'var(--dark-card)',
                          border: `1px solid ${isSelected ? 'var(--gold)' : canFulfill ? 'rgba(34,197,94,0.25)' : 'var(--dark-border)'}`,
                        }}
                      >
                        <div className="flex items-start gap-4">
                          {/* Left: store info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{
                                background: canFulfill ? '#22c55e' : issues.length < store.items.length ? '#f59e0b' : '#ef4444'
                              }} />
                              <span className="text-sm font-semibold text-white">{store.name}</span>
                              {canFulfill && (
                                <span className="text-[10px] tracking-widest uppercase px-2 py-0.5"
                                  style={{ background: 'rgba(34,197,94,0.12)', color: '#86efac', border: '1px solid rgba(34,197,94,0.25)' }}>
                                  Всё в наличии
                                </span>
                              )}
                            </div>
                            {store.address && (
                              <div className="flex items-center gap-1.5 mb-2 ml-4">
                                <MapPin className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted)' }} />
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{store.address}</span>
                              </div>
                            )}
                            {store.working_hours && (
                              <p className="text-xs ml-4 mb-2" style={{ color: 'var(--text-muted)' }}>
                                {store.working_hours}
                              </p>
                            )}

                            {/* Per-item availability */}
                            <div className="ml-4 space-y-1.5 mt-2">
                              {store.items.map((item, idx) => {
                                const ok = item.qty_available >= item.qty_requested;
                                const partial = !ok && item.qty_available > 0;
                                return (
                                  <div key={idx} className="flex items-center gap-2 text-xs">
                                    <span style={{ color: ok ? '#86efac' : partial ? '#fbbf24' : '#f87171' }}>
                                      {ok ? '✓' : partial ? '⚠' : '✗'}
                                    </span>
                                    <span style={{ color: 'var(--text-secondary)' }} className="truncate max-w-[200px]">
                                      {item.name}
                                    </span>
                                    <span className="shrink-0" style={{ color: ok ? '#86efac' : partial ? '#fbbf24' : '#f87171' }}>
                                      {ok
                                        ? `${item.qty_available} шт.`
                                        : `${item.qty_available} из ${item.qty_requested} шт.`}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {!canFulfill && (
                              <p className="ml-4 mt-2 text-xs" style={{ color: '#f59e0b' }}>
                                Недостаточно товара — при оформлении укажет точную ошибку
                              </p>
                            )}
                          </div>

                          {/* Radio */}
                          <div className="w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center"
                            style={{
                              border: `2px solid ${isSelected ? 'var(--gold)' : '#444'}`,
                              background: isSelected ? 'var(--gold)' : 'transparent',
                            }}>
                            {isSelected && <div className="w-2 h-2 rounded-full" style={{ background: '#000' }} />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Continue button */}
              <div className="mt-6">
                <button
                  onClick={() => selectedStoreId && setStep('checkout')}
                  disabled={!selectedStoreId}
                  className="w-full py-3 text-xs tracking-[0.15em] uppercase font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: selectedStoreId ? 'var(--gold)' : '#2a2a2a', color: selectedStoreId ? '#000' : '#555' }}>
                  {selectedStoreId ? 'Продолжить к оформлению →' : 'Выберите филиал'}
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <OrderSummary />
            </div>
          </div>
        )}

        {/* ═══ STEP 3: CHECKOUT ═══════════════════════════════════ */}
        {step === 'checkout' && (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: forms */}
            <div className="lg:col-span-2 space-y-5">

              {/* Selected store info */}
              {selectedStoreName && (
                <div className="flex items-center gap-3 p-4"
                  style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: 'var(--gold)' }} />
                  <div className="min-w-0">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Выбранный филиал</p>
                    <p className="text-sm font-medium text-white truncate">{selectedStoreName}</p>
                  </div>
                  <button type="button" onClick={() => setStep('store')}
                    className="ml-auto text-xs shrink-0 transition-colors"
                    style={{ color: 'var(--gold)' }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                    Изменить
                  </button>
                </div>
              )}

              {/* Guest notice */}
              {!user && (
                <div className="flex items-start gap-3 p-4"
                  style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                  <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Вы оформляете заказ <span className="text-white font-medium">без аккаунта</span>.
                    Отслеживание статуса будет недоступно.{' '}
                    <Link to="/login" className="underline underline-offset-2" style={{ color: 'var(--gold)' }}>Войти</Link>{' '}или{' '}
                    <Link to="/register" className="underline underline-offset-2" style={{ color: 'var(--gold)' }}>зарегистрироваться</Link>
                  </div>
                </div>
              )}

              {/* Contact info */}
              <div className="p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                <p className="text-xs tracking-[0.2em] uppercase mb-5" style={{ color: 'var(--gold)' }}>Контактные данные</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={LABEL} style={{ color: 'var(--text-muted)' }}>Имя и фамилия *</label>
                    <input type="text" value={form.name} onChange={set('name')} required
                      placeholder="Аскар Аскаров" className={INPUT}
                      style={{ background: '#0a0a0a', borderColor: '#2a2a2a', color: '#fff', borderRadius: 0 }} />
                  </div>
                  <div>
                    <label className={LABEL} style={{ color: 'var(--text-muted)' }}>Телефон *</label>
                    <input type="tel" value={form.phone} onChange={set('phone')} required
                      placeholder="+7 (777) 000-00-00" className={INPUT}
                      style={{ background: '#0a0a0a', borderColor: '#2a2a2a', color: '#fff', borderRadius: 0 }} />
                  </div>
                  <div>
                    <label className={LABEL} style={{ color: 'var(--text-muted)' }}>Email</label>
                    <input type="email" value={form.email} onChange={set('email')}
                      placeholder="example@mail.com" className={INPUT}
                      style={{ background: '#0a0a0a', borderColor: '#2a2a2a', color: '#fff', borderRadius: 0 }} />
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                <p className="text-xs tracking-[0.2em] uppercase mb-5" style={{ color: 'var(--gold)' }}>Адрес доставки</p>
                <div className="space-y-4">
                  <div>
                    <label className={LABEL} style={{ color: 'var(--text-muted)' }}>Город</label>
                    <input type="text" value={form.city} onChange={set('city')}
                      placeholder="Астана" className={INPUT}
                      style={{ background: '#0a0a0a', borderColor: '#2a2a2a', color: '#fff', borderRadius: 0 }} />
                  </div>
                  <div>
                    <label className={LABEL} style={{ color: 'var(--text-muted)' }}>Адрес *</label>
                    <textarea value={form.delivery_address} onChange={set('delivery_address')} required
                      placeholder="ул. Абая, д. 1, кв. 10" rows={2}
                      className={INPUT + ' resize-none'}
                      style={{ background: '#0a0a0a', borderColor: '#2a2a2a', color: '#fff', borderRadius: 0 }} />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                <p className="text-xs tracking-[0.2em] uppercase mb-5" style={{ color: 'var(--gold)' }}>Способ оплаты</p>
                <div className="space-y-2">
                  {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
                    <label key={value}
                      className="flex items-center gap-3 p-3 cursor-pointer transition-colors"
                      style={{
                        border: `1px solid ${form.payment_method === value ? 'var(--gold)' : 'var(--dark-border)'}`,
                        background: form.payment_method === value ? 'rgba(201,168,76,0.06)' : 'transparent',
                      }}>
                      <input type="radio" name="payment_method" value={value}
                        checked={form.payment_method === value}
                        onChange={set('payment_method')}
                        className="accent-yellow-600" />
                      <span className="text-sm" style={{ color: form.payment_method === value ? '#fff' : 'var(--text-muted)' }}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: summary + submit */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-5" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--gold)' }}>Ваш заказ</p>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-12 overflow-hidden shrink-0 flex items-center justify-center"
                        style={{ background: '#0e0e0e' }}>
                        {item.image_url
                          ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          : <span className="text-base">🧴</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-medium truncate">{item.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.quantity} шт.</p>
                      </div>
                      <span className="text-xs font-semibold text-white shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 mb-5" style={{ borderTop: '1px solid var(--dark-border)' }}>
                  <div className="flex justify-between font-semibold text-white text-sm">
                    <span>К оплате</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  {selectedStoreName && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <MapPin className="w-3 h-3 shrink-0" style={{ color: 'var(--gold)' }} />
                      <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{selectedStoreName}</span>
                    </div>
                  )}
                </div>

                {/* Stock errors */}
                {stockErrors.length > 0 && (
                  <div id="stock-error-block" className="mb-4 p-4"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)' }}>
                    <div className="flex items-start gap-2 mb-3">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                      <p className="text-xs font-semibold text-red-400 tracking-wide">Недостаточно товара</p>
                    </div>
                    <div className="space-y-2">
                      {stockErrors.map((e, i) => (
                        <div key={i} className="text-xs pl-6" style={{ color: 'var(--text-muted)' }}>
                          <span className="text-white font-medium">{e.name}</span>
                          <span className="text-red-400"> — выбрано {e.requested} шт., </span>
                          {e.available > 0
                            ? <span>в наличии <span className="text-white font-medium">{e.available} шт.</span></span>
                            : <span className="text-red-400">нет в наличии в этом филиале</span>}
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => setStep('store')}
                      className="mt-3 text-xs underline underline-offset-2 pl-6"
                      style={{ color: 'var(--gold)' }}>
                      Выбрать другой филиал →
                    </button>
                  </div>
                )}

                <button type="submit" disabled={placing}
                  className="w-full flex items-center justify-center gap-2 py-3 text-xs tracking-[0.15em] uppercase font-medium transition-all disabled:opacity-60"
                  style={{ background: placing ? '#8a7230' : 'var(--gold)', color: '#000' }}>
                  <Package className="w-3.5 h-3.5" />
                  {placing ? 'Оформляем...' : 'Подтвердить заказ'}
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
