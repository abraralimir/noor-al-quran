
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import en from '@/locales/en.json';
import ur from '@/locales/ur.json';
import { CalendarPageClient } from './CalendarPageClient';

const translations = { en, ur };

function CalendarPageSkeleton({ lang }: { lang: 'en' | 'ur' }) {
    const t = translations[lang];
    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-7 gap-2">
                    {[...Array(35)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function CalendarPage({ params }: { params: { lang: 'en' | 'ur' } }) {
    const t = translations[params.lang] || translations.en;
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">
                    {t.islamicCalendar}
                </h1>
                <p className="text-lg text-muted-foreground">
                    {t.islamicCalendarDescription}
                </p>
            </div>
            <Suspense fallback={<CalendarPageSkeleton lang={params.lang} />}>
                <CalendarPageClient />
            </Suspense>
        </div>
    );
}
