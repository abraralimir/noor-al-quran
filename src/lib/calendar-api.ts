
import type { AlAdhanCalendarResponse, CalendarDay } from '@/types/calendar';

const ALADHAN_API_BASE_URL = 'https://api.aladhan.com/v1';

export async function getHijriCalendar(
    latitude: number, 
    longitude: number, 
    month: number, 
    year: number
): Promise<CalendarDay[] | null> {
    try {
        const response = await fetch(`${ALADHAN_API_BASE_URL}/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=2`);
        if (!response.ok) {
            throw new Error('Failed to fetch calendar data from AlAdhan API');
        }
        const data: AlAdhanCalendarResponse = await response.json();

        if (data.code === 200 && Array.isArray(data.data)) {
            return data.data;
        } else {
            throw new Error((data as any).status || 'Unknown error from AlAdhan API');
        }

    } catch (error) {
        console.error("Error fetching Hijri calendar:", error);
        return null;
    }
}


export async function getHijriDate(latitude: number, longitude: number): Promise<CalendarDay | null> {
    try {
        const date = new Date();
        const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
        
        const response = await fetch(`${ALADHAN_API_BASE_URL}/gToH?date=${dateString}`);
        if(!response.ok) {
            throw new Error('Failed to fetch Hijri date');
        }

        const data: AlAdhanCalendarResponse = await response.json();
        
        if (data.code === 200 && !Array.isArray(data.data)) {
            return {
                timings: {}, // Timings are not relevant for a single date conversion
                date: data.data
            };
        } else {
            throw new Error((data as any).status || 'Unknown error from AlAdhan API');
        }

    } catch(error) {
        console.error("Error fetching Hijri date:", error);
        return null;
    }
}
