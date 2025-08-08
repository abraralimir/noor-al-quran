
'use client';

import { useState } from 'react';
import type { SurahDetails } from '@/types/quran';
import { AyahCard } from './AyahCard';
import { SurahBookView } from './SurahBookView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BookText, Book } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getSurah } from '@/lib/quran-api';
import React from 'react';
import { Skeleton } from '../ui/skeleton';

interface SurahDisplayProps {
  surahNumber: number;
}

function SurahDisplaySkeleton() {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-6">
            <Skeleton className="h-8 w-56" />
          </div>
          <Separator className="mb-6" />
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-4 py-4 border-b border-border last:border-b-0">
                <div className="flex justify-between items-start gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-grow space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-3/4" />
                  </div>
                </div>
                <div className="pl-12">
                   <Skeleton className="h-6 w-full" />
                   <Skeleton className="h-6 w-1/2 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
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
    return <SurahDisplaySkeleton />;
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
    <div className="w-full">
      <div className="flex items-center space-x-4 justify-end mb-4 pr-4">
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
        {!isBookView && (
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
        )}
      </div>

      {isBookView ? (
        <SurahBookView ayahs={surah.ayahs} surahName={surah.englishName} />
      ) : (
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
              surahNumber={surahNumber} 
              showTranslation={showTranslation} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
