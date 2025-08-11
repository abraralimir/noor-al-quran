
'use client';

import { useState, useEffect, useRef } from 'react';
import type { SurahDetails, Ayah } from '@/types/quran';
import { AyahCard } from './AyahCard';
import { SurahBookView } from './SurahBookView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '../ui/button';
import { useTranslation } from '@/hooks/use-translation';

interface SurahDisplayProps {
  surah: SurahDetails;
}

export function SurahDisplay({ surah }: SurahDisplayProps) {
  const [isBookView, setIsBookView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Reset book view if surah changes
  useEffect(() => {
    setIsBookView(false);
  }, [surah]);

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      setIsBookView(false);
    }
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleBookView = async () => {
    const element = containerRef.current;
    if (!element) return;

    if (!isBookView) {
        try {
            if (element.requestFullscreen) {
                await element.requestFullscreen();
            }
            setIsBookView(true);
        } catch (err) {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            setIsBookView(true); 
        }
    } else {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        }
        setIsBookView(false);
    }
  };

  const pagesMap = surah.ayahs.reduce((acc, ayah) => {
    const pageNumber = ayah.page;
    if (!acc[pageNumber]) {
      acc[pageNumber] = [];
    }
    acc[pageNumber].push(ayah);
    return acc;
  }, {} as Record<number, Ayah[]>);

  return (
    <div ref={containerRef} className="w-full h-full bg-background">
      {isBookView ? (
        <SurahBookView 
          ayahs={surah.ayahs} 
          surahName={surah.englishName}
          onExit={toggleBookView}
          pages={pagesMap}
        />
      ) : (
        <div className="space-y-8">
            <div className="flex items-center space-x-4 justify-end">
                <Button variant="outline" onClick={toggleBookView}>
                    <BookText className="w-4 h-4 mr-2" />
                    {t('bookView')}
                </Button>
            </div>
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
                  showTranslation={true} 
                />
              </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
