import { SurahAudioPlayer } from '@/components/quran/SurahAudioPlayer';
import { getSurahs } from '@/lib/quran-api';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ListenPage({
  searchParams,
}: {
  searchParams?: { surah?: string };
}) {
  const surahs = await getSurahs();
  const initialSurah = searchParams?.surah;
  
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Listen to the Quran</CardTitle>
          <CardDescription>Select a Surah to listen to the beautiful recitation by Mishary Rashid Alafasy.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p>Loading audio player...</p>}>
            <SurahAudioPlayer surahs={surahs} initialSurahNumber={initialSurah} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
