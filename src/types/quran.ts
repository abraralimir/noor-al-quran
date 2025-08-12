
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

export interface SpecialRecitation {
    name: string;
    keywords: string[];
    verses: { surah: number; ayah: number; }[];
}
