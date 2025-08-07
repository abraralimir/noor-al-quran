'use client';
import type { Surah } from '@/types/quran';
import { useState, useRef, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Play, Pause, Rewind, FastForward } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { getSurahAudioUrl } from '@/lib/quran-api';

interface SurahAudioPlayerProps {
  surahs: Surah[];
  initialSurahNumber?: string;
}

export function SurahAudioPlayer({ surahs, initialSurahNumber }: SurahAudioPlayerProps) {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(() => {
    if (initialSurahNumber) {
        return surahs.find(s => s.number === Number(initialSurahNumber)) ?? surahs[0];
    }
    return surahs[0];
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();

      const audio = audioRef.current;
      const setAudioData = () => {
        setDuration(audio.duration);
      };
      const setAudioTime = () => {
        setProgress(audio.currentTime);
      };
      const onEnded = () => setIsPlaying(false);

      audio.addEventListener('loadeddata', setAudioData);
      audio.addEventListener('timeupdate', setAudioTime);
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', (e) => {
          console.error('Audio Error:', e);
          setIsPlaying(false);
      });

      return () => {
        audio.removeEventListener('loadeddata', setAudioData);
        audio.removeEventListener('timeupdate', setAudioTime);
        audio.removeEventListener('ended', onEnded);
        audio.pause();
        audio.src = '';
      };
    }
  }, []);

  useEffect(() => {
    if (selectedSurah && audioRef.current) {
        audioRef.current.src = getSurahAudioUrl(selectedSurah.number);
        audioRef.current.load(); // Explicitly load the new source
        setIsPlaying(false);
        setProgress(0);

        if (initialSurahNumber) {
            // Auto-play if navigated from search
            const playPromise = audioRef.current.play();
            if(playPromise !== undefined){
                playPromise.then(() => {
                    setIsPlaying(true);
                }).catch(error => {
                    console.error("Autoplay failed", error);
                    setIsPlaying(false); // Ensure state is correct if autoplay is blocked
                });
            }
        }
    }
  }, [selectedSurah, initialSurahNumber]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => console.error("Audio play error", error));
        }
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleSelectSurah = (surahNumber: string) => {
    const surah = surahs.find(s => s.number.toString() === surahNumber);
    if (surah) {
      setSelectedSurah(surah);
    }
  }

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const seek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) {
        return '0:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="space-y-6">
      <Select onValueChange={handleSelectSurah} defaultValue={selectedSurah?.number.toString()}>
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
                disabled={!selectedSurah}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
            </div>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => seek(-10)} aria-label="Rewind 10 seconds" disabled={!selectedSurah}>
            <Rewind className="h-6 w-6" />
          </Button>
          <Button variant="default" size="icon" className="h-16 w-16 rounded-full" onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'} disabled={!selectedSurah}>
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => seek(10)} aria-label="Fast-forward 10 seconds" disabled={!selectedSurah}>
            <FastForward className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
