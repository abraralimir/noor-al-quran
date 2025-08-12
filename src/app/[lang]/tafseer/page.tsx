
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSurahs } from '@/lib/quran-api';
import { TafseerPageClient } from './TafseerPageClient';
import en from '@/locales/en.json';
import ur from '@/locales/ur.json';

const translations = { en, ur };

function TafseerPageSkeleton({ lang }: { lang: 'en' | 'ur' }) {
  const t = translations[lang];
  return (
    <Card>
      <CardHeader>
        <CardTitle><Skeleton className="h-8 w-48" /></CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}

export default async function TafseerPage({ params }: { params: { lang: 'en' | 'ur' } }) {
  const surahs = await getSurahs();
  const t = translations[params.lang] || translations.en;
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">
            {t.tafseerPageTitle}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t.tafseerPageDescription}
          </p>
      </div>
      <Suspense fallback={<TafseerPageSkeleton lang={params.lang} />}>
        <TafseerPageClient surahs={surahs} />
      </Suspense>
    </div>
  );
}
