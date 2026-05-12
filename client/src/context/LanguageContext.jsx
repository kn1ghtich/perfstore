import { createContext, useState, useCallback, useMemo } from 'react';
import { en, ru, kk } from '../i18n';

export const LanguageContext = createContext(null);

const translations = { en, ru, kk };
const STORAGE_KEY = 'perfstore-lang';

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    // If user explicitly chose a language, respect it; otherwise default to Russian
    if (saved && saved !== 'en') return saved;
    // Reset old default 'en' to 'ru'
    localStorage.setItem(STORAGE_KEY, 'ru');
    return 'ru';
  });

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback((key, params) => {
    const str = translations[language]?.[key] || translations.en[key] || key;
    if (!params) return str;
    return Object.entries(params).reduce(
      (result, [k, v]) => result.replace(`{${k}}`, v),
      str
    );
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
