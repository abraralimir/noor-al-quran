
'use client';

import { useState, useEffect } from 'react';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { LoaderCircle, Pause, Play, Rewind, FastForward } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface TafseerPlayerProps {
  surahName: string;
  tafseerName: string;
  audioUrl?: string;
  initialLanguage: 'en' | 'ur';
  onLanguageChange: (lang: 'en' | 'ur') => void;
}

export function TafseerPlayer({ surahName, tafseerName, audioUrl, initialLanguage, onLanguageChange }: TafseerPlayerProps) {
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ur'>(initialLanguage);

  const { 
    isPlaying, 
    isLoading, 
    progress, 
    duration, 
    togglePlayPause, 
    seek, 
    handleSliderChange,
    formatTime,
    src
  } = useAudioPlayer();

  const handleTogglePlay = () => {
    if (audioUrl) {
      togglePlayPause(audioUrl, {
        title: `Tafseer of ${surahName}`,
        artist: currentLanguage === 'ur' ? 'Dr. Israr Ahmed' : 'Mufti Abu Layth',
        album: 'Noor Al Quran'
      });
    }
  };

  useEffect(() => {
    if(audioUrl && src !== audioUrl) {
        // If a different audio is playing, just update the src, but don't autoplay
    }
  }, [audioUrl, src])

  const handleLangChange = (lang: 'en' | 'ur') => {
    if (lang !== currentLanguage) {
      setCurrentLanguage(lang);
      onLanguageChange(lang);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 rounded-lg bg-muted">
      <div className="text-center h-16">
        <p className="text-2xl font-headline font-bold">{surahName}</p>
        <p className="text-md text-primary">{tafseerName}</p>
      </div>

      <RadioGroup
        defaultValue={currentLanguage}
        onValueChange={(value: 'en' | 'ur') => handleLangChange(value)}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="en" id="en" />
          <Label htmlFor="en">English</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="ur" id="ur" />
          <Label htmlFor="ur">Urdu (Dr. Israr Ahmed)</Label>
        </div>
      </RadioGroup>
      
      <div className="w-full space-y-2">
          <Slider
              value={[progress]}
              max={duration || 100}
              onValueChange={handleSliderChange}
              disabled={!audioUrl || isLoading || !isFinite(duration)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
          </div>
      </div>
      
      <div className="flex items-center justify-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => seek(-10)} aria-label={t('rewind10Seconds')} disabled={!audioUrl || isLoading}>
          <Rewind className="h-6 w-6" />
        </Button>
        <Button variant="default" size="icon" className="h-16 w-16 rounded-full" onClick={handleTogglePlay} aria-label={isPlaying ? t('pause') : t('play')} disabled={!audioUrl || isLoading}>
          {isLoading && src === audioUrl ? <LoaderCircle className="h-8 w-8 animate-spin" /> : (isPlaying && src === audioUrl ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />)}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => seek(10)} aria-label={t('fastForward10Seconds')} disabled={!audioUrl || isLoading}>
          <FastForward className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
