import { Link, useNavigate } from 'react-router-dom';
import { Search, LogOut, User, ChevronDown, ShoppingCart, Package, LayoutDashboard, X, Menu, Heart, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useState, useRef, useEffect, useContext } from 'react';
import { shortName } from '../../utils/formatName';
import { WishlistContext } from '../../context/WishlistContext';
import { NotificationContext } from '../../context/NotificationContext';

const NAV = [
  { to: '/catalog', label: 'Каталог' },
  { to: '/stores',  label: 'Магазины' },
];

export default function Header() {
  const { user, logout } = useAuth();
  const { totalItems }   = useCart();
  const { count: wishlistCount } = useContext(WishlistContext) || {};
  const { unreadCount, openPanel } = useContext(NotificationContext) || {};
  const navigate         = useNavigate();
  const [query, setQuery]       = useState('');
  const [menuOpen, setMenu]     = useState(false);
  const [searchOpen, setSearch] = useState(false);
  const [mobileOpen, setMobile] = useState(false);
  const menuRef  = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (menuRef.current  && !menuRef.current.contains(e.target))  setMenu(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearch(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(query.trim())}`);
      setQuery(''); setSearch(false);
    }
  };

  return (
    <header className="sticky top-0 z-50" style={{ background: 'var(--dark)', borderBottom: '1px solid var(--dark-border)' }}>
      {/* Top promo bar */}
      <div className="text-center py-2 text-xs tracking-[0.2em] uppercase font-light" style={{ background: 'var(--gold)', color: '#000' }}>
        Бесплатная доставка от $150 · Оригинальная парфюмерия
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{ background: 'var(--gold)' }}>
              {/* Perfume bottle icon */}
              <svg viewBox="0 0 24 26" fill="#000" width="15" height="17" xmlns="http://www.w3.org/2000/svg">
                {/* Spray arm */}
                <rect x="13.5" y="5" width="4.5" height="1.8" rx="0.9"/>
                {/* Cap */}
                <rect x="7.5" y="2.5" width="7" height="3" rx="0.6"/>
                {/* Neck */}
                <rect x="10" y="5.5" width="3.5" height="2.5"/>
                {/* Body */}
                <rect x="4.5" y="8" width="15" height="16" rx="2"/>
              </svg>
            </div>
            <span className="font-serif text-xl font-semibold tracking-widest text-white group-hover:text-[#C9A84C] transition-colors">
              PERFSTORE
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-xs tracking-[0.15em] uppercase font-medium transition-colors"
                style={{ color: '#a0a0a0' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--gold)'}
                onMouseLeave={(e) => e.target.style.color = '#a0a0a0'}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Search toggle */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearch((o) => !o)}
                className="text-gray-400 hover:text-[#C9A84C] transition-colors p-1"
              >
                {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
              {searchOpen && (
                <form
                  onSubmit={handleSearch}
                  className="absolute right-0 top-full mt-3 z-50"
                >
                  <div className="flex items-center border" style={{ background: '#1a1a1a', borderColor: 'var(--gold)', borderRadius: 0 }}>
                    <input
                      autoFocus
                      type="text"
                      placeholder="Поиск аромата..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="px-4 py-2.5 text-sm bg-transparent text-white placeholder-gray-600 outline-none w-64"
                    />
                    <button type="submit" className="px-3 text-gray-400 hover:text-[#C9A84C]">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Notifications bell */}
            <button
              onClick={openPanel}
              className="relative text-gray-400 hover:text-[#C9A84C] transition-colors p-1"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 text-[9px] font-bold rounded-full flex items-center justify-center px-0.5"
                  style={{ background: 'var(--gold)', color: '#000' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Wishlist */}
            {user && (
              <Link to="/wishlist" className="relative text-gray-400 hover:text-[#C9A84C] transition-colors p-1 hidden md:block">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 text-[9px] font-bold rounded-full flex items-center justify-center px-0.5"
                    style={{ background: '#ef4444', color: '#fff' }}>
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative text-gray-400 hover:text-[#C9A84C] transition-colors p-1">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 text-[9px] font-bold rounded-full flex items-center justify-center px-0.5"
                  style={{ background: 'var(--gold)', color: '#000' }}>
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenu((o) => !o)}
                  className="flex items-center gap-2 p-1 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center ring-1"
                    style={{ background: '#2a2a2a', ringColor: 'var(--dark-border)' }}>
                    {user.avatar
                      ? <img src={user.avatar} alt="av" className="w-full h-full object-cover" />
                      : <User className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />}
                  </div>
                  <span className="hidden sm:block text-xs text-gray-400 max-w-[100px] truncate">
                    {shortName(user.first_name, user.last_name) || user.name}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-gray-600 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 z-50 py-1 shadow-2xl"
                    style={{ background: '#141414', border: '1px solid var(--dark-border)' }}>
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--dark-border)' }}>
                      <p className="text-sm font-medium text-white truncate">
                        {shortName(user.first_name, user.last_name) || user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                    </div>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs tracking-wide transition-colors"
                        style={{ color: 'var(--gold)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#1e1a10'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <LayoutDashboard className="w-3.5 h-3.5" /> Администратор
                      </Link>
                    )}
                    {[
                      { to: '/profile', icon: User,    label: 'Мой профиль' },
                      { to: '/orders',  icon: Package, label: 'Мои заказы'  },
                    ].map(({ to, icon: Icon, label }) => (
                      <Link key={to} to={to} onClick={() => setMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-400 tracking-wide transition-colors"
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ''; }}>
                        <Icon className="w-3.5 h-3.5" /> {label}
                      </Link>
                    ))}
                    <button onClick={() => { setMenu(false); logout(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-500 tracking-wide transition-colors"
                      style={{ borderTop: '1px solid var(--dark-border)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#1e1010'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.background = 'transparent'; }}>
                      <LogOut className="w-3.5 h-3.5" /> Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link to="/login"
                  className="text-xs tracking-[0.1em] uppercase text-gray-400 hover:text-[#C9A84C] transition-colors">
                  Войти
                </Link>
                <Link to="/register"
                  className="text-xs tracking-[0.1em] uppercase px-4 py-2 font-medium transition-colors"
                  style={{ background: 'var(--gold)', color: '#000' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gold-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gold)'}>
                  Регистрация
                </Link>
              </div>
            )}

            {/* Mobile burger */}
            <button
              onClick={() => setMobile((o) => !o)}
              className="md:hidden p-1 text-gray-400 hover:text-[#C9A84C] transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden" style={{ background: '#0f0f0f', borderTop: '1px solid var(--dark-border)' }}>
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {NAV.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMobile(false)}
                className="px-3 py-3 text-sm tracking-[0.1em] uppercase font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors rounded-lg">
                {label}
              </Link>
            ))}
            <div className="my-2" style={{ borderTop: '1px solid var(--dark-border)' }} />
            {user ? (
              <>
                <Link to="/wishlist" onClick={() => setMobile(false)}
                  className="px-3 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors rounded-lg flex items-center gap-2">
                  <Heart className="w-4 h-4" /> Избранное {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
                <Link to="/profile" onClick={() => setMobile(false)}
                  className="px-3 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors rounded-lg flex items-center gap-2">
                  <User className="w-4 h-4" /> Профиль
                </Link>
                <Link to="/orders" onClick={() => setMobile(false)}
                  className="px-3 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors rounded-lg flex items-center gap-2">
                  <Package className="w-4 h-4" /> Заказы
                </Link>
                <button onClick={() => { setMobile(false); logout(); }}
                  className="px-3 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors rounded-lg flex items-center gap-2 text-left">
                  <LogOut className="w-4 h-4" /> Выйти
                </button>
              </>
            ) : (
              <div className="flex gap-3 px-3 pt-1">
                <Link to="/login" onClick={() => setMobile(false)}
                  className="flex-1 py-2.5 text-center text-xs tracking-[0.1em] uppercase text-gray-400 border border-gray-700 rounded-lg hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors">
                  Войти
                </Link>
                <Link to="/register" onClick={() => setMobile(false)}
                  className="flex-1 py-2.5 text-center text-xs tracking-[0.1em] uppercase font-medium rounded-lg"
                  style={{ background: 'var(--gold)', color: '#000' }}>
                  Регистрация
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
