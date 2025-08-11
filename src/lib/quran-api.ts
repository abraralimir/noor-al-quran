import type { Surah, SurahDetails, SurahsApiResponse, SutanlabSurahDetails, AlquranCloudSurahDetails } from '@/types/quran';

// Using two different APIs. A primary one for rich data, and a secondary one for fallback reliability.
const SUTANLAB_API_BASE_URL = 'https://api.alquran.sutanlab.id';
const ALQURAN_CLOUD_API_BASE_URL = 'https://api.alquran.cloud/v1';

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

// Fallback function to get data from Al-Quran Cloud if the primary API fails
async function getSurahFromAlquranCloud(surahNumber: number): Promise<SurahDetails | null> {
    try {
        const response = await fetch(`${ALQURAN_CLOUD_API_BASE_URL}/surah/${surahNumber}/editions/quran-uthmani,en.sahih`);
        if (!response.ok) {
          throw new Error(`Failed to fetch Surah ${surahNumber} from alquran.cloud API`);
        }
        const result: AlquranCloudSurahDetails = await response.json();
        const arabicData = result.data[0];
        const translationData = result.data[1];

        const ayahs = arabicData.ayahs.map((ayah, index) => ({
            number: ayah.number,
            audio: `https://cdn.islamic.network/quran/audio/64/ar.abdurrahmaansudais/${ayah.number}.mp3`,
            audioSecondary: [],
            text: ayah.text,
            numberInSurah: ayah.numberInSurah,
            juz: ayah.juz,
            manzil: ayah.manzil,
            page: ayah.page,
            ruku: ayah.ruku,
            hizbQuarter: ayah.hizbQuarter,
            sajda: ayah.sajda,
            translation: translationData.ayahs[index].text,
            tafseer: '', // Fallback doesn't have tafseer
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
        console.error(`Error fetching surah ${surahNumber} from fallback API:`, error);
        return null;
    }
}


export async function getSurah(surahNumber: number): Promise<SurahDetails | null> {
  try {
    // Primary API Attempt
    const response = await fetch(`${SUTANLAB_API_BASE_URL}/surah/${surahNumber}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Surah ${surahNumber} from sutanlab API`);
    }

    const result: SutanlabSurahDetails = await response.json();
    const surahData = result.data;

    const ayahs = surahData.verses.map(v => ({
      number: v.number.inQuran,
      audio: v.audio.primary,
      audioSecondary: v.audio.secondary,
      text: v.text.arab,
      numberInSurah: v.number.inSurah,
      juz: v.meta.juz,
      manzil: v.meta.manzil,
      page: v.meta.page,
      ruku: v.meta.ruku,
      hizbQuarter: v.meta.hizbQuarter,
      sajda: v.sajda.recommended || v.sajda.obligatory,
      translation: v.translation.en,
      tafseer: v.tafsir.id.long,
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
    console.error(`Primary API failed for surah ${surahNumber}:`, error, "Attempting fallback.");
    // Fallback API Attempt
    return getSurahFromAlquranCloud(surahNumber);
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
