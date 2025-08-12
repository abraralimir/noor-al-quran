
import type { PrayerTimes, AlAdhanResponse } from '@/types/prayer-times';

const ALADHAN_API_BASE_URL = 'https://api.aladhan.com/v1/timings';

export async function getPrayerTimes(latitude: number, longitude: number): Promise<PrayerTimes | null> {
    const date = new Date();
    const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    // Method 2: ISNA (Islamic Society of North America)
    const method = 2;

    try {
        const response = await fetch(`${ALADHAN_API_BASE_URL}/${dateString}?latitude=${latitude}&longitude=${longitude}&method=${method}`);
        if (!response.ok) {
            throw new Error('Failed to fetch prayer times from AlAdhan API');
        }
        const data: AlAdhanResponse = await response.json();

        if (data.code === 200) {
            return data.data;
        } else {
            throw new Error(data.status || 'Unknown error from AlAdhan API');
        }

    } catch (error) {
        console.error("Error fetching prayer times:", error);
        return null;
    }
}
