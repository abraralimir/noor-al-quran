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
  // Ensure Audio object is only created on the client
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

  // Player actions
  const play = useCallback(() => {
    if (audioRef.current?.src) {
      audioRef.current.play().catch(onError);
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      const newTime = audioRef.current.currentTime + seconds;
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration, newTime));
    }
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current && audioRef.current.src) {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      audioRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  // Event handlers
  const onError = useCallback(() => {
    setIsLoading(false);
    setIsPlaying(false);
    toast({
      variant: 'destructive',
      title: 'Audio Error',
      description: 'Could not load the audio. Please try another Surah or check your connection.',
    });
  }, [toast]);

  // Effect to initialize and manage audio element and its listeners
  useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const onPlay = () => {
      setIsPlaying(true);
      setMediaSession();
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    };

    const onPause = () => {
      setIsPlaying(false);
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      onEndedRef.current?.();
    };

    const onTimeUpdate = () => {
      if (audio.duration) { // only update if duration is available
          setProgress(audio.currentTime);
          if ('mediaSession' in navigator && isFinite(audio.duration)) {
            navigator.mediaSession.setPositionState?.({
              duration: audio.duration,
              playbackRate: audio.playbackRate,
              position: audio.currentTime,
            });
          }
      }
    };

    const onDurationChange = () => {
        if (isFinite(audio.duration)) {
            setDuration(audio.duration);
            setIsLoading(false);
        }
    };
    
    const onCanPlay = () => {
      setIsLoading(false);
      // This is the key: if autoplay is intended, and we can play, let's play.
      if (autoplayRef.current && audio.paused) {
        play();
      }
    };

    const onWaiting = () => setIsLoading(true);

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
        navigator.mediaSession.setActionHandler('play', play);
        navigator.mediaSession.setActionHandler('pause', pause);
        navigator.mediaSession.setActionHandler('seekbackward', () => seek(-10));
        navigator.mediaSession.setActionHandler('seekforward', () => seek(10));
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
  }, [seek, setMediaSession, onError, play, pause]);
  
  // Effect to handle source changes
  useEffect(() => {
    if (audioRef.current) {
        if (src) {
            if (audioRef.current.src !== src) {
              setIsLoading(true);
              audioRef.current.src = src;
              audioRef.current.load();
            }
        } else {
            pause();
            audioRef.current.removeAttribute('src');
            setProgress(0);
            setDuration(0);
            setIsPlaying(false);
            setIsLoading(false);
        }
    }
  }, [src, pause]);


  useEffect(() => {
    setMediaSession();
  }, [mediaMetadata, setMediaSession]);

  // Final cleanup on unmount
  useEffect(() => {
    return () => {
      pause();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
      }
    };
  }, [pause]);


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
