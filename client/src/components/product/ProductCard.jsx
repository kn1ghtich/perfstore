import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check, Heart, Bell } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { WishlistContext } from '../../context/WishlistContext';
import { AuthContext } from '../../context/AuthContext';
import { subscribeStockAlert } from '../../api/notifications';
import toast from 'react-hot-toast';

const GENDER_LABELS = { female: 'Женский', male: 'Мужской', unisex: 'Унисекс' };
const GENDER_COLOR  = { female: '#c97eb8', male: '#7eb8c9', unisex: '#a0c97e' };

export default function ProductCard({ product }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [added, setAdded]         = useState(false);
  const [alerted, setAlerted]     = useState(false);
  const { addItem }   = useCart();
  const { has, toggle } = useContext(WishlistContext) || {};
  const { user }      = useContext(AuthContext) || {};
  const navigate      = useNavigate();

  const inWishlist = has?.(product.id);

  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) {
      toast('Войдите, чтобы добавить в корзину', { icon: '🔐', duration: 2000 });
      navigate('/login');
      return;
    }
    addItem(product);
    toast.success('Добавлено в корзину');
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    const ok = await toggle?.(product.id);
    if (ok) toast(inWishlist ? 'Удалено из избранного' : '❤️ Добавлено в избранное', { duration: 1500 });
  };

  const handleNotify = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    try {
      await subscribeStockAlert(product.id);
      setAlerted(true);
      toast('🔔 Уведомим вас о поступлении', { duration: 2000 });
    } catch { toast.error('Ошибка подписки'); }
  };

  const showImage = product.image_url && !imgFailed;

  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block"
      style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', background: '#0e0e0e' }}>
        {showImage ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            style={{ transform: 'scale(1)', transition: 'transform 700ms ease' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <span className="text-5xl mb-3">🧴</span>
            <p className="text-xs text-gray-600">{product.brand_name}</p>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)' }}>
          {product.in_stock ? (
            <button
              onClick={handleAdd}
              className="w-full py-2.5 text-xs tracking-[0.15em] uppercase font-medium transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: added ? 'rgba(34,197,94,0.9)' : 'var(--gold)',
                color: '#000',
              }}
            >
              {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
              {added ? 'Добавлено' : 'В корзину'}
            </button>
          ) : (
            <button
              onClick={handleNotify}
              className="w-full py-2.5 text-xs tracking-[0.15em] uppercase font-medium transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: alerted ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.1)',
                color: alerted ? '#22c55e' : '#fff',
                border: `1px solid ${alerted ? '#22c55e' : 'rgba(255,255,255,0.3)'}`,
              }}
            >
              <Bell className="w-3.5 h-3.5" />
              {alerted ? 'Ожидаете поступления' : 'Уведомить о поступлении'}
            </button>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        >
          <Heart
            className="w-3.5 h-3.5 transition-colors"
            style={{ color: inWishlist ? '#ef4444' : '#fff' }}
            fill={inWishlist ? '#ef4444' : 'none'}
          />
        </button>

        {/* Stock / rating / discount badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount && (
            <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 font-bold"
              style={{ background: '#dc2626', color: '#fff' }}>
              −{discount}%
            </span>
          )}
          {!product.in_stock && (
            <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 bg-black/80 text-gray-400 border border-gray-700">
              Нет в наличии
            </span>
          )}
          {/* Low-stock badge: show total qty when 1–3 units remain across all branches */}
          {product.in_stock && product.quantity >= 1 && product.quantity <= 3 && (
            <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 font-semibold"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.35)' }}>
              Осталось {product.quantity} шт.
            </span>
          )}
          {product.avg_rating >= 4.5 && (
            <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 flex items-center gap-1"
              style={{ background: 'var(--gold)', color: '#000' }}>
              <Star className="w-2.5 h-2.5" /> Хит
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Brand + gender */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: 'var(--gold)' }}>
            {product.brand_name}
          </span>
          <span className="text-[10px] font-medium" style={{ color: GENDER_COLOR[product.gender] || 'var(--text-secondary)' }}>
            {GENDER_LABELS[product.gender] || product.gender}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-sm font-medium leading-snug line-clamp-2 mb-3 group-hover:text-[#C9A84C] transition-colors duration-200"
          style={{ color: 'var(--text-primary)' }}>
          {product.name}
        </h3>

        {/* Price + rating */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base font-semibold text-white">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            {discount && (
              <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
                ${parseFloat(product.original_price).toFixed(2)}
              </span>
            )}
          </div>
          {product.avg_rating > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-3 h-3 fill-[#C9A84C] text-[#C9A84C]" />
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{product.avg_rating}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
