

'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { BookOpen, Headphones, MessageCircleQuestion, ToyBrick } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const { t, language } = useTranslation();

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary mb-4">
          {t('noorAlQuran')}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          {t('appDescription')}
        </p>
      </section>

      <section className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
        <Image
          src="/book-1920.jpg"
          alt={t('quranImageAlt')}
          fill
          priority
          style={{ objectFit: 'cover' }}
          className="opacity-80"
          data-ai-hint="holy quran"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </section>


      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        <Card className="hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col">
          <CardHeader className="flex-grow">
            <div className="mx-auto bg-accent/20 p-4 rounded-full w-fit">
              <BookOpen className="w-10 h-10 text-accent-foreground" />
            </div>
            <CardTitle className="font-headline mt-4">{t('readQuranCardTitle')}</CardTitle>
            <CardDescription>
              {t('readQuranCardDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="default" className="bg-primary hover:bg-primary/90">
              <Link href={`/${language}/read`}>{t('startReading')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col">
          <CardHeader className="flex-grow">
            <div className="mx-auto bg-accent/20 p-4 rounded-full w-fit">
              <Headphones className="w-10 h-10 text-accent-foreground" />
            </div>
            <CardTitle className="font-headline mt-4">{t('listenCardTitle')}</CardTitle>
            <CardDescription>
              {t('listenCardDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="default" className="bg-primary hover:bg-primary/90">
              <Link href={`/${language}/listen`}>{t('listenNow')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col">
          <CardHeader className="flex-grow">
            <div className="mx-auto bg-accent/20 p-4 rounded-full w-fit">
              <MessageCircleQuestion className="w-10 h-10 text-accent-foreground" />
            </div>
            <CardTitle className="font-headline mt-4">{t('tutorCardTitle')}</CardTitle>
            <CardDescription>
              {t('tutorCardDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="default" className="bg-primary hover:bg-primary/90">
              <Link href={`/${language}/tutor`}>{t('askAQuestion')}</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col">
          <CardHeader className="flex-grow">
            <div className="mx-auto bg-accent/20 p-4 rounded-full w-fit">
              <ToyBrick className="w-10 h-10 text-accent-foreground" />
            </div>
            <CardTitle className="font-headline mt-4">{t('kidsCardTitle')}</CardTitle>
            <CardDescription>
              {t('kidsCardDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="default" className="bg-primary hover:bg-primary/90">
              <Link href={`/${language}/kids`}>{t('goToKidsCorner')}</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
