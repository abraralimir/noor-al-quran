
import { Suspense } from 'react';
import { PrayerTimesPageClient } from './PrayerTimesPageClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import en from '@/locales/en.json';
import ur from '@/locales/ur.json';

const translations = { en, ur };

function PrayerTimesSkeleton({ lang }: { lang: 'en' | 'ur' }) {
    const t = translations[lang];
    return (
        <div className="space-y-4">
            <div className="text-center space-y-2">
                <Skeleton className="h-6 w-48 mx-auto" />
                <Skeleton className="h-5 w-64 mx-auto" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(7)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default function PrayerTimesPage({ params }: { params: { lang: 'en' | 'ur' } }) {
    const t = translations[params.lang] || translations.en;
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">
                    {t.prayerTimesTitle}
                </h1>
                <p className="text-lg text-muted-foreground">
                    {t.prayerTimesDescription}
                </p>
            </div>
            <Suspense fallback={<PrayerTimesSkeleton lang={params.lang} />}>
                <PrayerTimesPageClient />
            </Suspense>
        </div>
    );
}
