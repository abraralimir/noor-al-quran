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

async function fetchEdition(surahNumber: number, edition: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/surah/${surahNumber}/${edition}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch surah ${surahNumber} for edition ${edition}`);
  }
  const json = await response.json();
  return json.data;
}


export async function getSurah(surahNumber: number): Promise<SurahDetails | null> {
  try {
    const [arabicData, englishData, tafseerData] = await Promise.all([
      fetchEdition(surahNumber, 'quran-uthmani'),
      fetchEdition(surahNumber, 'en.sahih'),
      fetchEdition(surahNumber, 'en.jalalayn'),
    ]);

    if (!arabicData || !englishData || !tafseerData) return null;

    const ayahs = arabicData.ayahs.map((ayah: any, index: number) => ({
      ...ayah,
      translation: englishData.ayahs[index]?.text || '',
      tafseer: tafseerData.ayahs[index]?.text || '',
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

// Ayah-by-ayah recitation by Sheikh Sudais from the CDN
export function getAyahAudioUrl(ayahNumber: number): string {
    const edition = 'ar.abdurrahmaansudais';
    const bitrate = '64';
    return `https://cdn.islamic.network/quran/audio/${bitrate}/${edition}/${ayahNumber}.mp3`;
}

// Full surah recitation by Sheikh Alafasy from the CDN.
export function getSurahAudioUrl(surahNumber: number): string {
    const edition = 'ar.alafasy';
    const bitrate = '128';
    return `https://cdn.islamic.network/quran/audio-surah/${bitrate}/${edition}/${surahNumber}.mp3`;
}
