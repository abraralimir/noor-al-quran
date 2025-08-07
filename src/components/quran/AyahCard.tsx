'use client';

import { useState, useRef, useEffect, type RefObject } from 'react';
import type { Ayah } from '@/types/quran';
import { getAyahAudioUrl } from '@/lib/quran-api';
import { Button } from '@/components/ui/button';
import { Play, Pause, BookText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface AyahCardProps {
  ayahs: Ayah[];
  surahNumber: number;
}

export function AyahCard({ ayahs, surahNumber }: AyahCardProps) {
  const [showTranslation, setShowTranslation] = useState(true);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = (ayahNumberInSurah: number) => {
    // We use ayah number in surah for the key to track playing state
    const uniqueAyahKey = ayahNumberInSurah;

    if (playingAyah === uniqueAyahKey) {
      audioRef.current?.pause();
      setPlayingAyah(null);
    } else {
      if (audioRef.current) {
        // The API needs surah number and ayah number in surah
        audioRef.current.src = getAyahAudioUrl(ayahNumberInSurah, surahNumber);
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
      <div className="flex items-center space-x-2 justify-end">
        <Switch
          id="translation-toggle"
          checked={showTranslation}
          onCheckedChange={setShowTranslation}
        />
        <Label htmlFor="translation-toggle" className="flex items-center gap-2 cursor-pointer">
          <BookText className="w-4 h-4" />
          <span>English Translation</span>
        </Label>
      </div>
      <Separator />
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
            <p className="text-muted-foreground pl-12">
              {ayah.translation}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePlay(ayah.numberInSurah)}
              className="text-accent hover:text-accent hover:bg-accent/10"
              aria-label={playingAyah === ayah.numberInSurah ? "Pause recitation" : "Play recitation"}
            >
              {playingAyah === ayah.numberInSurah ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
