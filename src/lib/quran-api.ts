import type { Surah, SurahDetails, SurahsApiResponse } from '@/types/quran';

const API_BASE_URL = 'https://api.alquran.cloud/v1';

// Cache for surah list to avoid re-fetching
let surahsCache: Surah[] | null = null;

export async function getSurahs(): Promise<Surah[]> {
  if (surahsCache) {
    return surahsCache;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/surah`);
    if (!response.ok) {
      throw new Error('Failed to fetch surahs');
    }
    const data: SurahsApiResponse = await response.json();
    surahsCache = data.data;
    return data.data;
  } catch (error) {
    console.error("Error fetching surahs:", error);
    return [];
  }
}

export async function getSurah(surahNumber: number): Promise<SurahDetails | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/surah/${surahNumber}/editions/quran-uthmani,en.sahih`);
    if (!response.ok) {
      throw new Error(`Failed to fetch surah ${surahNumber}`);
    }
    const data = await response.json();
    
    const arabicData = data.data[0];
    const englishData = data.data[1];

    if (!arabicData || !englishData) return null;

    const ayahs = arabicData.ayahs.map((ayah: any, index: number) => ({
      ...ayah,
      translation: englishData.ayahs[index].text,
    }));

    return {
      ...arabicData,
      ayahs,
    };

  } catch (error) {
    console.error(`Error fetching surah ${surahNumber}:`, error);
    return null;
  }
}

// Ayah-by-ayah recitation by Sheikh Sudais from everyayah.com
export function getAyahAudioUrl(ayahNumber: number, surahNumber: number): string {
    const paddedSurah = String(surahNumber).padStart(3, '0');
    // The API from everyayah.com needs the ayah number *within the surah*, not the global one.
    // The quran.cloud API provides this in the `numberInSurah` field.
    // However, my previous implementation was using the global ayah `number`, which was incorrect.
    // Let's assume the ayah object passed to the component has numberInSurah.
    // The AyahCard component seems to be using `ayah.number` which is the global number.
    // I need to find where the `ayah` object is coming from.
    // `SurahDisplay` gets ayahs from `getSurah`, and `AyahCard` receives it.
    // The API for `getSurah` returns ayahs with a global `number` and a `numberInSurah`.
    // The `AyahCard` uses `handlePlay(ayah.number)`, so it's passing the global number.
    // This is the bug. Let's look at `everyayah.com`'s format.
    // Example: https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/001001.mp3 is for Surah 1, Ayah 1.
    // It seems to be Surah number and Ayah number within surah.
    // Let's check `AyahCard.tsx` - it passes `ayah.number`. This is the global ayah number.
    // I need to change `AyahCard.tsx` to pass `ayah.numberInSurah`.
    // The API call needs `surahNumber` and `ayahNumberInSurah`. The current signature is `getAyahAudioUrl(ayahNumber: number, surahNumber: number)`.
    // It is being called with the global ayah number. This is wrong.
    // The API should probably receive the ayah number *in the surah*.

    // Let's correct the API function and then correct the call site.
    // This function should take ayahNumberInSurah.
    const paddedAyah = String(ayahNumber).padStart(3, '0');
    return `https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/${paddedSurah}${paddedAyah}.mp3`;
}


// Full surah recitation by Sheikh Sudais from a reliable source.
export function getSurahAudioUrl(surahNumber: number): string {
    const edition = 'ar.abdurrahmaansudais';
    const bitrate = '192';
    return `https://cdn.islamic.network/quran/audio-surah/${bitrate}/${edition}/${surahNumber}.mp3`;
}
