
'use client';

import type { SurahDetails } from '@/types/quran';
import { AyahCard } from './AyahCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface SurahDisplayProps {
  surah: SurahDetails;
}

export function SurahDisplay({ surah }: SurahDisplayProps) {

  return (
    <div className="w-full h-full bg-background">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-4xl font-headline">{surah.englishName}</CardTitle>
              <CardDescription>{surah.englishNameTranslation}</CardDescription>
            </div>
            <p className="text-4xl font-arabic font-bold text-primary">{surah.name}</p>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="mb-6" />
          <AyahCard 
            ayahs={surah.ayahs} 
            surahNumber={surah.number} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
