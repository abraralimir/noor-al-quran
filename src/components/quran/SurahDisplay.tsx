
'use client';

import { useState, useEffect, useRef } from 'react';
import type { SurahDetails } from '@/types/quran';
import { AyahCard } from './AyahCard';
import { SurahBookView } from './SurahBookView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getSurah } from '@/lib/quran-api';
import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';


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
  const containerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setIsLoading(true);
    getSurah(surahNumber)
      .then(data => {
        setSurah(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [surahNumber]);


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
        if (element.requestFullscreen) {
            await element.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
              // Still enter book view even if fullscreen fails
              setIsBookView(true);
            });
        }
        setIsBookView(true);
    } else {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        }
        setIsBookView(false);
    }
  };

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
    <div ref={containerRef} className="w-full h-full bg-background">
      {isBookView ? (
        <SurahBookView 
          ayahs={surah.ayahs} 
          surahName={surah.englishName}
          onExit={toggleBookView}
        />
      ) : (
        <div className="space-y-8">
            <div className="flex items-center space-x-4 justify-end">
                <Button variant="outline" onClick={toggleBookView}>
                    <BookText className="w-4 h-4 mr-2" />
                    Book View
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
                  surahNumber={surahNumber} 
                  showTranslation={showTranslation} 
                />
              </CardContent>
            </Card>

        </div>
      )}
    </div>
  );
}
