
'use client';

import { useState } from 'react';
import type { SurahDetails } from '@/types/quran';
import { AyahCard } from './AyahCard';
import { SurahBookView } from './SurahBookView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BookText, Book, Separator } from 'lucide-react';
import { getSurah } from '@/lib/quran-api';

interface SurahDisplayProps {
  surahNumber: number;
}

export function SurahDisplay({ surahNumber }: SurahDisplayProps) {
  const [surah, setSurah] = useState<SurahDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [isBookView, setIsBookView] = useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    getSurah(surahNumber)
      .then(data => {
        setSurah(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [surahNumber]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!surah) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Surah Not Found</CardTitle>
          <CardDescription>The requested Surah could not be loaded. Please try again.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
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
        <div className="flex items-center space-x-4 justify-end mb-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="book-view-toggle"
              checked={isBookView}
              onCheckedChange={setIsBookView}
            />
            <Label htmlFor="book-view-toggle" className="flex items-center gap-2 cursor-pointer">
              <Book className="w-4 h-4" />
              <span>Book View</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="translation-toggle"
              checked={showTranslation}
              onCheckedChange={setShowTranslation}
              disabled={isBookView}
            />
            <Label htmlFor="translation-toggle" className="flex items-center gap-2 cursor-pointer">
              <BookText className="w-4 h-4" />
              <span>Translation</span>
            </Label>
          </div>
        </div>
        <Separator className="mb-6" />

        {isBookView ? (
          <SurahBookView ayahs={surah.ayahs} />
        ) : (
          <AyahCard 
            ayahs={surah.ayahs} 
            surahNumber={surahNumber} 
            showTranslation={showTranslation} 
          />
        )}
      </CardContent>
    </Card>
  );
}
