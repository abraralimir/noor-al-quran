
import { getSurahs } from '@/lib/quran-api';
import { SurahList } from '@/components/quran/SurahList';
import { SurahDisplay } from '@/components/quran/SurahDisplay';
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Read the Quran | Noor Al Quran',
  description: 'Immerse yourself in the Holy Quran. Read Surahs with a clean, readable interface and optional English translations. Navigate easily through all 114 chapters.',
  openGraph: {
    title: 'Read the Quran | Noor Al Quran',
    description: 'Immerse yourself in the Holy Quran with a clean interface and English translations.',
    url: '/read',
  },
  twitter: {
    title: 'Read the Quran | Noor Al Quran',
    description: 'Immerse yourself in the Holy Quran with a clean interface and English translations.',
  },
};

export default async function ReadPage({
  searchParams,
}: {
  searchParams?: { surah?: string };
}) {
  const surahNumber = Number(searchParams?.surah) || 1;
  const surahs = await getSurahs();

  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar>
          <SidebarContent>
            <Suspense fallback={<p>Loading Surahs...</p>}>
              <SurahList surahs={surahs} activeSurah={surahNumber} />
            </Suspense>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-2xl font-headline font-bold">Read Quran</h1>
            </div>
            <Suspense fallback={<SurahDisplaySkeleton />}>
              <SurahDisplay surahNumber={surahNumber} />
            </Suspense>
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
