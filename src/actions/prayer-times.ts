
'use server';
import { getPrayerTimes } from "@/lib/prayer-times-api";
import type { PrayerTimes } from "@/types/prayer-times";

export async function fetchPrayerTimes(latitude: number, longitude: number): Promise<PrayerTimes | null> {
    try {
        const prayerTimes = await getPrayerTimes(latitude, longitude);
        return prayerTimes;
    } catch (error) {
        console.error("Failed to fetch prayer times:", error);
        return null;
    }
}
