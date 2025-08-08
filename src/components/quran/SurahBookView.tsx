
'use client';

import type { Ayah } from '@/types/quran';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CardContent } from "@/components/ui/card";
import React from 'react';

interface SurahBookViewProps {
  ayahs: Ayah[];
  surahName: string;
}

const AYAH_PER_PAGE = 10;

// Component for a single page of the Quran
function SurahPage({ ayahs, pageNumber, totalPages, surahName }: { ayahs: Ayah[], pageNumber: number, totalPages: number, surahName: string }) {
  return (
    <div className="h-[75vh] w-full bg-[#fdfdf7] flex flex-col pt-6 border-2 border-amber-800/20 shadow-inner rounded-lg">
        <div className="flex justify-between items-center px-6 pb-2 border-b-2 border-amber-800/10">
            <h3 className="font-headline text-lg text-amber-900">{surahName}</h3>
            <p className="text-sm text-amber-900/70">Page {pageNumber} of {totalPages}</p>
        </div>
        <CardContent className="flex-grow overflow-hidden p-6 lg:p-8">
            <div dir="rtl" className="font-arabic text-3xl lg:text-4xl leading-loose lg:leading-loose text-amber-950 text-right">
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
    </div>
  )
}

export function SurahBookView({ ayahs, surahName }: SurahBookViewProps) {
  const pages = [];

  for (let i = 0; i < ayahs.length; i += AYAH_PER_PAGE) {
    pages.push(ayahs.slice(i, i + AYAH_PER_PAGE));
  }

  return (
    <div className="w-full relative py-4">
        <style jsx global>{`
          body {
            background-image: url('/background-texture.png');
            background-repeat: repeat;
            background-color: #f0eade; /* A fallback color */
          }
        `}</style>
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full max-w-2xl mx-auto"
      >
        <CarouselContent className="-ml-4">
          {pages.map((pageAyahs, index) => (
             <CarouselItem key={index} className="pl-4">
                <SurahPage 
                  ayahs={pageAyahs} 
                  pageNumber={index + 1}
                  totalPages={pages.length} 
                  surahName={surahName}
                />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute -left-4 md:-left-16 top-1/2 -translate-y-1/2 h-12 w-12 bg-primary/80 hover:bg-primary text-primary-foreground" />
        <CarouselNext className="absolute -right-4 md:-right-16 top-1/2 -translate-y-1/2 h-12 w-12 bg-primary/80 hover:bg-primary text-primary-foreground" />
      </Carousel>
    </div>
  );
}
