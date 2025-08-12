
'use server';

import { quranNavigator } from '@/ai/flows/quran-navigator';
import { quranTutor } from '@/ai/flows/quran-tutor';
import { writingInstructor } from '@/ai/flows/writing-instructor';
import { getSurahs, getSurah } from '@/lib/quran-api';
import type { Surah, Ayah } from '@/types/quran';

interface NavigationResult {
  path?: string;
  error?: string;
}

// More robust normalization: handles missing "Al-", hyphens, and spaces.
const normalizeString = (str: string) => str.toLowerCase().replace(/^(al-)?/,'').replace(/[\s'-]/g, '');

export async function handleNavigationCommand(command: string, lang: 'en' | 'ur'): Promise<NavigationResult> {
  try {
    const navOutput = await quranNavigator({ command });

    if (navOutput.action === 'unknown' || !navOutput.surahName) {
      return { error: `I couldn't recognize the Surah in your command. Please be more specific.` };
    }

    const surahs = await getSurahs();
    // The AI now provides the canonical name, so we can do a more direct search.
    const surahNameLower = navOutput.surahName.toLowerCase();
    
    // Fuzzy search for surah name, comparing normalized versions.
    const foundSurah = surahs.find(s => {
      const englishName = s.englishName.toLowerCase();
      const normalizedApiName = normalizeString(englishName);
      const normalizedAiName = normalizeString(surahNameLower);
      // Prioritize exact match, then fuzzy match.
      return englishName === surahNameLower || normalizedApiName.includes(normalizedAiName);
    });

    if (!foundSurah) {
      return { error: `Surah "${navOutput.surahName}" could not be found. Please try another name.` };
    }
    
    const basePath = `/${lang}`;

    if (navOutput.action === 'openSurah') {
      return { path: `${basePath}/read?surah=${foundSurah.number}` };
    }

    if (navOutput.action === 'playSurah') {
      return { path: `${basePath}/listen?surah=${foundSurah.number}` };
    }
    
    if (navOutput.action === 'tafseer') {
        const path = `${basePath}/tafseer?surah=${foundSurah.number}${navOutput.ayahNumber ? `&ayah=${navOutput.ayahNumber}` : ''}`;
        return { path };
    }

    return { error: 'Unknown action.' };
  } catch (error) {
    console.error('Error handling navigation command:', error);
    return { error: 'An unexpected error occurred while processing your command.' };
  }
}

interface TutorResult {
  answer: string;
}

export async function handleTutorQuery(question: string, language: 'en' | 'ur' = 'en'): Promise<TutorResult> {
  try {
    const tutorOutput = await quranTutor({ question, language });
    return { answer: tutorOutput.answer };
  } catch (error) {
    console.error('Error handling tutor query:', error);
    return { answer: "I'm sorry, I encountered an issue while trying to answer your question. Please try again." };
  }
}

interface WritingInstructorResult {
    isCorrect: boolean;
    feedback: string;
    nextLetter?: string;
}

export async function handleWritingSubmission(imageDataUri: string, letter: string): Promise<WritingInstructorResult> {
    try {
        if (!imageDataUri) {
            return { isCorrect: false, feedback: "Please draw the letter before submitting." };
        }
        const { isCorrect, feedback, nextLetter } = await writingInstructor({ drawing: imageDataUri, letter });
        return { isCorrect, feedback, nextLetter };
    } catch (error) {
        console.error('Error handling writing submission:', error);
        const fallbackFeedback = "I'm sorry, something went wrong. Let's try that again.";
        return { isCorrect: false, feedback: fallbackFeedback };
    }
}


export interface TafseerAyah {
  ayah_number: number;
  ayah_text: string;
  tafseer_text: string;
}

export interface Tafseer {
  tafseer_id: number;
  tafseer_name: string;
  surah_name: string;
  ayahs: TafseerAyah[];
}

export async function getSurahTafseer(surahNumber: number, lang: 'en' | 'ur'): Promise<Tafseer | null> {
    // Tafseer IDs: 1 for English (Saheeh International), 4 for Urdu (Tafheem-ul-Quran)
    const tafseerId = lang === 'en' ? 1 : 4; 
    try {
        const url = `http://api.quran-tafseer.com/tafseer/${tafseerId}/${surahNumber}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch Tafseer for Surah ${surahNumber}`);
        }
        const data = await response.json();

        const ayahs: TafseerAyah[] = data.ayahs.map((ayah: any) => ({
            ayah_number: ayah.ayah_number,
            ayah_text: ayah.ayah_text,
            tafseer_text: ayah.tafseer_text,
        }));
        
        return {
          tafseer_id: data.tafseer_id,
          tafseer_name: data.tafseer_name,
          surah_name: data.surah_name,
          ayahs: ayahs,
        };
    } catch (error) {
        console.error('Error fetching surah tafseer:', error);
        return null;
    }
}
