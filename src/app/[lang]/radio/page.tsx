
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { Radio } from 'lucide-react';

const radioStations = [
  {
    name: 'Quran Recitation (Mishary Al-Afasy)',
    location: 'Kuwait',
    streamUrl: 'https://qurango.net/radio/mishary',
  },
  {
    name: 'Quran Recitation (Abdul Rahman Al-Sudais)',
    location: 'Saudi Arabia',
    streamUrl: 'https://qurango.net/radio/abdulrahman_alsudaes',
  },
  {
    name: 'Quran in English',
    location: 'USA',
    streamUrl: 'https://qurango.net/radio/english',
  },
  {
    name: 'Quran in Urdu',
    location: 'Pakistan',
    streamUrl: 'https://qurango.net/radio/urdu',
  },
  {
    name: 'Quran Tafseer',
    location: 'Saudi Arabia',
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
          <Card key={station.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Radio className="w-6 h-6 text-primary" />
                <span>{station.name}</span>
              </CardTitle>
              <CardDescription>{station.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <audio controls className="w-full">
                <source src={station.streamUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
