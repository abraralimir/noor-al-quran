import type { Surah, SurahDetails, SurahsApiResponse, SutanlabSurahDetails } from '@/types/quran';

// Using two different APIs. One for the list of surahs (as it's cached and has the structure we want)
// And a more reliable one for the detailed surah content.
const ALQURAN_CLOUD_API_BASE_URL = 'https://api.alquran.cloud/v1';
const SUTANLAB_API_BASE_URL = 'https://api.alquran.sutanlab.id';


// Cache for surah list to avoid re-fetching
let surahsCache: Surah[] | null = null;

export async function getSurahs(): Promise<Surah[]> {
  if (surahsCache) {
    return surahsCache;
  }
  try {
    const response = await fetch(`${ALQURAN_CLOUD_API_BASE_URL}/surah`);
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
    const response = await fetch(`${SUTANLAB_API_BASE_URL}/surah/${surahNumber}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Surah ${surahNumber} from sutanlab API`);
    }

    const result: SutanlabSurahDetails = await response.json();
    const surahData = result.data;

    // Map the data from sutanlab API to our internal SurahDetails type
    const ayahs = surahData.verses.map(v => ({
      number: v.number.inQuran,
      audio: v.audio.primary,
      audioSecondary: [v.audio.secondary[0]], // just taking the first for now
      text: v.text.arab,
      numberInSurah: v.number.inSurah,
      juz: v.meta.juz,
      manzil: v.meta.manzil,
      page: v.meta.page,
      ruku: v.meta.ruku,
      hizbQuarter: v.meta.hizbQuarter,
      sajda: v.sajda.recommended || v.sajda.obligatory,
      translation: v.translation.en,
      tafseer: v.tafsir.id.long, // Using Indonesian tafsir as english one is not available in this API. Let's assume it's english for now.
    }));

    return {
      number: surahData.number,
      name: surahData.name.long,
      englishName: surahData.name.transliteration.en,
      englishNameTranslation: surahData.name.translation.en,
      revelationType: surahData.revelation.en,
      numberOfAyahs: surahData.numberOfVerses,
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
