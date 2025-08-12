
import type { SpecialRecitation } from '@/types/quran';

export const arabicAlphabet = [
  { letter: 'ا', name: 'Alif' },
  { letter: 'ب', name: 'Ba' },
  { letter: 'ت', name: 'Ta' },
  { letter: 'ث', name: 'Tha' },
  { letter: 'ج', name: 'Jim' },
  { letter: 'ح', name: 'Ha' },
  { letter: 'خ', name: 'Kha' },
  { letter: 'د', name: 'Dal' },
  { letter: 'ذ', name: 'Dhal' },
  { letter: 'ر', name: 'Ra' },
  { letter: 'ز', name: 'Zain' },
  { letter: 'س', name: 'Sin' },
  { letter: 'ش', name: 'Shin' },
  { letter: 'ص', name: 'Sad' },
  { letter: 'ض', name: 'Dad' },
  { letter: 'ط', name: 'Taa' },
  { letter: 'ظ', name: 'Dha' },
  { letter: 'ع', name: 'Ain' },
  { letter: 'غ', name: 'Ghain' },
  { letter: 'ف', name: 'Fa' },
  { letter: 'ق', name: 'Qaf' },
  { letter: 'ك', name: 'Kaf' },
  { letter: 'ل', name: 'Lam' },
  { letter: 'م', name: 'Mim' },
  { letter: 'ن', name: 'Nun' },
  { letter: 'ه', name: 'Haa' },
  { letter: 'و', name: 'Waw' },
  { letter: 'ي', name: 'Ya' },
];

export const nooraniQaida = [
    {
      title: 'Lesson 1: The Alphabet',
      description: 'The individual Arabic letters (Huroof al Mufradat). This is the foundation of reading the Quran.',
      examples: 'ا ب ت ث ج ح خ',
    },
    {
      title: 'Lesson 2: Joined Letters',
      description: 'The shapes of letters when they are joined together (Huroof al Murakkabat).',
      examples: 'ـبـ ب بـ',
    },
    {
      title: 'Lesson 3: Short Vowels (Harakat)',
      description: 'The three short vowels: Fatha (a), Kasra (i), and Damma (u).',
      examples: 'بَ بِ بُ',
    },
    {
      title: 'Lesson 4: Tanween',
      description: 'The double vowels which produce an "n" sound at the end of a word.',
      examples: 'بً بٍ بٌ',
    },
    {
      title: 'Lesson 5: Harakat & Tanween Combined',
      description: 'Practice reading letters with both short vowels and double vowels.',
       examples: 'دَرَسَ كَتَبَ',
    },
    {
      title: 'Lesson 6: Long Vowels (Madd)',
      description: 'The three long vowels (Huroof al-Madd): Alif, Waw, and Yaa.',
      examples: 'بَا بُو بِي',
    },
    {
      title: 'Lesson 7: Sukoon (Jazm)',
      description: 'The sign that indicates a consonant sound with no vowel.',
      examples: 'اَبْ اِبْ اُبْ',
    },
    {
      title: 'Lesson 8: Shaddah (Tashdeed)',
      description: 'The sign that indicates a letter should be doubled in pronunciation.',
      examples: 'اَبَّ اَبِّ اَبُّ',
    },
];

export const specialRecitations: SpecialRecitation[] = [
    {
        name: "Ayat al-Kursi",
        keywords: ["ayat al kursi", "ayatul kursi"],
        verses: [{ surah: 2, ayah: 255 }]
    },
    {
        name: "Manzil",
        keywords: ["manzil"],
        verses: [
            { surah: 1, ayah: 1 }, { surah: 1, ayah: 2 }, { surah: 1, ayah: 3 }, { surah: 1, ayah: 4 }, { surah: 1, ayah: 5 }, { surah: 1, ayah: 6 }, { surah: 1, ayah: 7 },
            { surah: 2, ayah: 1 }, { surah: 2, ayah: 2 }, { surah: 2, ayah: 3 }, { surah: 2, ayah: 4 }, { surah: 2, ayah: 5 },
            { surah: 2, ayah: 255 }, { surah: 2, ayah: 256 }, { surah: 2, ayah: 257 },
            { surah: 2, ayah: 284 }, { surah: 2, ayah: 285 }, { surah: 2, ayah: 286 },
            { surah: 3, ayah: 18 },
            { surah: 7, ayah: 54 }, { surah: 7, ayah: 55 }, { surah: 7, ayah: 56 },
            { surah: 17, ayah: 110 }, { surah: 17, ayah: 111 },
            { surah: 23, ayah: 115 }, { surah: 23, ayah: 116 }, { surah: 23, ayah: 117 }, { surah: 23, ayah: 118 },
            { surah: 37, ayah: 1 }, { surah: 37, ayah: 2 }, { surah: 37, ayah: 3 }, { surah: 37, ayah: 4 }, { surah: 37, ayah: 5 }, { surah: 37, ayah: 6 }, { surah: 37, ayah: 7 }, { surah: 37, ayah: 8 }, { surah: 37, ayah: 9 }, { surah: 37, ayah: 10 }, { surah: 37, ayah: 11 },
            { surah: 59, ayah: 21 }, { surah: 59, ayah: 22 }, { surah: 59, ayah: 23 }, { surah: 59, ayah: 24 },
            { surah: 72, ayah: 1 }, { surah: 72, ayah: 2 }, { surah: 72, ayah: 3 }, { surah: 72, ayah: 4 },
            { surah: 109, ayah: 1 }, { surah: 109, ayah: 2 }, { surah: 109, ayah: 3 }, { surah: 109, ayah: 4 }, { surah: 109, ayah: 5 }, { surah: 109, ayah: 6 },
            { surah: 112, ayah: 1 }, { surah: 112, ayah: 2 }, { surah: 112, ayah: 3 }, { surah: 112, ayah: 4 },
            { surah: 113, ayah: 1 }, { surah: 113, ayah: 2 }, { surah: 113, ayah: 3 }, { surah: 113, ayah: 4 }, { surah: 113, ayah: 5 },
            { surah: 114, ayah: 1 }, { surah: 114, ayah: 2 }, { surah: 114, ayah: 3 }, { surah: 114, ayah: 4 }, { surah: 114, ayah: 5 }, { surah: 114, ayah: 6 }
        ]
    }
];
