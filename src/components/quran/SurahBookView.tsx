
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
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface SurahBookViewProps {
  ayahs: Ayah[];
  surahName: string;
  onExit: () => void;
}

const AYAH_PER_PAGE = 10;

function SurahPage({ ayahs }: { ayahs: Ayah[] }) {
  return (
    <div className="h-full w-full bg-[#fdfdf7] flex flex-col pt-16 p-4 border-2 border-amber-800/20 shadow-inner rounded-lg relative">
        <CardContent className="flex-grow overflow-y-auto p-4 lg:p-6">
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

export function SurahBookView({ ayahs, surahName, onExit }: SurahBookViewProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  const pages = [];
  for (let i = 0; i < ayahs.length; i += AYAH_PER_PAGE) {
    pages.push(ayahs.slice(i, i + AYAH_PER_PAGE));
  }
 
  useEffect(() => {
    if (!api) {
      return
    }
 
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])


  return (
    <div className="w-full h-full relative bg-[#f0eade] flex items-center justify-center p-4">
        <div className="absolute top-0 left-0 right-0 z-20 bg-black/10 backdrop-blur-sm p-2 flex justify-between items-center text-white">
            <div className="text-sm font-bold w-1/3 text-left">Page {current} of {count}</div>
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
        className="w-full h-full max-w-4xl"
      >
        <CarouselContent className="-ml-4">
          {pages.map((pageAyahs, index) => (
             <CarouselItem key={index} className="pl-4 h-full">
                <SurahPage 
                  ayahs={pageAyahs} 
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

