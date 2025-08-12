
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { BookOpen, Headphones, MessageCircleQuestion, ToyBrick, BookMarked, Tv, Radio } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Surah } from "@/types/quran";
import type { Hadith } from "@/types/hadith";
import { getSurahOfTheDay } from "@/actions/quran";
import { getHadithOfTheDay } from "@/actions/hadith";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollText } from "lucide-react";

export default function Home() {
  const { t, language } = useTranslation();
  const [surahOfTheDay, setSurahOfTheDay] = useState<Surah | null>(null);
  const [hadithOfTheDay, setHadithOfTheDay] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [surah, hadith] = await Promise.all([
          getSurahOfTheDay(),
          getHadithOfTheDay()
        ]);
        if (surah) {
          setSurahOfTheDay(surah);
        }
        if (hadith) {
          setHadithOfTheDay(hadith);
        }
      } catch (error) {
        console.error("Failed to fetch daily data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="relative w-full min-h-[24rem] rounded-2xl overflow-hidden shadow-2xl group">
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
                <div className="w-full md:w-3/4 space-y-3">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-6 w-3/4" />
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
        </div>
        
        <Card className="flex flex-col justify-between bg-gradient-to-br from-accent/30 to-background shadow-xl">
           <CardHeader>
             <div className="flex items-center gap-4 text-primary">
               <ScrollText className="w-8 h-8" />
               <CardTitle className="font-headline text-3xl">{t('hadithOfTheDay')}</CardTitle>
             </div>
             <CardDescription>{t('sahihAlBukhari')}</CardDescription>
           </CardHeader>
           <CardContent className="flex-grow">
            {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              ) : hadithOfTheDay ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-lg leading-relaxed">{language === 'ur' ? hadithOfTheDay.urdu : hadithOfTheDay.english}</p>
                  <p className="text-sm text-primary font-semibold">{t('chapter')}: {language === 'ur' ? hadithOfTheDay.urduChapterName : hadithOfTheDay.englishChapterName}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">{t('hadithNotAvailable')}</p>
              )}
           </CardContent>
           <CardFooter>
              {hadithOfTheDay && (
                <p className="text-xs text-muted-foreground">{t('hadithNumber')}: {hadithOfTheDay.hadithNumber}</p>
              )}
           </CardFooter>
        </Card>
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
