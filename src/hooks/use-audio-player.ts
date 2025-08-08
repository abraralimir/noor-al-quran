
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAudioPlayerProps {
  src?: string;
  autoplay?: boolean;
  mediaMetadata?: Omit<MediaMetadataInit, 'artwork'>; // Artwork will be handled internally
  onEnded?: () => void;
}

const getAbsoluteUrl = (path: string) => {
  if (typeof window === 'undefined') {
    return path; // Cannot determine on the server
  }
  return new URL(path, window.location.origin).href;
};

export function useAudioPlayer({ src, autoplay = false, mediaMetadata, onEnded }: UseAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onEndedRef = useRef(onEnded);
  const autoplayRef = useRef(autoplay);
  const { toast } = useToast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  // Keep the onEnded callback ref up to date
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);
  
  useEffect(() => {
    autoplayRef.current = autoplay;
  }, [autoplay]);

  const setMediaSession = useCallback(() => {
    if ('mediaSession' in navigator && mediaMetadata) {
      const artworkUrl = getAbsoluteUrl('/book-1283468.jpg');
      navigator.mediaSession.metadata = new MediaMetadata({
        ...mediaMetadata,
        artwork: [
          { src: artworkUrl, sizes: '180x180', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' },
        ]
      });
    }
  }, [mediaMetadata]);

  const onPlay = () => {
    setIsPlaying(true);
    setMediaSession();
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }
  };

  const onPause = () => {
    setIsPlaying(false);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    if (onEndedRef.current) {
      onEndedRef.current();
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      if ('mediaSession' in navigator && isFinite(audioRef.current.duration)) {
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
    if (autoplayRef.current && audioRef.current?.paused) {
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

  const seek = useCallback((seconds: number) => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      const newTime = audioRef.current.currentTime + seconds;
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration, newTime));
    }
  }, []);
  
  useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    
    // Add listeners
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('error', onError);

    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => audioRef.current?.play());
        navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause());
        navigator.mediaSession.setActionHandler('seekbackward', () => seek(-10));
        navigator.mediaSession.setActionHandler('seekforward', () => seek(10));
        // Note: 'nexttrack' and 'previoustrack' would be handled by the component logic
    }
    
    return () => {
      // Clean up listeners
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('error', onError);

      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
      }
    }
  }, [seek, setMediaSession]);
  
  useEffect(() => {
    if (src && audioRef.current) {
      if (audioRef.current.src !== src) {
        setIsLoading(true);
        setIsPlaying(false);
        setProgress(0);
        setDuration(0);
        audioRef.current.src = src;
        audioRef.current.load();
        // After source change, if autoplay is intended, onCanPlay will handle it.
      } else if (!isPlaying && autoplayRef.current) {
        // If src is the same but we want to autoplay (e.g. re-adding the same song to queue)
        audioRef.current.play().catch(onError);
      }
    } else if (!src && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        setProgress(0);
        setDuration(0);
        setIsPlaying(false);
        setIsLoading(false);
    }
  }, [src, isPlaying]);

  useEffect(() => {
    // This effect ensures the metadata is updated if it changes
    setMediaSession();
  }, [mediaMetadata, setMediaSession]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
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
