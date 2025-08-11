export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

export interface Ayah {
  number: number;
  audio: string;
  audioSecondary: string[];
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
  translation: string;
}

export interface SurahDetails extends Surah {
  ayahs: Ayah[];
}

export interface AlquranCloudSurahsApiResponse {
  code: number;
  status: string;
  data: Surah[];
}

// This is the type for the Al-Quran cloud API when we request multiple editions
export interface AlquranCloudSurahDetails {
  code: number;
  status: string;
  data: SurahDetails[];
}


// Types for the quran.com API (v4)
export interface QuranComChapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bane_muqatilat: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: [number, number];
  translated_name: {
    language_name: string;
    name: string;
  };
}
export interface QuranComChaptersResponse {
  chapters: QuranComChapter[];
}

export interface QuranComVerse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  juz_number: number;
  hizb_number: number;
  rub_el_hizb_number: number;
  ruku_number: number;
  manzil_number: number;
  page_number: number;
  sajdah_number: number | null;
}
export interface QuranComVersesResponse {
  verses: QuranComVerse[];
}

export interface QuranComTranslation {
  resource_id: number;
  text: string;
  verse_key: string;
  verse_number: number;
}
export interface QuranComTranslationsResponse {
  translations: QuranComTranslation[];
}
