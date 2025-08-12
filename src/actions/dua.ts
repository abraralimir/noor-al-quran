
'use server';
import { getDuaOfTheDay } from "@/lib/dua-api";
import type { Dua } from "@/types/dua";

export async function fetchDuaOfTheDay(): Promise<Dua | null> {
    try {
        const dua = await getDuaOfTheDay();
        return dua;
    } catch (error) {
        console.error("Failed to fetch Dua of the day:", error);
        return null;
    }
}
