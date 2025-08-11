import type { Surah, SurahDetails, Ayah } from '@/types/quran';

const ALQURAN_CLOUD_API_BASE_URL = 'https://api.alquran.cloud/v1';

// Cache for surah list to avoid re-fetching
let surahsCache: Surah[] | null = null;

interface AlquranCloudSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

// Fetches the list of all Surahs.
export async function getSurahs(): Promise<Surah[]> {
  if (surahsCache) {
    return surahsCache;
  }
  try {
    const response = await fetch(`${ALQURAN_CLOUD_API_BASE_URL}/surah`);
    if (!response.ok) {
      throw new Error('Failed to fetch surahs from api.alquran.cloud');
    }
    const data = await response.json();
    
    // Map the response to our internal Surah type
    const mappedSurahs: Surah[] = data.data.map((surah: AlquranCloudSurah) => ({
      number: surah.number,
      name: surah.name,
      englishName: surah.englishName,
      englishNameTranslation: surah.englishNameTranslation,
      revelationType: surah.revelationType,
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
export async function getSurah(surahNumber: number, lang: string = 'en'): Promise<SurahDetails | null> {
    try {
        const translationEdition = lang === 'ur' ? 'ur.maududi' : 'en.sahih';
        const response = await fetch(`${ALQURAN_CLOUD_API_BASE_URL}/surah/${surahNumber}/editions/quran-uthmani,${translationEdition}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch Surah ${surahNumber} from api.alquran.cloud`);
        }
        const data = await response.json();

        const arabicEdition = data.data[0];
        const translationEditionData = data.data[1];

        const ayahs: Ayah[] = arabicEdition.ayahs.map((ayah: any, index: number) => ({
            number: ayah.number,
            audio: `https://cdn.islamic.network/quran/audio/64/ar.abdurrahmaansudais/${ayah.number}.mp3`,
            audioSecondary: [], // This API doesn't provide secondary audio links in this call
            text: ayah.text,
            numberInSurah: ayah.numberInSurah,
            juz: ayah.juz,
            manzil: ayah.manzil,
            page: ayah.page,
            ruku: ayah.ruku,
            hizbQuarter: ayah.hizbQuarter,
            sajda: ayah.sajda,
            translation: translationEditionData.ayahs[index]?.text || 'Translation not found.',
        }));

        return {
            number: arabicEdition.number,
            name: arabicEdition.name,
            englishName: arabicEdition.englishName,
            englishNameTranslation: arabicEdition.englishNameTranslation,
            revelationType: arabicEdition.revelationType,
            numberOfAyahs: arabicEdition.numberOfAyahs,
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
