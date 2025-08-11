
'use client';
import type { Surah } from '@/types/quran';
import { useState, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Play, Pause, Rewind, FastForward, LoaderCircle, SkipBack, SkipForward, ListMusic, X, PlusCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { getSurahAudioUrl } from '@/lib/quran-api';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';


interface SurahAudioPlayerProps {
  surahs: Surah[];
  initialSurahNumber?: string;
}

export function SurahAudioPlayer({ surahs, initialSurahNumber }: SurahAudioPlayerProps) {
  const { t } = useTranslation();
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<string | undefined>(initialSurahNumber);
  const [playlist, setPlaylist] = useState<Surah[]>([]);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState<number>(-1);
  const { toast } = useToast();

  const currentPlayingSurah = currentPlaylistIndex > -1 ? playlist[currentPlaylistIndex] : surahs.find(s => s.number.toString() === selectedSurahNumber);

  const handleNext = useCallback(() => {
    if (playlist.length > 0) {
      const nextIndex = (currentPlaylistIndex + 1) % playlist.length;
      setCurrentPlaylistIndex(nextIndex);
    } else if (currentPlayingSurah) {
      const currentIndex = surahs.findIndex(s => s.number === currentPlayingSurah.number);
      if (currentIndex !== -1) {
        const nextIndex = (currentIndex + 1) % surahs.length;
        setSelectedSurahNumber(surahs[nextIndex].number.toString());
      }
    }
  }, [playlist, currentPlaylistIndex, surahs, currentPlayingSurah]);

  const handlePrevious = () => {
    if (playlist.length > 0) {
      const prevIndex = (currentPlaylistIndex - 1 + playlist.length) % playlist.length;
      setCurrentPlaylistIndex(prevIndex);
    } else if (currentPlayingSurah) {
      const currentIndex = surahs.findIndex(s => s.number === currentPlayingSurah.number);
      if (currentIndex !== -1) {
        const prevIndex = (currentIndex - 1 + surahs.length) % surahs.length;
        setSelectedSurahNumber(surahs[prevIndex].number.toString());
      }
    }
  };

  useEffect(() => {
    if (surahs.length > 0 && initialSurahNumber) {
      const initialSurah = surahs.find(s => s.number.toString() === initialSurahNumber);
      if (initialSurah) {
        setPlaylist([initialSurah]);
        setCurrentPlaylistIndex(0);
        setSelectedSurahNumber(undefined); // Play from playlist
      }
    }
  }, [surahs, initialSurahNumber]);

  const audioUrl = currentPlayingSurah ? getSurahAudioUrl(currentPlayingSurah.number) : undefined;
  
  const { 
    isPlaying, 
    isLoading, 
    progress, 
    duration, 
    togglePlayPause, 
    seek, 
    handleSliderChange,
    formatTime 
  } = useAudioPlayer({ 
    src: audioUrl,
    onEnded: handleNext, // Autoplay next
    mediaMetadata: currentPlayingSurah ? {
        title: `Surah ${currentPlayingSurah.englishName}`,
        artist: 'Mishary Rashid Alafasy',
        album: 'Noor Al Quran',
    } : undefined,
    autoplay: !!initialSurahNumber || currentPlaylistIndex !== -1
  });

  const handleSelectSurah = (surahNumber: string) => {
    setPlaylist([]);
    setCurrentPlaylistIndex(-1);
    setSelectedSurahNumber(surahNumber);
  };
  
  const addToPlaylist = (surah: Surah) => {
    if (!playlist.find(s => s.number === surah.number)) {
      setPlaylist([...playlist, surah]);
      toast({ title: t('addedToQueue'), description: `${t('surah')} ${surah.englishName} ${t('hasBeenAdded')}.`});
      // If nothing is playing, start playing the new song
      if (!currentPlayingSurah) {
        setCurrentPlaylistIndex(playlist.length);
      }
    } else {
      toast({ variant: "destructive", title: t('alreadyInQueue'), description: `${t('surah')} ${surah.englishName} ${t('isAlreadyInQueue')}.`});
    }
  };

  const removeFromPlaylist = (surahNumber: number) => {
    const surahToRemove = playlist.find(s => s.number === surahNumber);
    if (!surahToRemove) return;

    let newPlaylist = playlist.filter(s => s.number !== surahNumber);
    
    if (surahToRemove.number === currentPlayingSurah?.number) {
        if (newPlaylist.length > 0) {
            const nextIndex = (currentPlaylistIndex) % newPlaylist.length;
            setCurrentPlaylistIndex(nextIndex);
        } else {
            setCurrentPlaylistIndex(-1);
            setSelectedSurahNumber(undefined);
        }
    } else {
        const removedIndex = playlist.findIndex(s => s.number === surahNumber);
        if (removedIndex < currentPlaylistIndex) {
            setCurrentPlaylistIndex(currentPlaylistIndex - 1);
        }
    }
    
    setPlaylist(newPlaylist);
    toast({ title: t('removedFromQueue'), description: `${t('surah')} ${surahToRemove.englishName} ${t('hasBeenRemoved')}.`});
  };

  const clearPlaylist = () => {
    setPlaylist([]);
    setCurrentPlaylistIndex(-1);
    toast({ title: t('queueCleared') });
  }

  return (
    <div className="space-y-6">
       <Tabs defaultValue="surahs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="surahs">{t('surahList')}</TabsTrigger>
          <TabsTrigger value="playlist">
            <span className="flex items-center gap-2">{t('queue')} <ListMusic className="h-4 w-4" /> ({playlist.length})</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="surahs">
            <p className="text-sm text-muted-foreground mb-2">{t('surahListDescription')}</p>
            <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-1">
                    {surahs.map(surah => (
                        <div key={surah.number} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                            <button className="text-left flex-grow" onClick={() => handleSelectSurah(surah.number.toString())}>
                                <p>{surah.number}. {surah.englishName} ({surah.name})</p>
                            </button>
                            <Button size="icon" variant="ghost" onClick={() => addToPlaylist(surah)} aria-label={`Add ${surah.englishName} to queue`}>
                                <PlusCircle className="h-5 w-5 text-primary" />
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </TabsContent>
        <TabsContent value="playlist">
            {playlist.length > 0 ? (
                <>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-muted-foreground">{t('yourQueue')}</p>
                  <Button variant="outline" size="sm" onClick={clearPlaylist}>{t('clearQueue')}</Button>
                </div>
                <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-1">
                        {playlist.map((surah, index) => (
                            <div key={surah.number} className={cn("flex items-center justify-between p-2 rounded-md", currentPlaylistIndex === index ? "bg-primary/10" : "hover:bg-muted")}>
                                <button className="text-left flex-grow" onClick={() => setCurrentPlaylistIndex(index)}>
                                    <p className={cn(currentPlaylistIndex === index && "font-bold text-primary")}>
                                      {index + 1}. {surah.englishName}
                                    </p>
                                </button>
                                <Button size="icon" variant="ghost" onClick={() => removeFromPlaylist(surah.number)} aria-label={`Remove ${surah.englishName} from queue`}>
                                    <X className="h-5 w-5 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                </>
            ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">{t('queueEmpty')}</p>
                    <p className="text-sm text-muted-foreground">{t('queueEmptyDescription')}</p>
                </div>
            )}
        </TabsContent>
      </Tabs>


      <div className="flex flex-col items-center space-y-4 p-6 rounded-lg bg-muted">
        <div className="text-center h-16">
          {currentPlayingSurah ? (
            <>
              <p className="text-2xl font-headline font-bold">{currentPlayingSurah.englishName}</p>
              <p className="text-xl font-arabic text-primary">{currentPlayingSurah.name}</p>
            </>
          ) : (
             <p className="text-xl font-headline text-muted-foreground pt-4">{t('selectASurah')}</p>
          )}
        </div>
        
        <div className="w-full space-y-2">
            <Slider
                value={[progress]}
                max={duration || 100}
                onValueChange={handleSliderChange}
                disabled={!currentPlayingSurah || isLoading || !isFinite(duration)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
            </div>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
           <Button variant="ghost" size="icon" onClick={handlePrevious} aria-label={t('previousSurah')} disabled={!currentPlayingSurah || isLoading}>
            <SkipBack className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => seek(-10)} aria-label={t('rewind10Seconds')} disabled={!currentPlayingSurah || isLoading}>
            <Rewind className="h-6 w-6" />
          </Button>
          <Button variant="default" size="icon" className="h-16 w-16 rounded-full" onClick={togglePlayPause} aria-label={isPlaying ? t('pause') : t('play')} disabled={!currentPlayingSurah || isLoading}>
            {isLoading ? <LoaderCircle className="h-8 w-8 animate-spin" /> : (isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />)}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => seek(10)} aria-label={t('fastForward10Seconds')} disabled={!currentPlayingSurah || isLoading}>
            <FastForward className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNext} aria-label={t('nextSurah')} disabled={!currentPlayingSurah || isLoading}>
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
