
'use server';

import { getHadith } from '@/lib/hadith-api';
import type { Hadith } from '@/types/hadith';

export async function getHadithOfTheDay(): Promise<Hadith | null> {
  try {
    const hadith = await getHadith();
    return hadith;
  } catch (error) {
    console.error("Failed to fetch Hadith of the day:", error);
    return null;
  }
}
