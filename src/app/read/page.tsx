
'use client';

import { getSurahs, getSurah } from '@/lib/quran-api';
import { SurahList } from '@/components/quran/SurahList';
import { SurahDisplay } from '@/components/quran/SurahDisplay';
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/use-translation';
import type { Surah, SurahDetails } from '@/types/quran';

export default function ReadPage() {
  const searchParams = useSearchParams();
  const surahNumber = Number(searchParams.get('surah')) || 1;
  const { language } = useLanguage();
  const { t } = useTranslation();

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [surahDetails, setSurahDetails] = useState<SurahDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [surahsData, surahDetailsData] = await Promise.all([
        getSurahs(),
        getSurah(surahNumber, language)
      ]);
      setSurahs(surahsData);
      setSurahDetails(surahDetailsData);
      setIsLoading(false);
    }
    loadData();
  }, [surahNumber, language]);

  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar>
          <SidebarContent>
            <Suspense fallback={<p>{t('loadingSurahs')}</p>}>
              <SurahList surahs={surahs} activeSurah={surahNumber} />
            </Suspense>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-2xl font-headline font-bold">{t('readQuran')}</h1>
            </div>
            {isLoading ? (
              <SurahDisplaySkeleton />
            ) : surahDetails ? (
              <SurahDisplay surah={surahDetails} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{t('surahNotFound')}</CardTitle>
                  <CardDescription>{t('surahNotFoundDescription')}</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function SurahDisplaySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/2" />
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
