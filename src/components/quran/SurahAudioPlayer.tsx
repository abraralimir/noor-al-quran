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
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time) || time < 0) {
      return '0:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const playAudio = useCallback(() => {
    if (audioRef.current && audioRef.current.readyState >= 3) {
      audioRef.current.play().catch(e => {
        console.error("Play failed", e);
        toast({
          variant: "destructive",
          title: "Playback Error",
          description: "Could not play audio.",
        });
      });
    }
  }, [toast]);
  
  // Effect to initialize the audio player and set up listeners
  useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleDurationChange = () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleCanPlay = () => {
        setIsLoading(false);
        if (isPlaying) {
            playAudio();
        }
    };
    const handleWaiting = () => setIsLoading(true);
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    const handleError = (e: Event) => {
      setIsLoading(false);
      setIsPlaying(false);
      setProgress(0);
      setDuration(0);
      toast({
        variant: "destructive",
        title: "Audio Error",
        description: "Could not load the audio. Please try another Surah or check your connection.",
      });
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // Set initial Surah
    const initialSurah = surahs.find(s => s.number.toString() === initialSurahNumber) || surahs[0];
    if (initialSurah) {
        setSelectedSurah(initialSurah);
    }
    
    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahs, toast]);

  // Effect to handle changing the audio source when a new Surah is selected
  useEffect(() => {
    if (selectedSurah && audioRef.current) {
      const audio = audioRef.current;
      const currentSrc = getSurahAudioUrl(selectedSurah.number);
      
      if (audio.src !== currentSrc) {
        setIsLoading(true);
        setIsPlaying(false);
        setProgress(0);
        setDuration(0);
        audio.src = currentSrc;
        audio.load();
        
        const shouldAutoPlay = selectedSurah.number.toString() === initialSurahNumber;
        if(shouldAutoPlay){
           playAudio();
        }
      }
    }
  }, [selectedSurah, initialSurahNumber, playAudio]);

  const handleSelectSurah = (surahNumber: string) => {
    const surah = surahs.find(s => s.number.toString() === surahNumber);
    if (surah) {
      setSelectedSurah(surah);
      // When user manually selects a surah, we should attempt to play it.
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || isLoading) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      playAudio();
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
          <Button variant="ghost" size="icon" onClick={() => seek(-10)} aria-label="Rewind 10 seconds" disabled={!selectedSurah || isLoading}>
            <Rewind className="h-6 w-6" />
          </Button>
          <Button variant="default" size="icon" className="h-16 w-16 rounded-full" onClick={togglePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'} disabled={!selectedSurah || isLoading}>
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
