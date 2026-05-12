import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../api/products';
import ProductCarousel from '../components/product/ProductCarousel';
import NewsCarousel from '../components/home/NewsCarousel';
import Spinner from '../components/ui/Spinner';
import { ArrowRight, Sparkles } from 'lucide-react';

const CAT_EMOJI = {
  floral: '🌸', woody: '🌲', oriental: '✨',
  fresh: '🍋', gourmand: '🍫', aromatic: '🌿',
};

const BRANDS = [
  'Chanel', 'Dior', 'Tom Ford', 'Versace',
  'Yves Saint Laurent', 'Creed', 'Jo Malone', 'Guerlain',
];

export default function HomePage() {
  const [featured, setFeatured]     = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      fetchProducts({ limit: 12 }),
      fetchProducts({ limit: 12, sort: 'price_desc' }),
      fetchCategories(),
    ]).then(([a, b, c]) => {
      setFeatured(a.products);
      setNewArrivals(b.products);
      setCategories(c.categories);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--dark)' }}>
      <Spinner size="lg" />
    </div>
  );

  return (
    <div style={{ background: '#0a0a0a' }}>

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: '88vh', background: 'var(--dark)' }}>
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }} />
          <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full opacity-6"
            style={{ background: 'radial-gradient(circle, #6b3fa0 0%, transparent 70%)' }} />
        </div>

        {/* Vertical gold line */}
        <div className="absolute left-8 top-0 bottom-0 w-px opacity-20" style={{ background: 'var(--gold)' }} />

        <div className="relative max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 flex items-center" style={{ minHeight: '88vh' }}>
          <div className="max-w-3xl fade-up">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-12" style={{ background: 'var(--gold)' }} />
              <span className="text-xs tracking-[0.4em] uppercase font-medium" style={{ color: 'var(--gold)' }}>
                Премиальная парфюмерия
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-semibold text-white leading-[1.05] mb-8">
              Откройте мир<br />
              <span style={{ color: 'var(--gold)' }}>редких ароматов</span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-400 text-lg font-light leading-relaxed mb-10 max-w-xl">
              Коллекция оригинальной парфюмерии мировых домов. Найдите аромат, который станет вашей подписью.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-5">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-3 px-8 py-3.5 text-xs tracking-[0.2em] uppercase font-medium transition-all hover:gap-4"
                style={{ background: 'var(--gold)', color: '#000' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gold-light)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gold)'}
              >
                Смотреть каталог <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => document.querySelector('[data-chat-toggle]')?.click()}
                className="inline-flex items-center gap-2 px-8 py-3.5 text-xs tracking-[0.2em] uppercase font-medium text-gray-300 hover:text-white transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.15)' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                ИИ-подбор аромата
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-12 mt-16 pt-8" style={{ borderTop: '1px solid var(--dark-border)' }}>
              {[
                { value: '500+', label: 'Ароматов' },
                { value: '30+',  label: 'Мировых брендов' },
                { value: '100%', label: 'Оригиналы' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="font-serif text-2xl font-semibold" style={{ color: 'var(--gold)' }}>{value}</p>
                  <p className="text-xs tracking-widest uppercase text-gray-600 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'var(--dark-border)' }} />
      </section>

      {/* ═══════════════════════════════════════════
          NEWS CAROUSEL
      ═══════════════════════════════════════════ */}
      <section>
        <NewsCarousel />
      </section>

      {/* ═══════════════════════════════════════════
          POPULAR PRODUCTS
      ═══════════════════════════════════════════ */}
      <section className="py-20" style={{ background: '#0a0a0a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8" style={{ background: 'var(--gold)' }} />
                <span className="text-[10px] tracking-[0.35em] uppercase" style={{ color: 'var(--gold)' }}>
                  Выбор редакции
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-white">
                Популярные ароматы
              </h2>
            </div>
            <Link to="/catalog"
              className="hidden sm:flex items-center gap-2 text-xs tracking-[0.15em] uppercase pb-px transition-colors"
              style={{ color: 'var(--gold)', borderBottom: '1px solid var(--gold)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold-light)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gold)'}
            >
              Весь каталог <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ProductCarousel products={featured} autoPlay interval={5000} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CATEGORIES
      ═══════════════════════════════════════════ */}
      <section className="py-20" style={{ background: '#0d0d0d', borderTop: '1px solid var(--dark-border)', borderBottom: '1px solid var(--dark-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px flex-1 max-w-[80px]" style={{ background: 'var(--dark-border)' }} />
              <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'var(--gold)' }}>
                Коллекции
              </span>
              <div className="h-px flex-1 max-w-[80px]" style={{ background: 'var(--dark-border)' }} />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-white font-semibold">
              Семейства ароматов
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.slug}`}
                className="group relative flex flex-col items-center justify-center py-8 px-4 text-center transition-all duration-300"
                style={{ background: '#141414', border: '1px solid var(--dark-border)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gold)';
                  e.currentTarget.style.background = '#1a1508';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--dark-border)';
                  e.currentTarget.style.background = '#141414';
                }}
              >
                <span className="text-3xl mb-3 block transition-transform duration-300 group-hover:scale-110">
                  {CAT_EMOJI[cat.slug] || '💐'}
                </span>
                <span className="text-xs tracking-[0.15em] uppercase font-medium text-gray-400 group-hover:text-[#C9A84C] transition-colors">
                  {cat.name}
                </span>
                {/* Gold bottom border on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-px transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  style={{ background: 'var(--gold)' }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          EDITORIAL BANNER
      ═══════════════════════════════════════════ */}
      <section className="py-20" style={{ background: 'var(--dark)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left — large */}
            <Link to="/catalog?gender=female"
              className="relative overflow-hidden group/banner flex flex-col justify-end p-8 sm:p-10"
              style={{ minHeight: '360px', background: 'linear-gradient(135deg, #1a0a2e 0%, #2a0f45 60%, #0a0a14 100%)', border: '1px solid var(--dark-border)' }}>
              <div className="absolute inset-0 opacity-0 group-hover/banner:opacity-100 transition-opacity duration-500 shimmer" />
              <div className="relative">
                <span className="text-4xl block mb-4">🌸</span>
                <p className="text-[10px] tracking-[0.35em] uppercase mb-2" style={{ color: 'var(--gold)' }}>Женская коллекция</p>
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-semibold mb-4">
                  Ароматы для неё
                </h3>
                <div className="flex items-center gap-2 text-xs tracking-widest uppercase" style={{ color: 'var(--gold)' }}>
                  Смотреть <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/banner:translate-x-1" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'var(--gold)', opacity: 0.3 }} />
            </Link>

            {/* Right — two stacked */}
            <div className="flex flex-col gap-4">
              <Link to="/catalog?gender=male"
                className="relative overflow-hidden group/banner2 flex flex-col justify-end p-8"
                style={{ minHeight: '170px', background: 'linear-gradient(135deg, #0a1428 0%, #0f2040 60%, #080a14 100%)', border: '1px solid var(--dark-border)', flex: 1 }}>
                <div className="absolute inset-0 opacity-0 group-hover/banner2:opacity-100 transition-opacity shimmer" />
                <div className="relative">
                  <p className="text-[10px] tracking-[0.35em] uppercase mb-1.5" style={{ color: '#7eb8c9' }}>Мужская коллекция</p>
                  <h3 className="font-serif text-xl text-white font-semibold flex items-center gap-3">
                    Ароматы для него <ArrowRight className="w-4 h-4 opacity-0 group-hover/banner2:opacity-100 transition-all" style={{ color: 'var(--gold)' }} />
                  </h3>
                </div>
              </Link>
              <Link to="/catalog?gender=unisex"
                className="relative overflow-hidden group/banner3 flex flex-col justify-end p-8"
                style={{ minHeight: '170px', background: 'linear-gradient(135deg, #0a1a0a 0%, #0f2a12 60%, #080a08 100%)', border: '1px solid var(--dark-border)', flex: 1 }}>
                <div className="absolute inset-0 opacity-0 group-hover/banner3:opacity-100 transition-opacity shimmer" />
                <div className="relative">
                  <p className="text-[10px] tracking-[0.35em] uppercase mb-1.5" style={{ color: '#a0c97e' }}>Унисекс</p>
                  <h3 className="font-serif text-xl text-white font-semibold flex items-center gap-3">
                    Вне границ пола <ArrowRight className="w-4 h-4 opacity-0 group-hover/banner3:opacity-100 transition-all" style={{ color: 'var(--gold)' }} />
                  </h3>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          NEW ARRIVALS CAROUSEL
      ═══════════════════════════════════════════ */}
      <section className="py-20" style={{ background: '#0d0d0d', borderTop: '1px solid var(--dark-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8" style={{ background: 'var(--gold)' }} />
                <span className="text-[10px] tracking-[0.35em] uppercase" style={{ color: 'var(--gold)' }}>
                  Эксклюзивно
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-white">
                Премиальные ароматы
              </h2>
            </div>
            <Link to="/catalog?sort=price_desc"
              className="hidden sm:flex items-center gap-2 text-xs tracking-[0.15em] uppercase pb-px"
              style={{ color: 'var(--gold)', borderBottom: '1px solid var(--gold)' }}>
              Все <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ProductCarousel products={newArrivals} autoPlay={false} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BRANDS STRIP
      ═══════════════════════════════════════════ */}
      <section className="py-14" style={{ background: '#0a0a0a', borderTop: '1px solid var(--dark-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[10px] tracking-[0.4em] uppercase mb-8" style={{ color: 'var(--gold-dim)' }}>
            Официальные поставки брендов
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {BRANDS.map((b) => (
              <Link key={b} to={`/catalog?brand=${b.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm tracking-[0.15em] uppercase font-light transition-colors"
                style={{ color: '#3a3a3a' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#3a3a3a'}
              >
                {b}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          AI BLOCK
      ═══════════════════════════════════════════ */}
      <section className="py-24" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0c04 50%, #0a0a0a 100%)', borderTop: '1px solid var(--dark-border)' }}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid var(--dark-border)' }}>
            <Sparkles className="w-7 h-7" style={{ color: 'var(--gold)' }} />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-semibold mb-4">
            Не знаете, что выбрать?
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 font-light">
            Наш ИИ-консультант подберёт идеальный аромат, опираясь на ваши предпочтения, настроение и повод.
          </p>
          <button
            onClick={() => document.querySelector('[data-chat-toggle]')?.click()}
            className="inline-flex items-center gap-3 px-8 py-3.5 text-xs tracking-[0.2em] uppercase font-medium transition-all"
            style={{ border: '1px solid var(--gold)', color: 'var(--gold)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = '#000'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gold)'; }}
          >
            <Sparkles className="w-3.5 h-3.5" /> Спросить ИИ-консультанта
          </button>
        </div>
      </section>

    </div>
  );
}
