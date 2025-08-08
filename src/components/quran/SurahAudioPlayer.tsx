
'use client';
import type { Surah } from '@/types/quran';
import { useState, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Play, Pause, Rewind, FastForward, LoaderCircle, SkipBack, SkipForward } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { getSurahAudioUrl } from '@/lib/quran-api';
import { useAudioPlayer } from '@/hooks/use-audio-player';

interface SurahAudioPlayerProps {
  surahs: Surah[];
  initialSurahNumber?: string;
}

export function SurahAudioPlayer({ surahs, initialSurahNumber }: SurahAudioPlayerProps) {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);

  const handleNextSurah = useCallback(() => {
    if (!selectedSurah || surahs.length === 0) return;
    const currentIndex = surahs.findIndex(s => s.number === selectedSurah.number);
    const nextIndex = (currentIndex + 1) % surahs.length; // Loop back to the start
    setSelectedSurah(surahs[nextIndex]);
  }, [selectedSurah, surahs]);

  useEffect(() => {
    if (surahs.length > 0) {
      const initialSurah = surahs.find(s => s.number.toString() === initialSurahNumber) || surahs[0];
      setSelectedSurah(initialSurah);
    }
  }, [surahs, initialSurahNumber]);

  const audioUrl = selectedSurah ? getSurahAudioUrl(selectedSurah.number) : undefined;
  
  const { 
    isPlaying, 
    isLoading, 
    progress, 
    duration, 
    togglePlayPause, 
    seek, 
    handleSliderChange,
    formatTime 
  } = useAudioPlayer({ 
    src: audioUrl,
    onEnded: handleNextSurah, // Autoplay next surah
    mediaMetadata: selectedSurah ? {
        title: `Surah ${selectedSurah.englishName}`,
        artist: 'Mishary Rashid Alafasy',
        album: 'Noor Al Quran',
        artwork: [{ src: '/book-1283468.jpg', type: 'image/jpeg', sizes: '512x512' }]
    } : undefined,
    autoplay: !!initialSurahNumber 
  });

  const handleSelectSurah = (surahNumber: string) => {
    const surah = surahs.find(s => s.number.toString() === surahNumber);
    if (surah) {
      setSelectedSurah(surah);
    }
  };

  const handlePreviousSurah = () => {
    if (!selectedSurah || surahs.length === 0) return;
    const currentIndex = surahs.findIndex(s => s.number === selectedSurah.number);
    const prevIndex = (currentIndex - 1 + surahs.length) % surahs.length; // Loop to the end
    setSelectedSurah(surahs[prevIndex]);
  };


  return (
    <div className="space-y-6">
      <Select onValueChange={handleSelectSurah} value={selectedSurah?.number.toString()} defaultValue={selectedSurah?.number.toString()}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a Surah" />
        </SelectTrigger>
        <SelectContent>
          {surahs.map(surah => (
            <SelectItem key={surah.number} value={surah.number.toString()}>
              {surah.number}. {surah.englishName} ({surah.name})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-col items-center space-y-4 p-6 rounded-lg bg-muted">
        <div className="text-center">
          <p className="text-2xl font-headline font-bold">{selectedSurah?.englishName}</p>
          <p className="text-xl font-arabic text-primary">{selectedSurah?.name}</p>
        </div>
        
        <div className="w-full space-y-2">
            <Slider
                value={[progress]}
                max={duration || 100}
                onValueChange={handleSliderChange}
                disabled={!selectedSurah || isLoading || !isFinite(duration)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
            </div>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
           <Button variant="ghost" size="icon" onClick={handlePreviousSurah} aria-label="Previous Surah" disabled={!selectedSurah || isLoading}>
            <SkipBack className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => seek(-10)} aria-label="Rewind 10 seconds" disabled={!selectedSurah || isLoading}>
            <Rewind className="h-6 w-6" />
          </Button>
          <Button variant="default" size="icon" className="h-16 w-16 rounded-full" onClick={togglePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'} disabled={!selectedSurah || isLoading}>
            {isLoading ? <LoaderCircle className="h-8 w-8 animate-spin" /> : (isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />)}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => seek(10)} aria-label="Fast-forward 10 seconds" disabled={!selectedSurah || isLoading}>
            <FastForward className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextSurah} aria-label="Next Surah" disabled={!selectedSurah || isLoading}>
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
