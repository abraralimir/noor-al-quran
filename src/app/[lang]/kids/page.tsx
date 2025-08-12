
'use client';

import { LearningCard } from '@/components/kids/LearningCard';
import { WritingCanvas } from '@/components/kids/WritingCanvas';
import { useTranslation } from '@/hooks/use-translation';
import { arabicAlphabet, nooraniQaida } from '@/lib/kids-data';
import { BookMarked, BookAudio, Pencil } from 'lucide-react';

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
      
      {/* AI Writing Instructor Section */}
      <section>
        <div className={`flex items-center gap-4 mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg`}>
          <Pencil className="w-10 h-10" />
          <h2 className="text-3xl font-headline font-bold">{t('writingInstructorTitle')}</h2>
        </div>
        <WritingCanvas />
      </section>

      {/* Arabic Letters Section */}
      <section>
        <div className={`flex items-center gap-4 mb-6 p-4 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-lg`}>
          <BookMarked className="w-10 h-10" />
          <h2 className="text-3xl font-headline font-bold">{t('learnArabicLetters')}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {arabicAlphabet.map((item) => (
            <LearningCard
              key={`${item.name}-${item.letter}`}
              character={item.letter}
              name={item.name}
            />
          ))}
        </div>
      </section>

      {/* Noorani Qaida Section */}
      <section>
        <div className={`flex items-center gap-4 mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg`}>
          <BookAudio className="w-10 h-10" />
          <h2 className="text-3xl font-headline font-bold">{t('learnNooraniQaida')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {nooraniQaida.map((item) => (
            <LearningCard
              key={item.title}
              name={item.title}
              description={item.description}
              examples={item.examples}
              isQaida={true}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
