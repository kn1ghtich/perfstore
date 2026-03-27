import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, LogOut, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { useState, useRef, useEffect } from 'react';

const languages = [
  { code: 'en', label: 'English', flag: 'en' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'kk', label: 'Қазақша', flag: '🇰🇿' },
];

export default function Header() {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-purple-600" />
            <span className="text-xl font-bold text-gray-900">PerfStore</span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/catalog" className="text-gray-600 hover:text-purple-600 transition-colors">
              {t('header.catalog')}
            </Link>
            <Link to="/catalog?gender=female" className="text-gray-600 hover:text-purple-600 transition-colors">
              {t('header.women')}
            </Link>
            <Link to="/catalog?gender=male" className="text-gray-600 hover:text-purple-600 transition-colors">
              {t('header.men')}
            </Link>
            <Link to="/catalog?gender=unisex" className="text-gray-600 hover:text-purple-600 transition-colors">
              {t('header.unisex')}
            </Link>
          </nav>

          {/* Search + Language + Auth */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('header.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-48 lg:w-64"
                />
              </div>
            </form>

            {/*/!* Language Switcher *!/*/}
            {/*<div className="relative" ref={langRef}>*/}
            {/*  <button*/}
            {/*    onClick={() => setLangOpen(!langOpen)}*/}
            {/*    className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50"*/}
            {/*  >*/}
            {/*    <span className="text-sm">{currentLang.flag}</span>*/}
            {/*    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} />*/}
            {/*  </button>*/}
            {/*  {langOpen && (*/}
            {/*    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px] z-50">*/}
            {/*      {languages.map(lang => (*/}
            {/*        <button*/}
            {/*          key={lang.code}*/}
            {/*          onClick={() => { setLanguage(lang.code); setLangOpen(false); }}*/}
            {/*          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-purple-50 transition-colors ${*/}
            {/*            language === lang.code ? 'text-purple-600 bg-purple-50 font-medium' : 'text-gray-700'*/}
            {/*          }`}*/}
            {/*        >*/}
            {/*          <span>{lang.flag}</span>*/}
            {/*          <span>{lang.label}</span>*/}
            {/*        </button>*/}
            {/*      ))}*/}
            {/*    </div>*/}
            {/*  )}*/}
            {/*</div>*/}

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:inline">{user.name}</span>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-purple-600 transition-colors"
                  title={t('header.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  {t('header.signIn')}
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors"
                >
                  {t('header.signUp')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
