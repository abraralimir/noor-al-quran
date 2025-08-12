
'use server';
import { getHijriCalendar, getHijriDate } from "@/lib/calendar-api";
import type { CalendarDay } from "@/types/calendar";

export async function fetchHijriCalendar(latitude: number, longitude: number, month: number, year: number): Promise<CalendarDay[] | null> {
    try {
        const calendar = await getHijriCalendar(latitude, longitude, month, year);
        return calendar;
    } catch (error) {
        console.error("Failed to fetch Hijri calendar:", error);
        return null;
    }
}

export async function fetchTodaysHijriDate(latitude: number, longitude: number): Promise<CalendarDay | null> {
    try {
        // Lat/long might be used in the future to adjust for local moonsighting.
        // For now, it ensures consistency.
        const date = await getHijriDate(latitude, longitude);
        return date;
    } catch (error) {
        console.error("Failed to fetch today's Hijri date:", error);
        return null;
    }
}
