'use client';

import { SurahAudioPlayer } from '@/components/quran/SurahAudioPlayer';
import type { Surah } from '@/types/quran';
import { useTranslation } from '@/hooks/use-translation';
import { useSearchParams } from 'next/navigation';

interface ListenPageClientProps {
  surahs: Surah[];
}

export function ListenPageClient({ surahs }: ListenPageClientProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const initialSurah = searchParams.get('surah');
  
  return (
    <div className="max-w-2xl mx-auto">
      <SurahAudioPlayer surahs={surahs} initialSurahNumber={initialSurah ?? undefined} />
    </div>
  );
}
