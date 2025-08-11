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


// Types for the new sutanlab API response
export interface SutanlabSurahDetails {
  code: number;
  message: string;
  data: {
    number: number;
    sequence: number;
    numberOfVerses: number;
    name: {
      short: string;
      long: string;
      transliteration: {
        en: string;
        id: string;
      };
      translation: {
        en: string;
        id: string;
      };
    };
    revelation: {
      arab: string;
      en: string;
      id: string;
    };
    tafsir: {
      id: string;
    };
    preBismillah: {
      text: {
        arab: string;
        transliteration: {
          en: string;
        };
      };
      translation: {
        en: string;
        id: string;
      };
      audio: {
        primary: string;
        secondary: string[];
      };
    } | null;
    verses: {
      number: {
        inQuran: number;
        inSurah: number;
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
      text: {
        arab: string;
        transliteration: {
          en: string;
        };
      };
      translation: {
        en: string;
        id: string;
      };
      audio: {
        primary: string;
        secondary: string[];
      };
      tafsir: {
        id: {
          short: string;
          long: string;
        };
      };
    }[];
  };
}
