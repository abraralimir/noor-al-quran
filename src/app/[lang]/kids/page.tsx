
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { BookHeart, Puzzle, Palette } from "lucide-react";
import Image from "next/image";

export default function KidsPage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: BookHeart,
      title: t('kidsStoriesTitle'),
      description: t('kidsStoriesDescription'),
      buttonText: t('kidsStoriesButton'),
      comingSoon: true,
    },
    {
      icon: Puzzle,
      title: t('kidsQuizzesTitle'),
      description: t('kidsQuizzesDescription'),
      buttonText: t('kidsQuizzesButton'),
      comingSoon: true,
    },
    {
      icon: Palette,
      title: t('kidsColoringTitle'),
      description: t('kidsColoringDescription'),
      buttonText: t('kidsColoringButton'),
      comingSoon: true,
    }
  ];

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary mb-4">
          {t('kidsCornerTitle')}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          {t('kidsCornerDescription')}
        </p>
      </section>

      <section className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl">
        <Image
          src="https://placehold.co/1000x400.png"
          alt={t('kidsImageAlt')}
          fill
          priority
          style={{ objectFit: 'cover' }}
          className="opacity-90"
          data-ai-hint="happy children reading"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col">
            <CardHeader className="flex-grow">
              <div className="mx-auto bg-accent/20 p-4 rounded-full w-fit">
                <feature.icon className="w-10 h-10 text-accent-foreground" />
              </div>
              <CardTitle className="font-headline mt-4">{feature.title}</CardTitle>
              <CardDescription>
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
               {feature.comingSoon && <div className="text-xs font-bold uppercase text-primary mb-2">{t('comingSoon')}</div>}
              <Button variant="default" className="bg-primary hover:bg-primary/90" disabled={feature.comingSoon}>
                {feature.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
