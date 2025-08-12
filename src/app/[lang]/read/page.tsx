
'use client';

import { getSurahs, getSurah } from '@/lib/quran-api';
import { SurahList } from '@/components/quran/SurahList';
import { SurahDisplay } from '@/components/quran/SurahDisplay';
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Suspense, useEffect, useState } from 'react';
import en from '@/locales/en.json';
import ur from '@/locales/ur.json';
import type { Surah, SurahDetails } from '@/types/quran';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const translations = { en, ur };

function ReadPageSkeleton() {
    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 md:hidden" />
                <Skeleton className="h-8 w-48" />
            </div>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-40" />
                            <Skeleton className="h-5 w-60" />
                        </div>
                        <Skeleton className="h-10 w-24" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-px w-full" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-4 p-4 rounded-lg border">
                           <div className="flex justify-between items-center">
                               <Skeleton className="h-10 w-10" />
                               <Skeleton className="h-8 w-4/5" />
                           </div>
                           <Skeleton className="h-px w-full" />
                           <Skeleton className="h-5 w-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}


export default function ReadPage({ params }: { params: { lang: 'en' | 'ur' }}) {
  const searchParams = useSearchParams();
  const surahNumber = Number(searchParams.get('surah')) || 1;
  const lang = params.lang || 'en';
  const t = translations[lang];

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [surahDetails, setSurahDetails] = useState<SurahDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [surahsData, surahDetailsData] = await Promise.all([
          getSurahs(),
          getSurah(surahNumber, lang)
        ]);
        setSurahs(surahsData);
        setSurahDetails(surahDetailsData);
      } catch (error) {
        console.error("Failed to fetch read page data", error);
        setSurahDetails(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [surahNumber, lang]);

  return (
    <SidebarProvider>
      <div className="flex -mx-4">
        <Sidebar>
          <SidebarContent>
            {surahs.length > 0 ? (
              <SurahList surahs={surahs} activeSurah={surahNumber} title={t.surahs} />
            ) : (
              <div className="p-4 space-y-2">
                  <p className="text-xl font-headline font-semibold mb-2 text-primary">{t.surahs}</p>
                  {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            )}
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
           {isLoading ? (
             <ReadPageSkeleton />
           ) : (
            <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <SidebarTrigger className="md:hidden" />
                  <h1 className="text-2xl font-headline font-bold">{t.readQuran}</h1>
                </div>
                {surahDetails ? (
                  <SurahDisplay surah={surahDetails} />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t.surahNotFound}</CardTitle>
                      <CardDescription>{t.surahNotFoundDescription}</CardDescription>
                    </CardHeader>
                  </Card>
                )}
            </div>
           )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
