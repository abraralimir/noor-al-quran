
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { BookOpen, Headphones, MessageCircleQuestion, ToyBrick, BookMarked, Tv, Radio } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Surah } from "@/types/quran";
import { getSurahOfTheDay } from "@/actions/quran";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { t, language } = useTranslation();
  const [surahOfTheDay, setSurahOfTheDay] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSurah() {
      try {
        const surah = await getSurahOfTheDay();
        if (surah) {
          setSurahOfTheDay(surah);
        }
      } catch (error) {
        console.error("Failed to fetch Surah of the day:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSurah();
  }, []);

  const features = [
    {
      title: t('readQuranCardTitle'),
      description: t('readQuranCardDescription'),
      href: `/${language}/read`,
      buttonText: t('startReading'),
      icon: BookOpen,
    },
    {
      title: t('listenCardTitle'),
      description: t('listenCardDescription'),
      href: `/${language}/listen`,
      buttonText: t('listenNow'),
      icon: Headphones,
    },
    {
      title: t('tafseerCardTitle'),
      description: t('tafseerCardDescription'),
      href: `/${language}/tafseer`,
      buttonText: t('exploreTafseer'),
      icon: BookMarked,
    },
    {
      title: t('radio'),
      description: t('radioPageDescription'),
      href: `/${language}/radio`,
      buttonText: t('tuneIn'),
      icon: Radio
    },
    {
      title: t('live'),
      description: t('livePageDescription'),
      href: `/${language}/live`,
      buttonText: t('watchNow'),
      icon: Tv
    },
    {
      title: t('tutorCardTitle'),
      description: t('tutorCardDescription'),
      href: `/${language}/tutor`,
      buttonText: t('askAQuestion'),
      icon: MessageCircleQuestion,
    },
    {
      title: t('kidsCardTitle'),
      description: t('kidsCardDescription'),
      href: `/${language}/kids`,
      buttonText: t('goToKidsCorner'),
      icon: ToyBrick,
    },
  ];

  return (
    <div className="space-y-16">
      <section className="text-center">
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary mb-4">
          {t('noorAlQuran')}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          {t('appDescription')}
        </p>
      </section>

      <section className="relative w-full min-h-[24rem] rounded-2xl overflow-hidden shadow-2xl group">
        <Image
          src="/book-1920.jpg"
          alt={t('quranImageAlt')}
          fill
          priority
          style={{ objectFit: 'cover' }}
          className="transition-transform duration-500 group-hover:scale-105"
          data-ai-hint="holy quran"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
        <div className="absolute inset-0 flex items-end p-8">
            {loading ? (
              <div className="w-full md:w-1/2 lg:w-1/3 space-y-3">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-10 w-32 mt-2" />
              </div>
            ) : surahOfTheDay && (
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl text-white max-w-lg">
                <h2 className="text-sm font-bold uppercase tracking-widest">{t('surahOfTheDay')}</h2>
                <h3 className="text-3xl font-headline font-bold mt-2">{surahOfTheDay.englishName} ({surahOfTheDay.name})</h3>
                <p className="mt-2 text-white/90">{surahOfTheDay.englishNameTranslation}</p>
                <Button asChild variant="default" className="mt-4 bg-white text-black hover:bg-white/90">
                  <Link href={`/${language}/read?surah=${surahOfTheDay.number}`}>{t('readSurah')}</Link>
                </Button>
            </div>
             )}
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex-grow">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="font-headline text-center">{feature.title}</CardTitle>
              <CardDescription className="text-center pt-2">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild variant="default" className="w-full">
                <Link href={feature.href}>{feature.buttonText}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
