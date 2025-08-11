import { Suspense } from 'react';
import { ListenPageClient } from './ListenPageClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getSurahs } from '@/lib/quran-api';
import { useTranslation } from '@/hooks/use-translation';
import en from '@/locales/en.json';
import ur from '@/locales/ur.json';

const translations = { en, ur };

function ListenPageSkeleton({ lang }: { lang: 'en' | 'ur' }) {
  const t = translations[lang];
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl"><Skeleton className="h-8 w-48" /></CardTitle>
          <CardDescription><Skeleton className="h-5 w-full" /></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function ListenPage({ params }: { params: { lang: 'en' | 'ur' } }) {
  const surahs = await getSurahs();
  const t = translations[params.lang] || translations.en;
  
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{t.listenToTheQuran}</CardTitle>
          <CardDescription>{t.listenToTheQuranDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ListenPageSkeleton lang={params.lang} />}>
            <ListenPageClient surahs={surahs} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
