
'use client';

import { useAudioPlayer } from '@/hooks/use-audio-player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pause, Play, LoaderCircle, Radio } from 'lucide-react';
import { useState } from 'react';

interface RadioPlayerCardProps {
  name: string;
  streamUrl: string;
}

export function RadioPlayerCard({ name, streamUrl }: RadioPlayerCardProps) {
  const [isPlayingThis, setIsPlayingThis] = useState(false);
  
  const { isPlaying, isLoading, isLive, src } = useAudioPlayer({
    src: isPlayingThis ? streamUrl : undefined,
    autoplay: isPlayingThis, // Autoplay when this card is activated
    onEnded: () => setIsPlayingThis(false), // Deactivate on end
    mediaMetadata: {
        title: name,
        artist: 'Live Radio',
        album: 'Noor Al Quran'
    }
  });
  
  const currentlyPlayingThis = isPlaying && src === streamUrl;

  const handleTogglePlay = () => {
    setIsPlayingThis(prev => !prev);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-start gap-3">
          <Radio className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <span>{name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            {isLive && currentlyPlayingThis && (
                 <div className="flex items-center gap-2 text-red-500">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span>Live</span>
                </div>
            )}
        </div>
        <Button
          variant="default"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={handleTogglePlay}
          aria-label={currentlyPlayingThis ? 'Pause' : 'Play'}
          disabled={isLoading && isPlayingThis}
        >
          {isLoading && isPlayingThis ? (
            <LoaderCircle className="h-6 w-6 animate-spin" />
          ) : currentlyPlayingThis ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
