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
    const paddedAyah = String(ayahNumber).padStart(3, '0');
    // Note: everyayah.com uses the global ayah number, not numberInSurah.
    // However, the quran.cloud API provides the global ayah number in the `number` field.
    return `https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/${paddedSurah}${paddedAyah}.mp3`;
}

// Full surah recitation by Sheikh Sudais from a reliable source.
export function getSurahAudioUrl(surahNumber: number): string {
    const paddedSurah = String(surahNumber).padStart(3, '0');
    return `https://download.quranicaudio.com/quran/abdurrahmaan_as-sudais/${paddedSurah}.mp3`;
}
