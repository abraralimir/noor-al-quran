
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

// Types for the new quranapi.pages.dev API
export interface SutanlabSurah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelation: string;
    numberOfAyahs: number;
}

export interface SutanlabSurahDetails {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelation: string;
    numberOfAyahs: number;
    ayahs: SutanlabAyah[];
}

export interface SutanlabAyah {
    number: {
        inQuran: number;
        inSurah: number;
    };
    text: {
        arab: string;
    };
    translation: {
        en: string;
    };
    audio: {
        primary: string;
        secondary: string[];
    };
    meta: {
        juz: number;
        page: number;
        manzil: number;
        ruku: number;
        hizbQuarter: number;
        sajda: {
            recommended: boolean;
            obligatory: boolean;
        };
    };
}
