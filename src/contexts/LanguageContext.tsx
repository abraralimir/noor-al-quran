
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import en from '@/locales/en.json';
import ur from '@/locales/ur.json';

type Language = 'en' | 'ur';

const translations = { en, ur };

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): Language {
    if (typeof window !== 'undefined') {
        const storedLang = localStorage.getItem('lang') as Language;
        if (storedLang && ['en', 'ur'].includes(storedLang)) {
            return storedLang;
        }
    }
    return 'en';
}


export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    setLanguageState(getInitialLanguage());
  }, []);

  useEffect(() => {
    if (language === 'ur') {
      document.documentElement.lang = 'ur';
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    }
    document.cookie = `lang=${language}; path=/; max-age=31536000`;
  }, [language]);
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lang', lang);
  };

  const t = useCallback((key: keyof typeof en): string => {
    return translations[language][key] || translations['en'][key];
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
