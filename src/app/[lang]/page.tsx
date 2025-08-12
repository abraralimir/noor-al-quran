
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { BookOpen, Headphones, MessageCircleQuestion, ToyBrick, BookMarked, Tv, Radio, Sun, BookHeart, CalendarDays, ScrollText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Surah } from "@/types/quran";
import type { Hadith } from "@/types/hadith";
import type { Dua } from "@/types/dua";
import type { CalendarDay } from "@/types/calendar";
import { getSurahOfTheDay } from "@/actions/quran";
import { getHadithOfTheDay } from "@/actions/hadith";
import { fetchDuaOfTheDay } from "@/actions/dua";
import { fetchTodaysHijriDate } from "@/actions/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Home() {
  const { t, language } = useTranslation();
  const [surahOfTheDay, setSurahOfTheDay] = useState<Surah | null>(null);
  const [hadithOfTheDay, setHadithOfTheDay] = useState<Hadith | null>(null);
  const [duaOfTheDay, setDuaOfTheDay] = useState<Dua | null>(null);
  const [islamicDate, setIslamicDate] = useState<CalendarDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // For the islamic date, we can use a placeholder location.
        // It doesn't significantly change for most regions.
        const [surah, hadith, dua, date] = await Promise.all([
          getSurahOfTheDay(),
          getHadithOfTheDay(),
          fetchDuaOfTheDay(),
          fetchTodaysHijriDate(30, 31) // Lat/long for Mecca as a default
        ]);
        if (surah) setSurahOfTheDay(surah);
        if (hadith) setHadithOfTheDay(hadith);
        if (dua) setDuaOfTheDay(dua);
        if (date) setIslamicDate(date);

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
        title: t('prayerTimesTitle'),
        description: t('prayerTimesCardDescription'),
        href: `/${language}/prayer-times`,
        buttonText: t('viewPrayerTimes'),
        icon: Sun
    },
    {
        title: t('calendar'),
        description: t('calendarCardDescription'),
        href: `/${language}/calendar`,
        buttonText: t('viewCalendar'),
        icon: CalendarDays
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

      {/* Daily Content Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Surah of the Day */}
        <Card className="flex flex-col justify-between bg-gradient-to-br from-primary/20 to-background shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-4 text-primary">
                <BookOpen className="w-8 h-8" />
                <CardTitle className="font-headline text-2xl">{t('surahOfTheDay')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-6 w-3/4" />
                </div>
            ) : surahOfTheDay && (
              <div className="space-y-2">
                <h3 className="text-2xl font-headline font-bold">{surahOfTheDay.englishName} ({surahOfTheDay.name})</h3>
                <p className="text-muted-foreground">{surahOfTheDay.englishNameTranslation}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {surahOfTheDay && (
                <Button asChild variant="default" size="sm">
                    <Link href={`/${language}/read?surah=${surahOfTheDay.number}`}>{t('readSurah')}</Link>
                </Button>
            )}
          </CardFooter>
        </Card>

        {/* Hadith of the Day */}
        <Card className="flex flex-col justify-between bg-gradient-to-br from-accent/30 to-background shadow-xl">
           <CardHeader>
             <div className="flex items-center gap-4 text-primary">
               <ScrollText className="w-8 h-8" />
               <CardTitle className="font-headline text-2xl">{t('hadithOfTheDay')}</CardTitle>
             </div>
             <CardDescription>{t('sahihAlBukhari')}</CardDescription>
           </CardHeader>
           <CardContent className="flex-grow">
            {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              ) : hadithOfTheDay ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed" dir={language === 'ur' ? 'rtl' : 'ltr'}>{language === 'ur' ? hadithOfTheDay.urdu : hadithOfTheDay.english}</p>
                  <p className="text-xs text-primary font-semibold" dir={language === 'ur' ? 'rtl' : 'ltr'}>{t('chapter')}: {language === 'ur' ? hadithOfTheDay.urduChapterName : hadithOfTheDay.englishChapterName}</p>
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

        {/* Islamic Date */}
        <Card className="flex flex-col justify-between bg-gradient-to-br from-secondary/30 to-background shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-4 text-primary">
                <CalendarDays className="w-8 h-8" />
                <CardTitle className="font-headline text-2xl">{t('islamicDate')}</CardTitle>
            </div>
             <CardDescription>{t('hijriCalendar')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                </div>
            ) : islamicDate ? (
              <div className="text-center space-y-2">
                <p className="text-3xl font-bold font-arabic">{islamicDate.date.hijri.day} {islamicDate.date.hijri.month.ar} {islamicDate.date.hijri.year}</p>
                <p className="text-md text-muted-foreground">{islamicDate.date.hijri.weekday.ar}</p>
              </div>
            ) : (
                <p className="text-muted-foreground">{t('dateNotAvailable')}</p>
            )}
          </CardContent>
          <CardFooter>
             <Button asChild variant="default" size="sm">
                <Link href={`/${language}/calendar`}>{t('viewCalendar')}</Link>
             </Button>
          </CardFooter>
        </Card>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
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
         <Card className="lg:col-span-3 flex flex-col justify-between bg-gradient-to-br from-primary/20 to-background shadow-xl flex-grow">
               <CardHeader>
                 <div className="flex items-center gap-4 text-primary">
                   <BookHeart className="w-8 h-8" />
                   <CardTitle className="font-headline text-3xl">{t('duaOfTheDay')}</CardTitle>
                 </div>
               </CardHeader>
               <CardContent className="flex-grow">
                {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ) : duaOfTheDay ? (
                    <div className="space-y-4">
                        <p className="font-arabic text-2xl text-right leading-loose" dir="rtl">{duaOfTheDay.arabic}</p>
                        <p className={cn("italic text-muted-foreground", language === 'ur' ? 'text-right font-urdu' : '')} dir={language === 'ur' ? 'rtl' : 'ltr'}>
                            {language === 'ur' ? duaOfTheDay.urduTranslation : duaOfTheDay.englishTranslation}
                        </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{t('duaNotAvailable')}</p>
                  )}
               </CardContent>
            </Card>
      </section>
    </div>
  );
}
