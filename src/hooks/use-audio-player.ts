
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAudioPlayerProps {
  src?: string;
  autoplay?: boolean;
  mediaMetadata?: MediaMetadataInit;
  onEnded?: () => void;
}

// Ensure Audio object is only created on the client-side
let audio: HTMLAudioElement | null = null;
if (typeof window !== 'undefined') {
  audio = new Audio();
}

const artworkUrl = '/book-1920.jpg';

export function useAudioPlayer({ src, autoplay = false, mediaMetadata, onEnded }: UseAudioPlayerProps) {
  const { toast } = useToast();
  
  // Use a ref to ensure the onEnded callback is always up-to-date in the event listeners.
  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLive, setIsLive] = useState(false);
  
  // Encapsulate media session logic.
  const setMediaSession = useCallback((metadata?: MediaMetadataInit) => {
    if ('mediaSession' in navigator && metadata) {
      navigator.mediaSession.metadata = new MediaMetadata({
        ...metadata,
        artwork: [{ src: artworkUrl, sizes: '1920x1280', type: 'image/jpeg' }],
      });
    }
  }, []);

  const play = useCallback(() => {
    if (!audio) return;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error("Audio play failed:", error);
        setIsPlaying(false);
        setIsLoading(false);
      });
    }
  }, []);

  const pause = useCallback(() => {
    if (audio) audio.pause();
  }, []);

  // Set up media session action handlers once.
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const seekAction = (details: MediaSessionActionDetails) => {
      if (!audio) return;
      const skipTime = details.seekOffset || (details.action === 'seekbackward' ? -10 : 10);
      audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + skipTime));
    };

    navigator.mediaSession.setActionHandler('play', play);
    navigator.mediaSession.setActionHandler('pause', pause);

    if (!isLive) {
      navigator.mediaSession.setActionHandler('seekbackward', seekAction);
      navigator.mediaSession.setActionHandler('seekforward', seekAction);
    } else {
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
    }
    
    // Clean up handlers when the component unmounts or `isLive` changes.
    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
    }
  }, [play, pause, isLive]);

  // Main effect for audio event listeners.
  useEffect(() => {
    if (!audio) return;

    const onPlay = () => {
        setIsPlaying(true);
        setIsLoading(false);
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    };
    const onPause = () => {
        setIsPlaying(false);
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    };
    const onEndedHandler = () => onEndedRef.current?.();
    const onTimeUpdate = () => {
        if (!isLive) setProgress(audio!.currentTime);
    };
    const onDurationChange = () => {
        const audioDuration = audio!.duration;
        const isLiveStream = !isFinite(audioDuration);
        setIsLive(isLiveStream);
        setDuration(isLiveStream ? 0 : audioDuration);
    };
    const onWaiting = () => setIsLoading(true);
    const onLoadedData = () => setIsLoading(false);
    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      toast({
        variant: 'destructive',
        title: 'Audio Error',
        description: 'The audio could not be loaded. It may be an issue with the stream or your connection.',
      });
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEndedHandler);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('loadeddata', onLoadedData);
    audio.addEventListener('canplay', onLoadedData);
    audio.addEventListener('error', onError);

    return () => {
      audio!.removeEventListener('play', onPlay);
      audio!.removeEventListener('pause', onPause);
      audio!.removeEventListener('ended', onEndedHandler);
      audio!.removeEventListener('timeupdate', onTimeUpdate);
      audio!.removeEventListener('durationchange', onDurationChange);
      audio!.removeEventListener('waiting', onWaiting);
      audio!.removeEventListener('loadeddata', onLoadedData);
      audio!.removeEventListener('canplay', onLoadedData);
      audio!.removeEventListener('error', onError);
    };
  }, [isLive, toast]);

  // Effect to handle source changes.
  useEffect(() => {
    if (!audio) return;
    
    // When the component unmounts, pause and clean up the audio src.
    const cleanup = () => {
      pause();
      if (audio) {
        audio.src = '';
        audio.removeAttribute('src');
        audio.load();
      }
    };

    if (src) {
      if (audio.src !== src) {
        setIsLoading(true);
        setProgress(0);
        audio.src = src;
        audio.load();
        setMediaSession(mediaMetadata);
        if (autoplay) {
          play();
        }
      }
    } else {
       cleanup();
    }
    
    return () => {
        if(src) cleanup(); // only cleanup if a src was playing
    }
  // We only want to re-run this when the src, autoplay or metadata changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, autoplay, mediaMetadata, play, pause, setMediaSession]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((seconds: number) => {
    if (audio && !isLive) {
      audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
    }
  }, [audio, duration, isLive]);

  const handleSliderChange = (value: number[]) => {
    if (audio && !isLive) {
      audio.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const formatTime = (time: number) => {
    if (isLive) return 'Live';
    if (isNaN(time) || !isFinite(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return { isPlaying, isLoading, duration, progress, togglePlayPause, seek, handleSliderChange, formatTime, isLive };
}
