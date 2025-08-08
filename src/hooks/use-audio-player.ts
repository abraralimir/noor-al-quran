'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAudioPlayerProps {
  src?: string;
  autoplay?: boolean;
  mediaMetadata?: MediaMetadataInit;
  onEnded?: () => void;
}

// Absolute path to the image in the /public directory
const artworkUrl = '/book-1920.jpg'; 

export function useAudioPlayer({ src, autoplay = false, mediaMetadata, onEnded }: UseAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onEndedRef = useRef(onEnded);
  const autoplayRef = useRef(autoplay);
  const { toast } = useToast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);
  
  useEffect(() => {
    autoplayRef.current = autoplay;
  }, [autoplay]);

  const setMediaSession = useCallback(() => {
    if ('mediaSession' in navigator && mediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata({
        ...mediaMetadata,
        artwork: [
          { src: artworkUrl, sizes: '1920x1280', type: 'image/jpeg' },
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
        const handlePlay = () => audioRef.current?.play().catch(onError);
        const handlePause = () => audioRef.current?.pause();
        const handleSeekBackward = () => seek(-10);
        const handleSeekForward = () => seek(10);
        
        navigator.mediaSession.setActionHandler('play', handlePlay);
        navigator.mediaSession.setActionHandler('pause', handlePause);
        navigator.mediaSession.setActionHandler('seekbackward', handleSeekBackward);
        navigator.mediaSession.setActionHandler('seekforward', handleSeekForward);
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
      } else if (!isPlaying && autoplayRef.current) {
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
