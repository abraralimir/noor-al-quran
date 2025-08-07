'use client';
import type { Surah } from '@/types/quran';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Play, Pause, Rewind, FastForward, LoaderCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { getSurahAudioUrl } from '@/lib/quran-api';
import { useToast } from '@/hooks/use-toast';

interface SurahAudioPlayerProps {
  surahs: Surah[];
  initialSurahNumber?: string;
}

export function SurahAudioPlayer({ surahs, initialSurahNumber }: SurahAudioPlayerProps) {
  const { toast } = useToast();
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(() => {
    if (initialSurahNumber) {
        return surahs.find(s => s.number === Number(initialSurahNumber)) ?? surahs[0];
    }
    return surahs[0];
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);

  // Effect to manage audio element lifecycle
  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;
    
    const handleCanPlay = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      if (isPlayingRef.current) {
        audio.play().catch(e => {
            console.error("Play failed in handleCanPlay", e);
            setIsPlaying(false);
            isPlayingRef.current = false;
        });
      }
    };
    
    const handleWaiting = () => setIsLoading(true);
    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleEnded = () => {
        setIsPlaying(false);
        isPlayingRef.current = false;
        setProgress(0);
    };
    const handleError = () => {
        setIsLoading(false);
        setIsPlaying(false);
        isPlayingRef.current = false;
        toast({
            variant: "destructive",
            title: "Audio Error",
            description: "Could not load the audio for this Surah. Please try another one.",
        });
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // Cleanup
    return () => {
        audio.pause();
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('waiting', handleWaiting);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.src = '';
    };
  }, [toast]);

  useEffect(() => {
    if (selectedSurah && audioRef.current) {
      const audio = audioRef.current;
      const newSrc = getSurahAudioUrl(selectedSurah.number);
      if (audio.src !== newSrc) {
        audio.pause();
        setProgress(0);
        setDuration(0);
        setIsLoading(true);
        isPlayingRef.current = false; // Stop playback on source change
        audio.src = newSrc;
        audio.load();

        if (initialSurahNumber && selectedSurah.number.toString() === initialSurahNumber) {
           isPlayingRef.current = true; // Intent to play
        }
      }
    }
  }, [selectedSurah, initialSurahNumber]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      isPlayingRef.current = false;
    } else {
      audioRef.current.play().catch(e => console.error("Play failed", e));
      isPlayingRef.current = true;
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleSelectSurah = (surahNumber: string) => {
    const surah = surahs.find(s => s.number.toString() === surahNumber);
    if (surah) {
        if(audioRef.current && isPlaying){
            audioRef.current.pause();
            setIsPlaying(false);
            isPlayingRef.current = false;
        }
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
    if (isNaN(time) || time === Infinity || !time) {
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
                disabled={!selectedSurah || !duration || isLoading}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
            </div>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => seek(-10)} aria-label="Rewind 10 seconds" disabled={!selectedSurah || !duration}>
            <Rewind className="h-6 w-6" />
          </Button>
          <Button variant="default" size="icon" className="h-16 w-16 rounded-full" onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'} disabled={!selectedSurah || isLoading}>
            {isLoading ? <LoaderCircle className="h-8 w-8 animate-spin" /> : (isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />)}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => seek(10)} aria-label="Fast-forward 10 seconds" disabled={!selectedSurah || !duration}>
            <FastForward className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
