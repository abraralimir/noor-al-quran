
'use client';

import { useAudioPlayer } from '@/hooks/use-audio-player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pause, Play, LoaderCircle, Radio } from 'lucide-react';

interface RadioPlayerCardProps {
  name: string;
  streamUrl: string;
}

export function RadioPlayerCard({ name, streamUrl }: RadioPlayerCardProps) {
  const { isPlaying, isLoading, togglePlayPause, isLive } = useAudioPlayer({
    src: streamUrl,
    autoplay: false,
    mediaMetadata: {
        title: name,
        artist: 'Live Radio',
        album: 'Noor Al Quran'
    }
  });

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
            {isLive && isPlaying && (
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
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <LoaderCircle className="h-6 w-6 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
