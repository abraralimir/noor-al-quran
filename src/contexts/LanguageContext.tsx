
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useParams } from 'next/navigation';
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

export function LanguageProvider({ children, langParam }: { children: ReactNode, langParam?: Language }) {
  const params = useParams();
  const langFromUrl = (params.lang || langParam || 'en') as Language;
  
  const [language, setLanguageState] = useState<Language>(langFromUrl);

  useEffect(() => {
    setLanguageState(langFromUrl);
  }, [langFromUrl]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    document.cookie = `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);

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
