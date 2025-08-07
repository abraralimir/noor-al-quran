'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAudioPlayerProps {
  src?: string;
  autoplay?: boolean;
}

export function useAudioPlayer({ src, autoplay = false }: UseAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audioRef.current = null;
    }
  }, []);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleEnded = () => setIsPlaying(false);
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };
  const handleDurationChange = () => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };
  const handleCanPlay = () => {
    setIsLoading(false);
    if (autoplay) {
      audioRef.current?.play().catch(e => console.error("Autoplay failed", e));
    }
  };
  const handleWaiting = () => setIsLoading(true);
  const handleError = () => {
    setIsLoading(false);
    setIsPlaying(false);
    toast({
      variant: 'destructive',
      title: 'Audio Error',
      description: 'Could not load the audio. Please try another Surah or check your connection.',
    });
  };

  useEffect(() => {
    // Only run effect if src is provided
    if (src) {
      // Cleanup previous audio element if it exists
      if (audioRef.current) {
        cleanup();
      }
      
      const audio = new Audio(src);
      audioRef.current = audio;
      setIsLoading(true);
      setIsPlaying(false);
      setProgress(0);
      setDuration(0);

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('durationchange', handleDurationChange);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('waiting', handleWaiting);
      audio.addEventListener('error', handleError);
      
      audio.load();
    }

    return () => {
      if (src) {
        cleanup();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, autoplay]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Play failed", e));
      }
    }
  };

  const seek = (seconds: number) => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      const newTime = audioRef.current.currentTime + seconds;
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration, newTime));
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time) || time < 0) {
      return '0:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return { isPlaying, isLoading, duration, progress, togglePlayPause, seek, handleSliderChange, formatTime };
}
