
import type { Surah, SurahDetails, Ayah, AlquranCloudSurahDetails } from '@/types/quran';

const QURAN_COM_API_BASE_URL = 'https://api.quran.com/api/v4';
const ALQURAN_CLOUD_API_BASE_URL = 'https://api.alquran.cloud/v1';

// Cache for surah list to avoid re-fetching
let surahsCache: Surah[] | null = null;

// Fetches the list of all Surahs. Uses quran.com API.
export async function getSurahs(): Promise<Surah[]> {
  if (surahsCache) {
    return surahsCache;
  }
  try {
    const response = await fetch(`${QURAN_COM_API_BASE_URL}/chapters`);
    if (!response.ok) {
      throw new Error('Failed to fetch surahs from quran.com API');
    }
    const data = await response.json();
    
    // Map the response to our internal Surah type
    const mappedSurahs: Surah[] = data.chapters.map((chapter: any) => ({
      number: chapter.id,
      name: chapter.name_arabic,
      englishName: chapter.name_simple,
      englishNameTranslation: chapter.translated_name.name,
      revelationType: chapter.revelation_place,
      numberOfAyahs: chapter.verses_count,
    }));

    surahsCache = mappedSurahs;
    return mappedSurahs;
  } catch (error) {
    console.error("Error fetching surahs:", error);
    return [];
  }
}

// Fetches details for a single Surah. Uses quran.com API with a fallback to alquran.cloud.
export async function getSurah(surahNumber: number): Promise<SurahDetails | null> {
    try {
        // Step 1: Get basic info about the surah (including the name)
        const surahInfoResponse = await fetch(`${QURAN_COM_API_BASE_URL}/chapters/${surahNumber}`);
        if (!surahInfoResponse.ok) throw new Error('Failed to fetch surah info');
        const surahInfoData = await surahInfoResponse.json();
        const surahInfo = surahInfoData.chapter;

        // Step 2: Get all verses for the surah in Arabic (Uthmani script)
        const versesResponse = await fetch(`${QURAN_COM_API_BASE_URL}/quran/verses/uthmani?chapter_number=${surahNumber}`);
        if (!versesResponse.ok) throw new Error('Failed to fetch verses');
        const versesData = await versesResponse.json();
        const arabicAyahs = versesData.verses;

        // Step 3: Get all translations for the surah (Sahih International)
        // Using translation ID 131 for Sahih International
        const translationResponse = await fetch(`${QURAN_COM_API_BASE_URL}/quran/translations/131?chapter_number=${surahNumber}`);
        if (!translationResponse.ok) throw new Error('Failed to fetch translations');
        const translationData = await translationResponse.json();
        const translatedAyahs = translationData.translations;

        // Create a map for quick lookup of translations by verse number.
        const translationMap = new Map(translatedAyahs.map((t: any) => [t.verse_number, t.text]));
        
        // Step 4: Combine the data
        const ayahs: Ayah[] = arabicAyahs.map((ayah: any) => {
            const translationText = translationMap.get(ayah.verse_number) || 'Translation not found.';
            // Remove the Arabic markers from the translation
            const cleanedTranslation = translationText.replace(/<sup[^>]*>.*?<\/sup>/g, '').trim();

            return {
                number: ayah.id, 
                audio: getAyahAudioUrl(ayah.id),
                audioSecondary: [],
                text: ayah.text_uthmani,
                numberInSurah: ayah.verse_number,
                juz: ayah.juz_number,
                manzil: 0, // quran.com API doesn't provide manzil
                page: ayah.page_number,
                ruku: ayah.ruku_number,
                hizbQuarter: ayah.hizb_number,
                sajda: ayah.sajdah_number !== null,
                translation: cleanedTranslation,
            };
        });

        return {
            number: surahInfo.id,
            name: surahInfo.name_arabic,
            englishName: surahInfo.name_simple,
            englishNameTranslation: surahInfo.translated_name.name,
            revelationType: surahInfo.revelation_place,
            numberOfAyahs: surahInfo.verses_count,
            ayahs: ayahs,
        };
    } catch (error) {
        console.error(`Error fetching surah ${surahNumber} from quran.com API:`, error);
        // Fallback to alquran.cloud if quran.com fails
        console.log("Falling back to alquran.cloud API...");
        return getSurahFromAlquranCloud(surahNumber);
    }
}

// Fallback function in case the primary API fails.
async function getSurahFromAlquranCloud(surahNumber: number): Promise<SurahDetails | null> {
    try {
        const response = await fetch(`${ALQURAN_CLOUD_API_BASE_URL}/surah/${surahNumber}/editions/quran-uthmani,en.sahih`);
        if (!response.ok) {
          throw new Error(`Failed to fetch Surah ${surahNumber} from alquran.cloud API`);
        }
        const result: AlquranCloudSurahDetails = await response.json();
        
        if (result.code !== 200 || result.status !== "OK") {
            throw new Error(`Alquran.cloud API returned an error for Surah ${surahNumber}: ${result.status}`);
        }

        const arabicData = result.data[0];
        const translationData = result.data[1];

        const ayahs = arabicData.ayahs.map((ayah, index) => ({
            number: ayah.number,
            audio: getAyahAudioUrl(ayah.number),
            audioSecondary: [],
            text: ayah.text,
            numberInSurah: ayah.numberInSurah,
            juz: ayah.juz,
            manzil: ayah.manzil,
            page: ayah.page,
            ruku: ayah.ruku,
            hizbQuarter: ayah.hizbQuarter,
            sajda: !!ayah.sajda,
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
        console.error(`Error fetching surah ${surahNumber} from fallback alquran.cloud API:`, error);
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
