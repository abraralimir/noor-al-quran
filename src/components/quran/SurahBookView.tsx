
'use client';

import type { Ayah } from '@/types/quran';

interface SurahBookViewProps {
  ayahs: Ayah[];
}

export function SurahBookView({ ayahs }: SurahBookViewProps) {
  return (
    <div dir="rtl" className="font-arabic text-3xl lg:text-4xl leading-loose text-right p-4">
      {ayahs.map((ayah) => (
        <span key={ayah.number}>
          {ayah.text}
          <span className="text-sm font-mono text-accent bg-accent/10 rounded-full w-8 h-8 inline-flex items-center justify-center mx-1 align-middle">
            {ayah.numberInSurah}
          </span>
        </span>
      ))}
    </div>
  );
}
