
'use client';

import type { Ayah } from '@/types/quran';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { CardContent } from "@/components/ui/card";
import React, { forwardRef } from 'react';
import { Button } from '../ui/button';
import { Play, Pause, X } from 'lucide-react';
import { getAyahAudioUrl } from '@/lib/quran-api';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';

interface SurahPageProps {
  ayahs: Ayah[];
  playingAyah: number | null;
  onPlay: (ayahNumber: number) => void;
}

function SurahPage({ ayahs, playingAyah, onPlay }: SurahPageProps) {
  return (
    <div className="h-full w-full bg-[#fdfdf7] flex flex-col p-4 border-2 border-amber-800/20 shadow-inner rounded-lg">
      <CardContent className="flex-1 overflow-y-auto p-4 lg:p-6 min-h-0">
          <div dir="rtl" className="font-arabic text-3xl lg:text-4xl leading-loose lg:leading-loose text-amber-950 text-right w-full break-words">
          {ayahs.map((ayah) => (
              <React.Fragment key={ayah.number}>
                {ayah.text}
                <span className="text-xl font-mono text-accent bg-accent/10 rounded-full w-10 h-10 inline-flex items-center justify-center mx-2 align-middle">
                    {ayah.numberInSurah}
                </span>
                 <button
                    onClick={() => onPlay(ayah.number)}
                    aria-label={playingAyah === ayah.number ? "Pause recitation" : "Play recitation"}
                    className="text-amber-900/70 hover:text-amber-900 inline-flex items-center justify-center align-middle w-10 h-10 rounded-full hover:bg-amber-800/10 transition-colors"
                >
                    {playingAyah === ayah.number ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
              </React.Fragment>
          ))}
          </div>
      </CardContent>
    </div>
  )
}

interface SurahBookViewProps {
  ayahs: Ayah[];
  surahName: string;
  onExit: () => void;
  pages: Record<number, Ayah[]>;
}

const PrintablePage = forwardRef<HTMLDivElement, { pageAyahs: Ayah[], surahName: string, pageNumber: number }>(({ pageAyahs, surahName, pageNumber }, ref) => {
    return (
      <div ref={ref} className="w-[800px] h-[1200px] bg-[#fdfdf7] flex flex-col p-12 box-border font-arabic">
        <div className="flex justify-between items-center pb-4 text-amber-950">
           <h2 className="text-lg font-headline font-bold">{surahName}</h2>
           <h2 className="text-lg font-headline font-bold">Page {pageNumber}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 border-2 border-amber-800/10 text-right text-3xl leading-loose text-amber-950 break-words">
            {pageAyahs.map((ayah) => (
              <React.Fragment key={ayah.number}>
                  {ayah.text}
                  <span className="text-xl font-mono text-accent bg-accent/10 rounded-full w-10 h-10 inline-flex items-center justify-center mx-2 align-middle">
                      {ayah.numberInSurah}
                  </span>
              </React.Fragment>
          ))}
        </div>
      </div>
    );
});
PrintablePage.displayName = 'PrintablePage';

export function SurahBookView({ ayahs, surahName, onExit, pages: pagesMap }: SurahBookViewProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [playingAyah, setPlayingAyah] = React.useState<number | null>(null);
  
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const printableRefs = React.useRef<{[key: number]: HTMLDivElement | null}>({});

  React.useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handleEnded = () => setPlayingAyah(null);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  const handlePlay = (ayahNumber: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingAyah === ayahNumber) {
      audio.pause();
      setPlayingAyah(null);
    } else {
      audio.src = getAyahAudioUrl(ayahNumber);
      audio.play().catch(e => console.error("Audio play failed", e));
      setPlayingAyah(ayahNumber);
    }
  };

  const pages = Object.entries(pagesMap).map(([pageNumber, pageAyahs]) => ({
    pageNumber: parseInt(pageNumber, 10),
    ayahs: pageAyahs,
  }));
 
  React.useEffect(() => {
    if (!api) {
      return
    }
 
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  const currentPageNumber = pages[current - 1]?.pageNumber;

  return (
    <div className="w-full h-full relative bg-[#f0eade] flex flex-col items-center justify-center p-4">
        <div className="absolute top-0 left-0 right-0 z-20 bg-black/10 backdrop-blur-sm p-2 flex justify-between items-center text-white h-12">
            <div className="text-sm font-bold w-1/3 text-left pl-2">
              {currentPageNumber ? `Page ${currentPageNumber}` : ''}
            </div>
            <h2 className="text-lg font-headline font-bold w-1/3 text-center">{surahName}</h2>
            <div className="w-1/3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={onExit} className="hover:bg-white/20">
                    <X className="w-5 h-5 mr-2"/>
                    <span>Exit Book View</span>
                </Button>
            </div>
        </div>

      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full max-w-4xl"
      >
        <CarouselContent className="h-[calc(100vh-3rem)]">
          {pages.map((page, index) => (
             <CarouselItem key={index} className="pl-4 basis-full">
                <SurahPage 
                  ayahs={page.ayahs}
                  playingAyah={playingAyah}
                  onPlay={handlePlay}
                />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-12 bg-primary/80 hover:bg-primary text-primary-foreground disabled:opacity-30 z-10" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 bg-primary/80 hover:bg-primary text-primary-foreground disabled:opacity-30 z-10" />
      </Carousel>
    </div>
  );
}
