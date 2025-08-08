
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

function SurahPage({ ayahs, pageNumber, totalPages, surahName }: { ayahs: Ayah[], pageNumber: number, totalPages: number, surahName: string }) {
  return (
    <div className="h-full w-full bg-[#fdfdf7] flex flex-col pt-6 border-2 border-amber-800/20 shadow-inner rounded-lg">
        <div className="flex justify-between items-center px-6 pb-2 border-b-2 border-amber-800/10">
            <h3 className="font-headline text-lg text-amber-900">{surahName}</h3>
            <p className="text-sm text-amber-900/70">Page {pageNumber} of {totalPages}</p>
        </div>
        <CardContent className="flex-grow overflow-auto p-6 lg:p-8">
            <div dir="rtl" className="font-arabic text-3xl lg:text-4xl leading-loose lg:leading-loose text-amber-950 text-right">
            {ayahs.map((ayah) => (
                <React.Fragment key={ayah.number}>
                {ayah.text}
                <span className="text-xl font-mono text-accent bg-accent/10 rounded-full w-10 h-10 inline-flex items-center justify-center mx-2 align-middle">
                    {ayah.numberInSurah}
                </span>
                </React.Fragment>
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
    <div className="w-full h-screen relative bg-[#f0eade] flex items-center justify-center p-4">
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full h-full max-w-4xl"
      >
        <CarouselContent className="-ml-4 h-full">
          {pages.map((pageAyahs, index) => (
             <CarouselItem key={index} className="pl-4 h-full">
                <SurahPage 
                  ayahs={pageAyahs} 
                  pageNumber={index + 1}
                  totalPages={pages.length} 
                  surahName={surahName}
                />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 h-12 w-12 bg-primary/80 hover:bg-primary text-primary-foreground disabled:opacity-30" />
        <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 h-12 w-12 bg-primary/80 hover:bg-primary text-primary-foreground disabled:opacity-30" />
      </Carousel>
    </div>
  );
}
