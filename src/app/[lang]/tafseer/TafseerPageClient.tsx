
'use client';

import { useState, useEffect } from 'react';
import type { Surah } from '@/types/quran';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import { getSurahTafseer, Tafseer } from '@/actions/quran';
import { LoaderCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { TafseerPlayer } from '@/components/quran/TafseerPlayer';
import { Separator } from '@/components/ui/separator';

interface TafseerPageClientProps {
  surahs: Surah[];
}

export function TafseerPageClient({ surahs }: TafseerPageClientProps) {
  const { t, language } = useTranslation();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Tafseer | null>(null);
  const [selectedSurah, setSelectedSurah] = useState<string>(searchParams.get('surah') || '');

  const handleFetchTafseer = async (surahNumStr: string) => {
    if (!surahNumStr) return;
    const surahNum = parseInt(surahNumStr, 10);
    if (isNaN(surahNum)) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
        const response = await getSurahTafseer(surahNum, language);
        if (response) {
            setResult(response);
        } else {
            setError(t('surahNotFoundDescription'));
        }
    } catch (e) {
        if (e instanceof Error) {
          console.error(e.message);
        }
        setError(t('tutorPageDescription'));
    } finally {
        setIsLoading(false);
    }
  }

  useEffect(() => {
    const surahParam = searchParams.get('surah');
    if (surahParam) {
      setSelectedSurah(surahParam);
      handleFetchTafseer(surahParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, language]);

  const handleSurahChange = (surahNum: string) => {
    setSelectedSurah(surahNum);
    handleFetchTafseer(surahNum);
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('selectSurahForTafseer')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleSurahChange} defaultValue={selectedSurah}>
            <SelectTrigger>
              <SelectValue placeholder={t('selectSurahPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {surahs.map(surah => (
                <SelectItem key={surah.number} value={surah.number.toString()}>
                  {surah.number}. {surah.englishName} ({surah.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex justify-center items-center p-8">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
         <Alert variant="destructive">
            <AlertTitle>{t('error')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <>
        <TafseerPlayer
            key={result.surah_number + language}
            surahName={result.surah_name}
            tafseerName={result.tafseer_name}
            audioUrl={result.audioUrl}
            initialLanguage={language}
            onLanguageChange={(newLang) => {
              // Re-fetch with new language audio
              getSurahTafseer(result.surah_number, newLang).then(newResult => {
                if (newResult) setResult(newResult);
              });
            }}
        />
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{t('readTafseer')}</CardTitle>
                <CardDescription>{t('tafseerBy')} {result.tafseer_name}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full space-y-6">
                    {result.ayahs.map((ayah, index) => (
                       <div key={ayah.ayah} className="space-y-2">
                           <p className="font-bold text-lg">{t('ayah')} {ayah.ayah}</p>
                           <p className={cn("px-4 text-base", language === 'ur' ? 'text-right font-urdu' : '')} dir={language === 'ur' ? 'rtl' : 'ltr'}>
                               {ayah.text || "No Tafseer text available for this Ayah."}
                           </p>
                           {index < result.ayahs.length - 1 && <Separator />}
                       </div>
                    ))}
                </div>
            </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}
