'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAudioPlayerProps {
  src?: string;
  autoplay?: boolean;
  mediaMetadata?: MediaMetadataInit;
}

export function useAudioPlayer({ src, autoplay = false, mediaMetadata }: UseAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const setupAudio = useCallback(() => {
    if (audioRef.current) {
        // Clean up existing listeners before adding new ones
        const audio = audioRef.current;
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('durationchange', onDurationChange);
        audio.removeEventListener('canplay', onCanPlay);
        audio.removeEventListener('waiting', onWaiting);
        audio.removeEventListener('error', onError);

        // Add new listeners
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('durationchange', onDurationChange);
        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('waiting', onWaiting);
        audio.addEventListener('error', onError);
    }
  }, []);

  const onPlay = () => {
    setIsPlaying(true);
    if ('mediaSession' in navigator && mediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata(mediaMetadata);
      navigator.mediaSession.playbackState = 'playing';
    }
  };
  const onPause = () => {
    setIsPlaying(false);
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
    }
  };
  const onEnded = () => setIsPlaying(false);
  const onTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setPositionState?.({
            duration: audioRef.current.duration,
            playbackRate: audioRef.current.playbackRate,
            position: audioRef.current.currentTime,
        });
      }
    }
  };
  const onDurationChange = () => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };
  const onCanPlay = () => {
    setIsLoading(false);
    if (autoplay && audioRef.current) {
      audioRef.current.play().catch(onError);
    }
  };
  const onWaiting = () => setIsLoading(true);
  const onError = () => {
    setIsLoading(false);
    setIsPlaying(false);
    toast({
      variant: 'destructive',
      title: 'Audio Error',
      description: 'Could not load the audio. Please try another Surah or check your connection.',
    });
  };
  
  useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio();
    }
    setupAudio();
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => audioRef.current?.play());
        navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause());
        navigator.mediaSession.setActionHandler('seekbackward', () => seek(-10));
        navigator.mediaSession.setActionHandler('seekforward', () => seek(10));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if (src && audioRef.current) {
      if (audioRef.current.src !== src) {
        setIsLoading(true);
        setIsPlaying(false);
        setProgress(0);
        setDuration(0);
        audioRef.current.src = src;
        audioRef.current.load();
      }
    } else if (!src && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
    }
  }, [src]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
      }
    };
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current && audioRef.current.src) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(onError);
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
    if (audioRef.current && isFinite(audioRef.current.duration)) {
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
