
'use client';

import type { Ayah } from '@/types/quran';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import React from 'react';

interface AyahCardProps {
  ayahs: Ayah[];
  surahNumber: number;
}

export function AyahCard({ ayahs }: AyahCardProps) {
  const { language } = useLanguage();

  return (
    <div className="space-y-6">
      <div dir="rtl" className="text-3xl lg:text-4xl font-arabic leading-loose text-right">
        {ayahs.map((ayah) => (
          <React.Fragment key={ayah.number}>
            <span className="text-foreground">{ayah.text}</span>
            <span className="text-xl font-mono text-accent bg-accent/10 rounded-full w-10 h-10 inline-flex items-center justify-center mx-2 align-middle">
                {ayah.numberInSurah}
            </span>
          </React.Fragment>
        ))}
      </div>
      
      <div className="border-t pt-6 mt-6 space-y-4">
         <h3 className="text-2xl font-headline font-semibold">{language === 'ur' ? 'ترجمہ' : 'Translation'}</h3>
         {ayahs.map((ayah) => (
             <div key={ayah.numberInSurah} className="flex items-start gap-4">
                 <span className="text-sm font-mono text-muted-foreground pt-1">{ayah.numberInSurah}.</span>
                 <p 
                    className={cn("flex-1 text-muted-foreground", language === 'ur' ? 'text-right font-urdu' : 'text-left')}
                    dir={language === 'ur' ? 'rtl' : 'ltr'}
                 >
                    {ayah.translation}
                 </p>
             </div>
         ))}
      </div>

    </div>
  );
}
