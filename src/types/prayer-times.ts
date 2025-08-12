
export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha' | 'Sunset';

export interface Timings {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
    Firstthird: string;
    Lastthird: string;
}

export interface DateInfo {
    readable: string;
    timestamp: string;
    hijri: any; // Can be expanded if needed
    gregorian: any; // Can be expanded if needed
}

export interface Meta {
    latitude: number;
    longitude: number;
    timezone: string;
    method: any; // Can be expanded
    latitudeAdjustmentMethod: string;
    midnightMode: string;
    school: string;
    offset: Record<string, number>;
}

export interface PrayerTimes {
    timings: Timings;
    date: DateInfo;
    meta: Meta;
}

export interface AlAdhanResponse {
    code: number;
    status: string;
    data: PrayerTimes;
}
