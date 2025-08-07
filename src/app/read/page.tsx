import { getSurahs, getSurah } from '@/lib/quran-api';
import { SurahList } from '@/components/quran/SurahList';
import { SurahDisplay } from '@/components/quran/SurahDisplay';
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

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
