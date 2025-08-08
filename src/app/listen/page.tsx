import { SurahAudioPlayer } from '@/components/quran/SurahAudioPlayer';
import { getSurahs } from '@/lib/quran-api';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Listen to the Quran | Noor Al Quran',
  description: 'Experience the divine verses through beautiful audio recitations by Sheikh Mishary Rashid Alafasy. Create custom playlists and listen seamlessly.',
  openGraph: {
    title: 'Listen to the Quran | Noor Al Quran',
    description: 'Experience beautiful audio recitations and create custom playlists.',
    url: '/listen',
  },
  twitter: {
    title: 'Listen to the Quran | Noor Al Quran',
    description: 'Experience beautiful audio recitations and create custom playlists.',
  },
};

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
