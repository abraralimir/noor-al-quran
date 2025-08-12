
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { RadioPlayerCard } from '@/components/quran/RadioPlayerCard';

const radioStations = [
  {
    name: 'Quran Recitation (Abdul Rahman Al-Sudais)',
    streamUrl: 'https://Qurango.net/radio/sudais',
  },
  {
    name: 'Quran in English',
    streamUrl: 'https://Qurango.net/radio/translation_in_english',
  },
  {
    name: 'Quran in Urdu',
    streamUrl: 'https://Qurango.net/radio/urdu_translation',
  },
  {
    name: 'Quran Tafseer',
    streamUrl: 'https://qurango.net/radio/tafseer',
  },
];

export default function RadioPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">
          {t('radioPageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('radioPageDescription')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {radioStations.map((station) => (
          <RadioPlayerCard key={station.name} name={station.name} streamUrl={station.streamUrl} />
        ))}
      </div>
    </div>
  );
}
