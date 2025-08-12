
'use client';
import { useEffect, useState } from 'react';
import { fetchPrayerTimes } from '@/actions/prayer-times';
import type { PrayerTimes, PrayerName } from '@/types/prayer-times';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Sun, Sunrise, Sunset, Moon, CloudSun, CloudMoon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const prayerIcons: Record<PrayerName, React.ElementType> = {
    Fajr: CloudMoon,
    Sunrise: Sunrise,
    Dhuhr: Sun,
    Asr: CloudSun,
    Maghrib: Sunset,
    Isha: Moon,
    Sunset: Sunset, // Adding sunset explicitly
};

export function PrayerTimesPageClient() {
    const { t } = useTranslation();
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locationInfo, setLocationInfo] = useState<{ city: string; country: string } | null>(null);

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const times = await fetchPrayerTimes(latitude, longitude);
                        if (times) {
                            setPrayerTimes(times);
                            setLocationInfo({
                                city: times.meta.timezone.split('/')[1]?.replace('_', ' ') || 'Unknown City',
                                country: times.meta.timezone.split('/')[0] || 'Unknown Country'
                            });
                        } else {
                            setError(t('prayerTimesError'));
                        }
                    } catch (e) {
                        setError(t('prayerTimesError'));
                    } finally {
                        setLoading(false);
                    }
                },
                () => {
                    setError(t('locationPermissionError'));
                    setLoading(false);
                }
            );
        } else {
            setError(t('geolocationNotSupported'));
            setLoading(false);
        }
    }, [t]);

    const displayOrder: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
                <p className="ml-4 text-lg text-muted-foreground">{t('fetchingPrayerTimes')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>{t('error')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold">{locationInfo?.city}, {locationInfo?.country}</h2>
                <p className="text-muted-foreground">{prayerTimes?.date.readable}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {displayOrder.map(name => {
                    const Icon = prayerIcons[name];
                    return (
                        <Card key={name} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <CardHeader className="flex flex-col items-center gap-2">
                                <Icon className="w-10 h-10 text-primary" />
                                <CardTitle className="font-headline text-xl">{t(name as any) || name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-foreground">
                                    {prayerTimes?.timings[name].split(' ')[0]}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
