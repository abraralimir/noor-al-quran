import { getSurah } from '@/lib/quran-api';
import { AyahCard } from './AyahCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SurahDisplayProps {
  surahNumber: number;
}

export async function SurahDisplay({ surahNumber }: SurahDisplayProps) {
  const surah = await getSurah(surahNumber);

  if (!surah) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Surah Not Found</CardTitle>
          <CardDescription>The requested Surah could not be loaded. Please try again.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-4xl font-headline">{surah.englishName}</CardTitle>
            <CardDescription>{surah.englishNameTranslation}</CardDescription>
          </div>
          <p className="text-4xl font-arabic font-bold text-primary">{surah.name}</p>
        </div>
      </CardHeader>
      <CardContent>
        <AyahCard ayahs={surah.ayahs} surahNumber={surahNumber} />
      </CardContent>
    </Card>
  );
}
