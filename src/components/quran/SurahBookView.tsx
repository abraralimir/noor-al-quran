
'use client';

import type { Ayah } from '@/types/quran';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';
import React from 'react';

interface SurahBookViewProps {
  ayahs: Ayah[];
  surahName: string;
}

const AYAH_PER_PAGE = 10;

// Component for a single page of the Quran
function SurahPage({ ayahs, pageNumber, totalPages, surahName }: { ayahs: Ayah[], pageNumber: number, totalPages: number, surahName: string }) {
  return (
    <Card className="h-[60vh] lg:h-[70vh] w-full bg-background/80 flex flex-col pt-6 border-2 border-amber-800/20 shadow-inner">
        <div className="flex justify-between items-center px-6 pb-2 border-b-2 border-amber-800/10">
            <h3 className="font-headline text-lg">{surahName}</h3>
            <p className="text-sm text-muted-foreground">Page {pageNumber} of {totalPages}</p>
        </div>
        <CardContent className="flex-grow overflow-y-auto p-6 lg:p-8">
            <div dir="rtl" className="font-arabic text-3xl lg:text-4xl leading-loose text-right">
            {ayahs.map((ayah) => (
                <span key={ayah.number}>
                {ayah.text}
                <span className="text-sm font-mono text-accent bg-accent/10 rounded-full w-8 h-8 inline-flex items-center justify-center mx-1 align-middle">
                    {ayah.numberInSurah}
                </span>
                </span>
            ))}
            </div>
        </CardContent>
    </Card>
  )
}

export function SurahBookView({ ayahs, surahName }: SurahBookViewProps) {
  const isMobile = useIsMobile();
  const pages = [];

  for (let i = 0; i < ayahs.length; i += AYAH_PER_PAGE) {
    pages.push(ayahs.slice(i, i + AYAH_PER_PAGE));
  }

  return (
    <div className="w-full relative py-8">
        <style jsx global>{`
          body {
            background-image: url('/background-texture.png');
            background-repeat: repeat;
          }
        `}</style>
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full max-w-sm md:max-w-4xl mx-auto"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {pages.map((pageAyahs, index) => (
             <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2">
                <SurahPage 
                  ayahs={pageAyahs} 
                  pageNumber={index + 1}
                  totalPages={pages.length} 
                  surahName={surahName}
                />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
            <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2 h-10 w-10 bg-primary/80 hover:bg-primary text-primary-foreground" />
            <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2 h-10 w-10 bg-primary/80 hover:bg-primary text-primary-foreground" />
        </div>
        <div className="md:hidden flex justify-center gap-8 mt-6">
           <CarouselPrevious className="static translate-y-0 h-12 w-12" />
           <CarouselNext className="static translate-y-0 h-12 w-12" />
        </div>
      </Carousel>
    </div>
  );
}
