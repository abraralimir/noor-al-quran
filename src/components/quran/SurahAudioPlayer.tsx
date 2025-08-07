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

  const setupAudio = useCallback(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio();
        const audio = audioRef.current;

        const onTimeUpdate = () => setProgress(audio.currentTime);
        const onDurationChange = () => {
            if (isFinite(audio.duration)) {
                setDuration(audio.duration);
            }
        };
        const onCanPlay = () => setIsLoading(false);
        const onWaiting = () => setIsLoading(true);
        const onEnded = () => setIsPlaying(false);
        const onError = () => {
            setIsLoading(false);
            setIsPlaying(false);
            toast({
                variant: "destructive",
                title: "Audio Error",
                description: "Could not load the audio. Please try another Surah.",
            });
        };
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('durationchange', onDurationChange);
        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('waiting', onWaiting);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
    }
  }, [toast]);


  useEffect(() => {
    setupAudio();
    const audio = audioRef.current;
    
    return () => {
        if (audio) {
            audio.pause();
            audio.src = '';
            // Remove all listeners by replacing the element
            audio.replaceWith(audio.cloneNode(true));
            audioRef.current = null;
        }
    };
  }, [setupAudio]);


  useEffect(() => {
    if (selectedSurah && audioRef.current) {
        setIsLoading(true);
        setIsPlaying(false);
        setProgress(0);
        setDuration(0);
        audioRef.current.src = getSurahAudioUrl(selectedSurah.number);
        audioRef.current.load();
    }
  }, [selectedSurah]);


  useEffect(() => {
    if (initialSurahNumber && audioRef.current && selectedSurah?.number.toString() === initialSurahNumber) {
        const audio = audioRef.current;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
             console.error("Auto-play failed:", error);
          });
        }
    }
  }, [initialSurahNumber, selectedSurah]);

  const handleSelectSurah = (surahNumber: string) => {
    const surah = surahs.find(s => s.number.toString() === surahNumber);
    if (surah) {
        setSelectedSurah(surah);
    }
  }

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
       if(!audioRef.current.src) {
           if(selectedSurah) {
              audioRef.current.src = getSurahAudioUrl(selectedSurah.number);
              audioRef.current.load();
           } else {
               toast({ variant: "destructive", title: "No Surah Selected", description: "Please select a surah to play."});
               return;
           }
       }

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
            console.error("Play failed", e);
            toast({
                variant: "destructive",
                title: "Playback Error",
                description: "Could not play the audio file.",
            });
            setIsPlaying(false);
        });
      }
    }
  };
  
  const handleSliderChange = (value: number[]) => {
     if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const seek = (seconds: number) => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration, audioRef.current.currentTime + seconds));
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time) || time === 0) {
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
                disabled={!selectedSurah || isLoading || !isFinite(duration)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
            </div>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => seek(-10)} aria-label="Rewind 10 seconds" disabled={!selectedSurah || isLoading}>
            <Rewind className="h-6 w-6" />
          </Button>
          <Button variant="default" size="icon" className="h-16 w-16 rounded-full" onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'} disabled={!selectedSurah || isLoading}>
            {isLoading ? <LoaderCircle className="h-8 w-8 animate-spin" /> : (isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />)}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => seek(10)} aria-label="Fast-forward 10 seconds" disabled={!selectedSurah || isLoading}>
            <FastForward className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
