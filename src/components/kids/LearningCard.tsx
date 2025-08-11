
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { LoaderCircle, Pause, Play, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LearningCardProps {
  character?: string;
  name: string;
  description?: string;
  gradient: string;
  audioSrc: string;
  isQaida?: boolean;
}

export function LearningCard({
  character,
  name,
  description,
  gradient,
  audioSrc,
  isQaida = false,
}: LearningCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize audio element on mount
    audioRef.current = new Audio(audioSrc);

    const audio = audioRef.current;
    
    const handleLoading = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    }
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      toast({
        variant: 'destructive',
        title: 'Audio Error',
        description: 'Could not play the sound. Please try again.',
      });
    };

    audio.addEventListener('loadstart', handleLoading);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Cleanup on unmount
    return () => {
      audio.pause();
      audio.removeEventListener('loadstart', handleLoading);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioSrc, toast]);

  const handlePlayAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => { /* Error is handled by listener */ });
    }
  };

  return (
    <Card className="group transform hover:-translate-y-2 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl border-4 border-transparent hover:border-primary/50 overflow-hidden flex flex-col">
      <div className={cn("h-32 flex items-center justify-center bg-gradient-to-br p-4", gradient)}>
        {isQaida ? (
           <h3 className="font-headline text-2xl font-bold text-white drop-shadow-md text-center">{name}</h3>
        ) : (
          <span className="font-arabic text-7xl font-bold text-white drop-shadow-md">
            {character}
          </span>
        )}
      </div>
      <CardContent className="p-4 text-center bg-card flex flex-col items-center justify-center gap-4 flex-grow">
        {isQaida ? (
           <p className="text-sm text-muted-foreground flex-grow">{description}</p>
        ) : (
          <h3 className="text-xl font-headline font-semibold text-foreground">{name}</h3>
        )}
        <Button onClick={handlePlayAudio} disabled={isLoading} size="icon" className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 flex-shrink-0">
          {isLoading ? <LoaderCircle className="animate-spin" /> : (isPlaying ? <Pause /> : <Play />)}
          <span className="sr-only">Play audio for {name}</span>
        </Button>
      </CardContent>
    </Card>
  );
}
