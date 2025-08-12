
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

// Default location (Mecca)
const DEFAULT_LATITUDE = 21.4225;
const DEFAULT_LONGITUDE = 39.8262;

export function PrayerTimesPageClient() {
    const { t } = useTranslation();
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locationInfo, setLocationInfo] = useState<{ city: string; country: string } | null>(null);

    const getCityName = async (latitude: number, longitude: number) => {
        try {
            // Using a free, no-key-required reverse geocoding API
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            if (!response.ok) return null;
            const data = await response.json();
            return { city: data.city || 'Unknown City', country: data.countryName || 'Unknown Country' };
        } catch (error) {
            console.error("Could not fetch city name:", error);
            return null;
        }
    };

    const loadPrayerTimes = async (latitude: number, longitude: number) => {
        setLoading(true);
        setError(null);
        try {
            const [times, location] = await Promise.all([
                fetchPrayerTimes(latitude, longitude),
                getCityName(latitude, longitude)
            ]);

            if (times) {
                setPrayerTimes(times);
                if (location) {
                    setLocationInfo(location);
                } else {
                    // Fallback to timezone if reverse geocoding fails
                    setLocationInfo({
                        city: times.meta.timezone.split('/')[1]?.replace('_', ' ') || 'Mecca',
                        country: times.meta.timezone.split('/')[0] || 'Saudi Arabia'
                    });
                }
            } else {
                setError(t('prayerTimesError'));
            }
        } catch (e) {
            setError(t('prayerTimesError'));
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    loadPrayerTimes(position.coords.latitude, position.coords.longitude);
                },
                () => {
                    setError(t('locationPermissionError'));
                    // Load default location if permission is denied
                    loadPrayerTimes(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
                }
            );
        } else {
            setError(t('geolocationNotSupported'));
            // Load default location if geolocation is not supported
            loadPrayerTimes(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    return (
        <div className="space-y-6">
             {error && (
                <Alert variant="destructive">
                    <AlertTitle>{t('error')}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="text-center">
                <h2 className="text-2xl font-bold">{locationInfo?.city}, {locationInfo?.country}</h2>
                <p className="text-muted-foreground">{prayerTimes?.date.readable}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {prayerTimes ? displayOrder.map(name => {
                    const Icon = prayerIcons[name];
                    return (
                        <Card key={name} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <CardHeader className="flex flex-col items-center gap-2">
                                <Icon className="w-10 h-10 text-primary" />
                                <CardTitle className="font-headline text-xl">{t(name as any) || name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-foreground">
                                    {prayerTimes?.timings[name as keyof typeof prayerTimes.timings]?.split(' ')[0]}
                                </p>
                            </CardContent>
                        </Card>
                    );
                }) : (
                     <p>{t('prayerTimesError')}</p>
                )}
            </div>
        </div>
    );
}
