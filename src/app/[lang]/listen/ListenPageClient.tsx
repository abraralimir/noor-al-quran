'use client';

import { SurahAudioPlayer } from '@/components/quran/SurahAudioPlayer';
import { getSurahs } from '@/lib/quran-api';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Surah } from '@/types/quran';
import { useTranslation } from '@/hooks/use-translation';
import { useSearchParams } from 'next/navigation';

export function ListenPageClient() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const initialSurah = searchParams.get('surah');

  useEffect(() => {
    async function fetchSurahs() {
      const surahList = await getSurahs();
      setSurahs(surahList);
    }
    fetchSurahs();
  }, []);
  
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{t('listenToTheQuran')}</CardTitle>
          <CardDescription>{t('listenToTheQuranDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <SurahAudioPlayer surahs={surahs} initialSurahNumber={initialSurah ?? undefined} />
        </CardContent>
      </Card>
    </div>
  );
}
