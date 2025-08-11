
import { getSurahs, getSurah } from '@/lib/quran-api';
import { SurahList } from '@/components/quran/SurahList';
import { SurahDisplay } from '@/components/quran/SurahDisplay';
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default async function ReadPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const surahNumber = Number(searchParams?.surah) || 1;
  const cookieStore = cookies();
  const language = cookieStore.get('lang')?.value === 'ur' ? 'ur' : 'en';
  const surahT = language === 'ur' ? 'سورتیں' : 'Surahs';
  const readT = language === 'ur' ? 'قرآن پڑھیں' : 'Read Quran';
  const loadingT = language === 'ur' ? 'سورتیں لوڈ ہو رہی ہیں...' : 'Loading Surahs...';
  const notFoundT = language === 'ur' ? 'سورت نہیں ملی' : 'Surah Not Found';
  const notFoundDescT = language === 'ur' ? 'درخواست کردہ سورت لوڈ نہیں کی جا سکی۔ براہ مہربانی دوبارہ کوشش کریں.' : 'The requested Surah could not be loaded. Please try again.';

  const [surahs, surahDetails] = await Promise.all([
    getSurahs(),
    getSurah(surahNumber, language)
  ]);

  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar>
          <SidebarContent>
            <Suspense fallback={<p className="p-4">{loadingT}</p>}>
              <SurahList surahs={surahs} activeSurah={surahNumber} title={surahT} />
            </Suspense>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-2xl font-headline font-bold">{readT}</h1>
            </div>
            {surahDetails ? (
              <SurahDisplay surah={surahDetails} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{notFoundT}</CardTitle>
                  <CardDescription>{notFoundDescT}</CardDescription>
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
