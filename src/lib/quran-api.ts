
import type { Surah, SurahDetails, Ayah, SutanlabSurah, SutanlabSurahDetails } from '@/types/quran';

const QURAN_API_BASE_URL = 'https://quranapi.pages.dev';

// Cache for surah list to avoid re-fetching
let surahsCache: Surah[] | null = null;

// Fetches the list of all Surahs.
export async function getSurahs(): Promise<Surah[]> {
  if (surahsCache) {
    return surahsCache;
  }
  try {
    const response = await fetch(`${QURAN_API_BASE_URL}/suras`);
    if (!response.ok) {
      throw new Error('Failed to fetch surahs from quranapi.pages.dev');
    }
    const data: SutanlabSurah[] = await response.json();
    
    // Map the response to our internal Surah type
    const mappedSurahs: Surah[] = data.map((surah) => ({
      number: surah.number,
      name: surah.name,
      englishName: surah.englishName,
      englishNameTranslation: surah.englishNameTranslation,
      revelationType: surah.revelation,
      numberOfAyahs: surah.numberOfAyahs,
    }));

    surahsCache = mappedSurahs;
    return mappedSurahs;
  } catch (error) {
    console.error("Error fetching surahs:", error);
    return [];
  }
}

// Fetches details for a single Surah.
export async function getSurah(surahNumber: number): Promise<SurahDetails | null> {
    try {
        const response = await fetch(`${QURAN_API_BASE_URL}/suras/${surahNumber}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch Surah ${surahNumber} from quranapi.pages.dev`);
        }
        const data: SutanlabSurahDetails = await response.json();
       
        const ayahs: Ayah[] = data.ayahs.map((ayah) => ({
            number: ayah.number.inQuran,
            audio: ayah.audio.primary,
            audioSecondary: ayah.audio.secondary,
            text: ayah.text.arab,
            numberInSurah: ayah.number.inSurah,
            juz: ayah.meta.juz,
            manzil: ayah.meta.manzil,
            page: ayah.meta.page,
            ruku: ayah.meta.ruku,
            hizbQuarter: ayah.meta.hizbQuarter,
            sajda: ayah.meta.sajda.obligatory || ayah.meta.sajda.recommended,
            translation: ayah.translation.en,
        }));

        return {
            number: data.number,
            name: data.name,
            englishName: data.englishName,
            englishNameTranslation: data.englishNameTranslation,
            revelationType: data.revelation,
            numberOfAyahs: data.numberOfAyahs,
            ayahs: ayahs,
        };

    } catch (error) {
        console.error(`Error fetching surah ${surahNumber}:`, error);
        return null;
    }
}


// Ayah-by-ayah recitation by Sheikh Sudais from the CDN
// This uses the GLOBAL ayah number.
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
