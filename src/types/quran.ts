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
  tafseer?: string;
}

export interface SurahDetails extends Surah {
  ayahs: Ayah[];
}

export interface SurahsApiResponse {
  code: number;
  status: string;
  data: Surah[];
}

export interface SurahDetailsApiResponse {
    code: number;
    status: string;
    data: SurahDetails[];
}
