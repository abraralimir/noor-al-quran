import type { Surah, SurahDetails, SurahsApiResponse, AlquranCloudSurahDetails } from '@/types/quran';

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
          throw new Error(`Failed to fetch Surah ${surahNumber} from API`);
        }
        const result: AlquranCloudSurahDetails = await response.json();
        
        if (result.code !== 200 || result.status !== "OK") {
            throw new Error(`API returned an error for Surah ${surahNumber}: ${result.status}`);
        }

        const arabicData = result.data[0];
        const translationData = result.data[1];

        const ayahs = arabicData.ayahs.map((ayah, index) => ({
            number: ayah.number,
            // The audio URLs from this API are different, so we construct our own for consistency
            audio: getAyahAudioUrl(ayah.number),
            audioSecondary: [], // This API doesn't provide secondary audio sources
            text: ayah.text,
            numberInSurah: ayah.numberInSurah,
            juz: ayah.juz,
            manzil: ayah.manzil,
            page: ayah.page,
            ruku: ayah.ruku,
            hizbQuarter: ayah.hizbQuarter,
            sajda: !!ayah.sajda, // Coerce sajda to a simple boolean
            translation: translationData.ayahs[index].text,
        }));

        return {
            number: arabicData.number,
            name: arabicData.name,
            englishName: arabicData.englishName,
            englishNameTranslation: arabicData.englishNameTranslation,
            revelationType: arabicData.revelationType,
            numberOfAyahs: arabicData.numberOfAyahs,
            ayahs: ayahs,
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
