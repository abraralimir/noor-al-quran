
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAudioPlayerProps {
  onEnded?: () => void;
}

// Global state for the single audio instance
let audio: HTMLAudioElement | null = null;
let currentSrc: string | null = null;
const listeners = new Set<() => void>();

const getAudioInstance = () => {
  if (typeof window !== 'undefined' && !audio) {
    audio = new Audio();
  }
  return audio;
};

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

const artworkUrl = '/book-1920.jpg';

// This is the new global state that will be shared across all components using the hook
let globalState = {
  src: '',
  isPlaying: false,
  isLoading: false,
  duration: 0,
  progress: 0,
  isLive: false,
};

const setGlobalState = (newState: Partial<typeof globalState>) => {
  globalState = { ...globalState, ...newState };
  notifyListeners();
};

const useSharedAudioState = () => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return globalState;
};

// Centralized logic for media session
const setupMediaSession = (audioEl: HTMLAudioElement) => {
    if (!('mediaSession' in navigator)) return;

    const play = () => audioEl.play().catch(e => console.error("Play error:", e));
    const pause = () => audioEl.pause();
    const seek = (details: MediaSessionActionDetails) => {
      if (globalState.isLive) return;
      const skipTime = details.seekOffset || (details.action === 'seekbackward' ? -10 : 10);
      audioEl.currentTime = Math.max(0, Math.min(audioEl.duration, audioEl.currentTime + skipTime));
    };

    navigator.mediaSession.setActionHandler('play', play);
    navigator.mediaSession.setActionHandler('pause', pause);
    navigator.mediaSession.setActionHandler('seekbackward', seek);
    navigator.mediaSession.setActionHandler('seekforward', seek);
};

// Run this once
if (typeof window !== 'undefined') {
  const audioEl = getAudioInstance();
  if (audioEl) {
    setupMediaSession(audioEl);
    
    audioEl.addEventListener('play', () => setGlobalState({ isPlaying: true, isLoading: false }));
    audioEl.addEventListener('pause', () => setGlobalState({ isPlaying: false }));
    audioEl.addEventListener('ended', () => setGlobalState({ isPlaying: false }));
    audioEl.addEventListener('waiting', () => setGlobalState({ isLoading: true }));
    audioEl.addEventListener('canplay', () => setGlobalState({ isLoading: false }));
    audioEl.addEventListener('timeupdate', () => setGlobalState({ progress: audioEl.currentTime }));
    audioEl.addEventListener('durationchange', () => {
      const isLiveStream = !isFinite(audioEl.duration);
      setGlobalState({ 
        isLive: isLiveStream, 
        duration: isLiveStream ? 0 : audioEl.duration 
      });
    });
    audioEl.addEventListener('error', () => {
      console.error("Audio element error");
      setGlobalState({ isLoading: false, isPlaying: false });
    });
  }
}


export function useAudioPlayer(props: UseAudioPlayerProps = {}) {
  const { onEnded } = props;
  const audioInstance = getAudioInstance();
  const state = useSharedAudioState();
  const { toast } = useToast();

  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    if (!audioInstance) return;

    const handleEnded = () => {
      if (state.src === currentSrc && onEndedRef.current) {
        onEndedRef.current();
      }
    };
    
    audioInstance.addEventListener('ended', handleEnded);
    return () => {
      audioInstance.removeEventListener('ended', handleEnded);
    };
  }, [state.src, audioInstance]);

  const playAudio = useCallback((src: string, mediaMetadata?: MediaMetadataInit) => {
    if (!audioInstance) return;

    setGlobalState({ isLoading: true, src });
    currentSrc = src;

    if (audioInstance.src !== src) {
      audioInstance.src = src;
    }
    
    if (mediaMetadata && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        ...mediaMetadata,
        artwork: [{ src: artworkUrl, sizes: '1920x1280', type: 'image/jpeg' }],
      });
    }

    const playPromise = audioInstance.play();
    if (playPromise) {
        playPromise.catch(e => {
            console.error("Play error:", e);
            toast({
              variant: 'destructive',
              title: 'Audio Error',
              description: 'Could not play audio. It might be a network issue or unsupported format.',
            });
            setGlobalState({ isLoading: false, isPlaying: false });
        });
    }
  }, [audioInstance, toast]);

  const pauseAudio = useCallback(() => {
    if (!audioInstance) return;
    audioInstance.pause();
  }, [audioInstance]);

  const togglePlayPause = useCallback((src: string, mediaMetadata?: MediaMetadataInit) => {
    if (state.isPlaying && state.src === src) {
      pauseAudio();
    } else {
      playAudio(src, mediaMetadata);
    }
  }, [state.isPlaying, state.src, playAudio, pauseAudio]);

  const seek = useCallback((seconds: number) => {
    if (audioInstance && !state.isLive) {
      audioInstance.currentTime = Math.max(0, Math.min(state.duration, audioInstance.currentTime + seconds));
    }
  }, [audioInstance, state.isLive, state.duration]);

  const handleSliderChange = (value: number[]) => {
    if (audioInstance && !state.isLive) {
      audioInstance.currentTime = value[0];
      setGlobalState({ progress: value[0] });
    }
  };

  const formatTime = (time: number) => {
    if (state.isLive) return 'Live';
    if (isNaN(time) || !isFinite(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return { ...state, togglePlayPause, seek, handleSliderChange, formatTime };
}
