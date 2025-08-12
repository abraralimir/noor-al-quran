
'use client';

import type { Ayah } from '@/types/quran';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import React from 'react';
import { Button } from '../ui/button';
import { Play } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/use-audio-player';

interface AyahCardProps {
  ayah: Ayah;
  surahNumber: number;
}

export function AyahCard({ ayah, surahNumber }: AyahCardProps) {
  const { language } = useLanguage();
  
  const { togglePlayPause, isPlaying } = useAudioPlayer({
      src: ayah.audio,
      mediaMetadata: {
          title: `Surah ${surahNumber}, Ayah ${ayah.numberInSurah}`,
          artist: 'Abdur-Rahman as-Sudais'
      }
  });

  return (
    <div className="space-y-4 p-4 rounded-lg border bg-card">
      <div className="flex justify-between items-center">
        <Button size="icon" variant="ghost" onClick={togglePlayPause}>
            <Play className={cn("h-5 w-5", isPlaying && "text-primary fill-primary")} />
        </Button>
        <p dir="rtl" className="text-2xl lg:text-3xl font-arabic leading-loose text-right text-foreground">
            {ayah.text}
            <span className="text-xl font-mono text-accent bg-accent/10 rounded-full w-8 h-8 inline-flex items-center justify-center mx-2 align-middle">
                {ayah.numberInSurah}
            </span>
        </p>
      </div>
      
      <div className="border-t pt-4 mt-4">
         <p 
            className={cn("text-muted-foreground", language === 'ur' ? 'text-right font-urdu' : 'text-left')}
            dir={language === 'ur' ? 'rtl' : 'ltr'}
         >
            {ayah.translation}
         </p>
      </div>

    </div>
  );
}
