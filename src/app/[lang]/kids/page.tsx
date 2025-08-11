
'use client';

import { LearningCard } from '@/components/kids/LearningCard';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { arabicAlphabet, arabicNumbers } from '@/lib/kids-data';
import { BookMarked, Hash } from 'lucide-react';
import Image from 'next/image';

const sectionColors = {
  letters: 'from-sky-400 to-blue-500',
  numbers: 'from-amber-400 to-orange-500',
};

export default function KidsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-16">
      <section className="text-center relative rounded-2xl overflow-hidden p-8 bg-gradient-to-br from-pink-400 to-purple-500 shadow-2xl">
        <div className="relative">
            <h1 className="text-4xl md:text-6xl font-headline font-extrabold text-white drop-shadow-lg mb-4">
            {t('kidsCornerTitle')}
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            {t('kidsCornerDescription')}
            </p>
        </div>
      </section>

      {/* Arabic Letters Section */}
      <section>
        <div className={`flex items-center gap-4 mb-6 p-4 rounded-xl bg-gradient-to-r ${sectionColors.letters} text-white shadow-lg`}>
          <BookMarked className="w-10 h-10" />
          <h2 className="text-3xl font-headline font-bold">{t('learnArabicLetters')}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {arabicAlphabet.map((item) => (
            <LearningCard
              key={`${item.name}-${item.letter}`}
              character={item.letter}
              name={item.name}
              gradient={sectionColors.letters}
            />
          ))}
        </div>
      </section>

      {/* Arabic Numbers Section */}
      <section>
        <div className={`flex items-center gap-4 mb-6 p-4 rounded-xl bg-gradient-to-r ${sectionColors.numbers} text-white shadow-lg`}>
          <Hash className="w-10 h-10" />
          <h2 className="text-3xl font-headline font-bold">{t('learnArabicNumbers')}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {arabicNumbers.map((item) => (
            <LearningCard
              key={`${item.name}-${item.number}`}
              character={item.number}
              name={item.name}
              gradient={sectionColors.numbers}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
