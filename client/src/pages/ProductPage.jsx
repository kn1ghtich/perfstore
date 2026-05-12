import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProductBySlug } from '../api/products';
import { fetchReviews } from '../api/reviews';
import { subscribeStockAlert } from '../api/notifications';
import { fetchStoresByProduct } from '../api/stores';
import NotesPyramid from '../components/product/NotesPyramid';
import ReviewList from '../components/review/ReviewList';
import ReviewForm from '../components/review/ReviewForm';
import StarRating from '../components/review/StarRating';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { WishlistContext } from '../context/WishlistContext';
import { ArrowLeft, ShoppingCart, Plus, Minus, Check, Heart, Bell, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const GENDER_LABELS = { female: 'Женский', male: 'Мужской', unisex: 'Унисекс' };
const GENDER_VARIANT = { female: 'pink', male: 'blue', unisex: 'green' };

export default function ProductPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { has, toggle } = useContext(WishlistContext) || {};

  const [product, setProduct]         = useState(null);
  const [reviews, setReviews]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [qty, setQty]                 = useState(1);
  const [added, setAdded]             = useState(false);
  const [alerted, setAlerted]         = useState(false);
  const [expandedCat, setExpandedCat] = useState(null);
  const [storeStock, setStoreStock]   = useState([]);
  const [activeImg, setActiveImg]     = useState(0);

  const inWishlist = has?.(product?.id);

  const loadData = async () => {
    try {
      const { product: p } = await fetchProductBySlug(slug);
      setProduct(p);
      const [{ reviews: r }, { stores }] = await Promise.all([
        fetchReviews(p.id),
        fetchStoresByProduct(p.id),
      ]);
      setReviews(r);
      setStoreStock(stores);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    setQty(1);
    setAdded(false);
    setExpandedCat(null);
    setStoreStock([]);
    loadData();
  }, [slug]);

  const handleAdd = () => {
    if (!user) {
      toast('Войдите, чтобы добавить в корзину', { icon: '🔐', duration: 2000 });
      navigate('/login');
      return;
    }
    addItem(product, qty);
    toast.success(`${product.name} добавлен в корзину`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    const wasIn = inWishlist;
    await toggle?.(product.id);
    toast(wasIn ? 'Удалено из избранного' : '❤️ Добавлено в избранное', { duration: 1500 });
  };

  const handleNotify = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await subscribeStockAlert(product.id);
      setAlerted(true);
      toast('🔔 Уведомим вас о поступлении', { duration: 2000 });
    } catch { toast.error('Ошибка подписки'); }
  };

  if (loading) return <div style={{ background: 'var(--dark)', minHeight: '100vh' }} className="flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!product) return <div style={{ background: 'var(--dark)', minHeight: '100vh', color: 'var(--text-secondary)' }} className="flex items-center justify-center text-sm">Товар не найден</div>;

  // If branch data is loaded — derive stock status from branches, not the global flag
  const effectiveInStock = storeStock.length > 0
    ? storeStock.some((s) => s.in_stock)
    : product.in_stock;
  const effectiveQty = storeStock.length > 0
    ? storeStock.reduce((sum, s) => sum + s.quantity, 0)
    : product.quantity;

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back */}
        <Link to="/catalog"
          className="inline-flex items-center gap-1.5 text-xs tracking-wide mb-8 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
          <ArrowLeft className="w-3.5 h-3.5" /> Назад в каталог
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Image carousel ── */}
          {(() => {
            const allImgs = [product.image_url, ...(product.images || [])].filter(Boolean);
            const hasManyImgs = allImgs.length > 1;
            const goPrev = () => setActiveImg((i) => (i - 1 + allImgs.length) % allImgs.length);
            const goNext = () => setActiveImg((i) => (i + 1) % allImgs.length);
            const safeIdx = Math.min(activeImg, allImgs.length - 1);

            return (
              <div>
                {/* Main image */}
                <div className="overflow-hidden aspect-square relative flex items-center justify-center"
                  style={{ background: '#0e0e0e', border: '1px solid var(--dark-border)' }}>
                  {allImgs.length > 0 ? (
                    <>
                      <img
                        key={allImgs[safeIdx]}
                        src={allImgs[safeIdx]}
                        alt={`${product.name} ${safeIdx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Counter */}
                      {hasManyImgs && (
                        <div className="absolute top-3 right-3 text-xs px-2 py-1 font-medium"
                          style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', letterSpacing: '0.05em' }}>
                          {safeIdx + 1} / {allImgs.length}
                        </div>
                      )}

                      {/* Arrow buttons */}
                      {hasManyImgs && (
                        <>
                          <button onClick={goPrev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center transition-all hover:scale-110"
                            style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button onClick={goNext}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center transition-all hover:scale-110"
                            style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-16">
                      <div className="text-7xl mb-4">🧴</div>
                      <p style={{ color: 'var(--text-muted)' }} className="text-sm">{product.brand_name}</p>
                    </div>
                  )}
                </div>

                {/* Thumbnail strip */}
                {hasManyImgs && (
                  <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1">
                    {allImgs.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className="shrink-0 w-14 h-14 overflow-hidden transition-all"
                        style={{
                          border: `2px solid ${i === safeIdx ? 'var(--gold)' : 'var(--dark-border)'}`,
                          opacity: i === safeIdx ? 1 : 0.55,
                        }}
                      >
                        <img src={img} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Details ── */}
          <div>
            {/* Brand */}
            <div className="mb-3 flex items-center gap-2">
              <Link
                to={`/catalog?brands=${product.brand_slug}`}
                className="text-xs tracking-[0.2em] uppercase font-semibold hover:underline"
                style={{ color: 'var(--gold)' }}
              >
                {product.brand_name}
              </Link>
              {product.brand_country && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({product.brand_country})</span>
              )}
            </div>

            {/* Name */}
            <h1 className="font-serif text-3xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <StarRating rating={Math.round(parseFloat(product.avg_rating))} size="sm" />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {product.avg_rating > 0
                  ? `${product.avg_rating} · ${product.review_count} отзывов`
                  : 'Нет отзывов'}
              </span>
            </div>

            {/* Price + badges */}
            {(() => {
              const discount = product.original_price && product.original_price > product.price
                ? Math.round((1 - product.price / product.original_price) * 100)
                : null;
              return (
                <>
                  <div className="flex items-end gap-3 mb-3 flex-wrap">
                    <span className="font-serif text-3xl font-bold text-white">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    {discount && (
                      <>
                        <span className="font-serif text-xl line-through mb-0.5" style={{ color: 'var(--text-muted)' }}>
                          ${parseFloat(product.original_price).toFixed(2)}
                        </span>
                        <span className="text-sm font-bold px-2 py-0.5 mb-0.5"
                          style={{ background: 'rgba(220,38,38,0.15)', color: '#f87171', border: '1px solid rgba(220,38,38,0.35)' }}>
                          −{discount}%
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-5 flex-wrap">
                    <Badge variant={GENDER_VARIANT[product.gender] || 'gray'}>
                      {GENDER_LABELS[product.gender] || product.gender}
                    </Badge>
                    {product.concentration && <Badge variant="gray">{product.concentration}</Badge>}
                    {product.volume_ml      && <Badge variant="gray">{product.volume_ml} мл</Badge>}
                  </div>
                </>
              );
            })()}

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              {effectiveInStock ? (
                <>
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5"
                    style={{ background: 'rgba(34,197,94,0.1)', color: '#86efac', border: '1px solid rgba(34,197,94,0.25)' }}>
                    ✓ В наличии
                  </span>
                  {/* Show qty warning only when no branch data — exact per-branch qty shown below */}
                  {storeStock.length === 0 && product.quantity > 0 && product.quantity <= 3 && (
                    <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5"
                      style={{ background: 'rgba(251,146,60,0.1)', color: '#fdba74', border: '1px solid rgba(251,146,60,0.25)' }}>
                      ⚡ Осталось {product.quantity} шт.
                    </span>
                  )}
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' }}>
                  ✗ Нет в наличии
                </span>
              )}
            </div>

            {/* Per-branch availability */}
            {storeStock.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs tracking-[0.18em] uppercase font-semibold mb-3" style={{ color: 'var(--gold)' }}>
                  Наличие по филиалам
                </h3>
                <div className="space-y-1.5">
                  {storeStock.map((s) => (
                    <div key={s.id}
                      className="flex items-center justify-between px-3 py-2"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: s.in_stock ? '#22c55e' : '#ef4444' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {s.name}
                        </span>
                      </div>
                      {s.in_stock ? (
                        <span className="text-xs" style={{ color: '#86efac' }}>
                          {s.quantity} шт.
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Нет</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
              {product.description}
            </p>

            {/* Categories */}
            {product.categories?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs tracking-[0.18em] uppercase font-semibold mb-3" style={{ color: 'var(--gold)' }}>
                  Семейства ароматов
                </h3>
                <div className="flex gap-2 flex-wrap mb-3">
                  {product.categories.map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (cat.description) setExpandedCat(expandedCat === cat.slug ? null : cat.slug);
                        else navigate(`/catalog?categories=${cat.slug}`);
                      }}
                      className="text-xs px-3 py-1.5 transition-all"
                      style={{
                        background: expandedCat === cat.slug ? 'rgba(201,168,76,0.2)' : 'rgba(201,168,76,0.08)',
                        color: 'var(--gold)',
                        border: `1px solid ${expandedCat === cat.slug ? 'rgba(201,168,76,0.6)' : 'rgba(201,168,76,0.25)'}`,
                      }}
                    >
                      {cat.name} {cat.description ? (expandedCat === cat.slug ? '▲' : '▼') : ''}
                    </button>
                  ))}
                </div>

                {expandedCat && (() => {
                  const cat = product.categories.find((c) => c.slug === expandedCat);
                  if (!cat?.description) return null;
                  return (
                    <div className="p-4" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
                      <p className="text-xs tracking-wide font-semibold mb-1.5" style={{ color: 'var(--gold)' }}>{cat.name}</p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{cat.description}</p>
                      <Link
                        to={`/catalog?categories=${cat.slug}`}
                        className="inline-block mt-2 text-xs hover:underline"
                        style={{ color: 'var(--gold)' }}
                      >
                        Смотреть все ароматы семейства →
                      </Link>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Add to cart / Notify */}
            {!effectiveInStock ? (
              <div className="mt-6">
                <button
                  onClick={handleNotify}
                  className="w-full flex items-center justify-center gap-2 py-3 text-xs tracking-[0.15em] uppercase font-semibold transition-all"
                  style={{
                    background: alerted ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                    color: alerted ? '#86efac' : 'var(--text-secondary)',
                    border: `1px solid ${alerted ? 'rgba(34,197,94,0.3)' : 'var(--dark-border)'}`,
                  }}
                >
                  <Bell className="w-4 h-4" />
                  {alerted ? 'Ожидаете поступления' : 'Уведомить о поступлении'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-6">
                {/* Qty */}
                <div className="flex items-center" style={{ border: '1px solid var(--dark-border)' }}>
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-12 flex items-center justify-center transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-white">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-10 h-12 flex items-center justify-center transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Cart button */}
                <button
                  onClick={handleAdd}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-xs tracking-[0.15em] uppercase font-semibold transition-all"
                  style={{
                    background: added ? 'rgba(34,197,94,0.15)' : 'var(--gold)',
                    color: added ? '#86efac' : '#000',
                    border: added ? '1px solid rgba(34,197,94,0.3)' : 'none',
                  }}
                >
                  {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  {added ? 'Добавлено!' : 'В корзину'}
                </button>

                {/* Wishlist */}
                <button
                  onClick={handleWishlist}
                  title={inWishlist ? 'Убрать из избранного' : 'Добавить в избранное'}
                  className="w-12 h-12 flex items-center justify-center transition-all"
                  style={{
                    border: `1px solid ${inWishlist ? 'rgba(239,68,68,0.5)' : 'var(--dark-border)'}`,
                    background: inWishlist ? 'rgba(239,68,68,0.1)' : 'transparent',
                  }}
                >
                  <Heart
                    className="w-5 h-5 transition-colors"
                    style={{ color: inWishlist ? '#f87171' : 'var(--text-muted)' }}
                    fill={inWishlist ? '#f87171' : 'none'}
                  />
                </button>
              </div>
            )}

            {/* Notes Pyramid */}
            <div className="mt-8">
              <NotesPyramid notes={product.notes} />
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        <section className="mt-16" style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '3rem' }}>
          <h2 className="font-serif text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
            Отзывы
            <span className="ml-2 text-lg font-light" style={{ color: 'var(--text-muted)' }}>
              ({reviews.length})
            </span>
          </h2>

          {user ? (
            <div className="mb-8">
              <ReviewForm productId={product.id} onReviewAdded={loadData} />
            </div>
          ) : (
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
              <Link to="/login" className="hover:underline" style={{ color: 'var(--gold)' }}>Войдите</Link>
              , чтобы оставить отзыв
            </p>
          )}

          <ReviewList reviews={reviews} />
        </section>

      </div>
    </div>
  );
}
