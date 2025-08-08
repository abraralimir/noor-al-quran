import { SurahAudioPlayer } from '@/components/quran/SurahAudioPlayer';
import { getSurahs } from '@/lib/quran-api';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const surahNumber = searchParams?.surah ? Number(searchParams.surah) : null;
  const surahs = await getSurahs();
  const surah = surahNumber ? surahs.find(s => s.number === surahNumber) : null;

  if (surah) {
    const title = `Listen to Surah ${surah.englishName}`;
    const description = `Experience the divine verses of Surah ${surah.englishName} through beautiful audio recitation by Sheikh Mishary Rashid Alafasy.`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `/listen?surah=${surahNumber}`,
      },
      twitter: {
        title,
        description,
      },
    };
  }

  // Default metadata
  return {
    title: 'Listen to the Quran',
    description: 'Experience the divine verses through beautiful audio recitations by Sheikh Mishary Rashid Alafasy. Create custom playlists and listen seamlessly.',
    openGraph: {
      title: 'Listen to the Quran',
      description: 'Experience beautiful audio recitations and create custom playlists.',
      url: '/listen',
    },
    twitter: {
      title: 'Listen to the Quran',
      description: 'Experience beautiful audio recitations and create custom playlists.',
    },
  };
}


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
