

import { getSurahs, getSurah } from '@/lib/quran-api';
import { SurahList } from '@/components/quran/SurahList';
import { SurahDisplay } from '@/components/quran/SurahDisplay';
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import en from '@/locales/en.json';
import ur from '@/locales/ur.json';

const translations = { en, ur };

export const dynamic = 'force-dynamic';

export default async function ReadPage({ params, searchParams }: { params: { lang: 'en' | 'ur' }, searchParams?: { [key: string]: string | string[] | undefined } }) {
  const surahNumber = Number(searchParams?.surah) || 1;
  const lang = params.lang || 'en';
  const t = translations[lang];
  
  const [surahs, surahDetails] = await Promise.all([
    getSurahs(),
    getSurah(surahNumber, lang)
  ]);

  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar>
          <SidebarContent>
            <Suspense fallback={<p className="p-4">{t.loadingSurahs}</p>}>
              <SurahList surahs={surahs} activeSurah={surahNumber} title={t.surahs} />
            </Suspense>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
