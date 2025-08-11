
'use client';

import type { SurahDetails } from "@/types/quran";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenCheck } from "lucide-react";

interface TafseerDisplayProps {
  surah: SurahDetails;
}

export function TafseerDisplay({ surah }: TafseerDisplayProps) {
  const ayahsWithTafseer = surah.ayahs.filter(ayah => ayah.tafseer && ayah.tafseer.trim() !== "");

  if (ayahsWithTafseer.length === 0) {
    return null; // Don't render anything if there's no tafseer
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
            <BookOpenCheck className="w-8 h-8 text-primary" />
            <div>
                <CardTitle className="text-3xl font-headline">Tafseer</CardTitle>
                <CardDescription>Commentary on Surah {surah.englishName} (Tafsir al-Jalalayn)</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {ayahsWithTafseer.map((ayah) => (
            <AccordionItem value={`item-${ayah.numberInSurah}`} key={ayah.number}>
              <AccordionTrigger className="text-lg text-left">
                <span className="mr-4 text-primary font-bold">Ayah {ayah.numberInSurah}</span>
                <span className="font-arabic text-2xl text-right flex-1" dir="rtl">{ayah.text}</span>
              </AccordionTrigger>
              <AccordionContent className="text-base px-2 leading-relaxed text-muted-foreground">
                {ayah.tafseer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
