
'use client';

import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { LoaderCircle, Volume2 } from 'lucide-react';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { useToast } from '@/hooks/use-toast';

interface LearningCardProps {
  character: string;
  name: string;
  gradient: string;
}

export function LearningCard({ character, name, gradient }: LearningCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePlayAudio = async () => {
    setIsLoading(true);
    try {
      const { audioDataUri } = await textToSpeech({ text: name });
      const audio = new Audio(audioDataUri);
      audio.play();
    } catch (error) {
      console.error('Failed to generate or play audio:', error);
      toast({
        variant: 'destructive',
        title: 'Audio Error',
        description: 'Could not play the sound. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="group transform hover:-translate-y-2 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl border-4 border-transparent hover:border-primary/50 overflow-hidden">
      <div className={cn("h-32 flex items-center justify-center bg-gradient-to-br", gradient)}>
        <span className="font-arabic text-7xl font-bold text-white drop-shadow-md">
          {character}
        </span>
      </div>
      <CardContent className="p-4 text-center bg-card flex flex-col items-center justify-center gap-4">
        <h3 className="text-xl font-headline font-semibold text-foreground">{name}</h3>
        <Button onClick={handlePlayAudio} disabled={isLoading} size="icon" className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90">
          {isLoading ? <LoaderCircle className="animate-spin" /> : <Volume2 />}
          <span className="sr-only">Play audio for {name}</span>
        </Button>
      </CardContent>
    </Card>
  );
}
