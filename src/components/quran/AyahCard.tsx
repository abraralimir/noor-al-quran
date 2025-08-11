'use client';

import { useState, useRef, useEffect } from 'react';
import type { Ayah } from '@/types/quran';
import { getAyahAudioUrl } from '@/lib/quran-api';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface AyahCardProps {
  ayahs: Ayah[];
  surahNumber: number;
  showTranslation: boolean;
}

export function AyahCard({ ayahs, surahNumber, showTranslation }: AyahCardProps) {
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { language } = useLanguage();

  const handlePlay = (ayahNumber: number) => {
    const uniqueAyahKey = ayahNumber;

    if (playingAyah === uniqueAyahKey) {
      audioRef.current?.pause();
      setPlayingAyah(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = getAyahAudioUrl(ayahNumber);
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
        setPlayingAyah(uniqueAyahKey);
      }
    }
  };

  useEffect(() => {
    const newAudio = new Audio();
    audioRef.current = newAudio;

    const handleEnded = () => setPlayingAyah(null);
    newAudio.addEventListener('ended', handleEnded);

    return () => {
      newAudio.removeEventListener('ended', handleEnded);
      newAudio.pause();
    };
  }, []);

  return (
    <div className="space-y-6">
      {ayahs.map((ayah) => (
        <div key={ayah.number} className="space-y-4 py-4 border-b border-border last:border-b-0">
          <div className="flex justify-between items-start gap-4">
            <span className="text-sm font-mono text-accent bg-accent/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              {ayah.numberInSurah}
            </span>
            <p dir="rtl" className="text-3xl lg:text-4xl font-arabic leading-relaxed text-right flex-grow">
              {ayah.text}
            </p>
          </div>

          {showTranslation && (
            <p className={cn("text-muted-foreground pl-12", language === 'ur' ? 'text-right font-urdu' : '')}
               dir={language === 'ur' ? 'rtl' : 'ltr'}>
              {ayah.translation}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePlay(ayah.number)}
              className="text-accent hover:text-accent hover:bg-accent/10"
              aria-label={playingAyah === ayah.number ? "Pause recitation" : "Play recitation"}
            >
              {playingAyah === ayah.number ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
