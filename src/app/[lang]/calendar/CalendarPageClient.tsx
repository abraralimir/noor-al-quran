
'use client';
import { useEffect, useState } from 'react';
import { fetchHijriCalendar } from '@/actions/calendar';
import type { CalendarDay } from '@/types/calendar';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoaderCircle, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils';


export function CalendarPageClient() {
    const { t, language } = useTranslation();
    const [calendarData, setCalendarData] = useState<CalendarDay[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                () => {
                    // Fallback to a default location (Mecca) if permission is denied
                    setLocation({ latitude: 21.4225, longitude: 39.8262 });
                    setError(t('locationPermissionError'));
                }
            );
        } else {
            setLocation({ latitude: 21.4225, longitude: 39.8262 });
             setError(t('geolocationNotSupported'));
        }
    }, [t]);

    useEffect(() => {
        if (!location) return;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        setLoading(true);

        fetchHijriCalendar(location.latitude, location.longitude, month, year)
            .then(data => {
                if (data) {
                    setCalendarData(data);
                } else {
                    setError(t('calendarError'));
                }
            })
            .catch(() => setError(t('calendarError')))
            .finally(() => setLoading(false));

    }, [currentDate, location, t]);

    const handlePreviousMonth = () => {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
    };

    const today = new Date();
    const todayDateString = today.toLocaleDateString();

    const weekDays = language === 'ur' 
        ? ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="font-headline text-2xl">
                    {currentDate.toLocaleString(language === 'ur' ? 'ur-PK' : 'en-US', { month: 'long', year: 'numeric' })}
                </CardTitle>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="flex items-center justify-center h-96">
                        <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
                    </div>
                )}
                {error && !loading && (
                     <Alert variant="destructive">
                        <AlertTitle>{t('error')}</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {!loading && calendarData && (
                    <div className="grid grid-cols-7 gap-1 md:gap-2">
                        {weekDays.map(day => (
                            <div key={day} className="text-center font-bold text-muted-foreground pb-2">{day}</div>
                        ))}
                        {calendarData.map(day => {
                             const isToday = new Date(day.date.gregorian.date.split('-').reverse().join('-')).toLocaleDateString() === todayDateString;
                             const isCurrentMonth = parseInt(day.date.gregorian.month.number, 10) === (currentDate.getMonth() + 1);
                             const hasHoliday = day.date.hijri.holidays.length > 0;
                             
                             const DayCell = (
                                <div
                                    key={day.date.readable}
                                    className={cn(
                                        "border rounded-lg p-2 h-24 md:h-32 flex flex-col justify-between relative",
                                        !isCurrentMonth && "bg-muted/50 text-muted-foreground",
                                        isToday && "border-2 border-primary bg-primary/10",
                                        hasHoliday && "cursor-pointer hover:bg-accent/50"
                                    )}
                                >
                                   <div className="flex justify-between items-start">
                                      <p className="font-bold text-lg">{day.date.gregorian.day}</p>
                                      <p className="font-arabic font-semibold text-sm text-muted-foreground">{day.date.hijri.day}</p>
                                   </div>
                                    <div className="text-right">
                                        <p className="font-arabic text-xs text-muted-foreground">{day.date.hijri.month.ar}</p>
                                    </div>
                                     {hasHoliday && (
                                        <div className="absolute bottom-2 right-2">
                                            <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                                        </div>
                                    )}
                                </div>
                             )
                             
                             if (hasHoliday) {
                                return (
                                    <AlertDialog key={day.date.readable}>
                                        <AlertDialogTrigger asChild>
                                            {DayCell}
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Islamic Event</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {day.date.hijri.holidays.join(', ')}
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogAction>Close</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )
                             }

                             return DayCell;
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
