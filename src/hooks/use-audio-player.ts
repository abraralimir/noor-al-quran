
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAudioPlayerProps {
  src?: string;
  onEnded?: () => void;
  mediaMetadata?: MediaMetadataInit;
  isLiveStream?: boolean;
}

const artworkUrl = '/book-1920.jpg';

export function useAudioPlayer(props: UseAudioPlayerProps = {}) {
  const { src, onEnded, mediaMetadata, isLiveStream = false } = props;
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLive, setIsLive] = useState(isLiveStream);
  const { toast } = useToast();

  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      const audio = audioRef.current;
      
      const handlePlay = () => { setIsPlaying(true); setIsLoading(false); };
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => {
        setIsPlaying(false);
        if (onEndedRef.current) onEndedRef.current();
      };
      const handleWaiting = () => setIsLoading(true);
      const handleCanPlay = () => setIsLoading(false);
      const handleTimeUpdate = () => setProgress(audio.currentTime);
      const handleDurationChange = () => {
        const isLive = !isFinite(audio.duration);
        setIsLive(isLive);
        setDuration(isLive ? 0 : audio.duration);
      };
      const handleError = (e: Event) => {
        console.error("Audio element error", e);
        setIsLoading(false);
        setIsPlaying(false);
        toast({
          variant: 'destructive',
          title: 'Audio Error',
          description: 'Could not play audio. It might be a network issue or unsupported format.',
        });
      };
      
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('waiting', handleWaiting);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('durationchange', handleDurationChange);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('waiting', handleWaiting);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('durationchange', handleDurationChange);
        audio.removeEventListener('error', handleError);
        audio.pause();
        audio.src = '';
      };
    }
  }, [toast]);

  useEffect(() => {
    if (audioRef.current && src && audioRef.current.src !== src) {
      audioRef.current.src = src;
      setIsLoading(true);
      setProgress(0);
    }
  }, [src]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    if (mediaMetadata && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        ...mediaMetadata,
        artwork: [{ src: artworkUrl, sizes: '1920x1280', type: 'image/jpeg' }],
      });
      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', () => audio.pause());
      navigator.mediaSession.setActionHandler('seekbackward', () => seek(-10));
      navigator.mediaSession.setActionHandler('seekforward', () => seek(10));
    }
    
    setIsLoading(true);
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.error("Play promise error:", e);
        setIsLoading(false);
      });
    }
  }, [src, mediaMetadata]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);
  
  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (audio && !isLive) {
      audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
    }
  }, [isLive, duration]);

  const handleSliderChange = (value: number[]) => {
    const audio = audioRef.current;
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

  return { isPlaying, isLoading, progress, duration, isLive, togglePlayPause, seek, handleSliderChange, formatTime, play, pause };
}
