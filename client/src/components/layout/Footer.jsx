import { Link } from 'react-router-dom';

const LINKS = {
  'Каталог':   [
    { label: 'Все ароматы',    to: '/catalog' },
    { label: 'Женские',        to: '/catalog?gender=female' },
    { label: 'Мужские',        to: '/catalog?gender=male' },
    { label: 'Унисекс',        to: '/catalog?gender=unisex' },
  ],
  'Коллекции': [
    { label: 'Цветочные',      to: '/catalog?category=floral' },
    { label: 'Древесные',      to: '/catalog?category=woody' },
    { label: 'Восточные',      to: '/catalog?category=oriental' },
    { label: 'Свежие',         to: '/catalog?category=fresh' },
    { label: 'Гурманские',     to: '/catalog?category=gourmand' },
  ],
  'Сервис':    [
    { label: 'Мой профиль',    to: '/profile' },
    { label: 'Мои заказы',     to: '/orders' },
    { label: 'Корзина',        to: '/cart' },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: 'var(--dark)', borderTop: '1px solid var(--dark-border)' }}>
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 flex items-center justify-center" style={{ background: 'var(--gold)' }}>
                <span className="font-serif font-bold text-sm text-black">P</span>
              </div>
              <span className="font-serif text-lg font-semibold tracking-widest text-white">PERFSTORE</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed font-light mb-6">
              Оригинальная парфюмерия мировых домов. Доставляем редкость прямо к вам.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {['TG', 'VK', 'IG'].map((s) => (
                <div key={s} className="w-8 h-8 flex items-center justify-center text-[10px] font-semibold text-gray-600 transition-all cursor-pointer hover:text-[#C9A84C]"
                  style={{ border: '1px solid var(--dark-border)' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--dark-border)'}>
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-[10px] tracking-[0.3em] uppercase font-medium mb-4" style={{ color: 'var(--gold)' }}>
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to}
                      className="text-xs text-gray-600 hover:text-gray-300 transition-colors tracking-wide">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid var(--dark-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] tracking-widest text-gray-700 uppercase">
            © {new Date().getFullYear()} PerfStore.
          </p>
          <div className="flex items-center gap-2">
            <div className="h-px w-12" style={{ background: 'var(--dark-border)' }} />
            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--gold-dim)' }}>
              Оригинальная парфюмерия
            </span>
            <div className="h-px w-12" style={{ background: 'var(--dark-border)' }} />
          </div>
        </div>
      </div>
    </footer>
  );
}
