'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ur';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
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
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    const storedLang = localStorage.getItem('lang') as Language;
    if (storedLang && ['en', 'ur'].includes(storedLang)) {
      setLanguageState(storedLang);
    }
    document.cookie = `lang=${language}; path=/; max-age=31536000`;
  }, [language]);
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lang', lang);
    document.cookie = `lang=${lang}; path=/; max-age=31536000`; // 1 year
    window.location.reload();
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
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
