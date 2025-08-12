
'use server';

import { quranNavigator } from '@/ai/flows/quran-navigator';
import { quranTafseer } from '@/ai/flows/quran-tafseer';
import { quranTutor } from '@/ai/flows/quran-tutor';
import { writingInstructor } from '@/ai/flows/writing-instructor';
import { getSurahs, getSurah } from '@/lib/quran-api';
import type { Surah } from '@/types/quran';

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

export async function handleWritingSubmission(imageDataUri: string, letter: string, lang: 'en' | 'ur'): Promise<WritingInstructorResult> {
    try {
        if (!imageDataUri) {
            return { isCorrect: false, feedback: "Please draw the letter before submitting." };
        }
        const { isCorrect, feedback, nextLetter } = await writingInstructor({ drawing: imageDataUri, letter, language: lang });
        return { isCorrect, feedback, nextLetter };
    } catch (error) {
        console.error('Error handling writing submission:', error);
        const fallbackFeedback = "I'm sorry, something went wrong. Let's try that again.";
        return { isCorrect: false, feedback: fallbackFeedback };
    }
}

interface TafseerResult {
  tafseer?: {
    introduction: string;
    theme: string;
    analysis: string;
  };
  error?: string;
}

export async function handleTafseerQuery(surahNumber: number, ayahNumber: number, surahName: string, ayahText: string, lang: 'en' | 'ur'): Promise<TafseerResult> {
  try {
    const tafseerOutput = await quranTafseer({ surahName, ayahNumber, ayahText, language: lang });
    return { tafseer: tafseerOutput };
  } catch (error) {
    console.error(`Error fetching tafseer for Surah ${surahNumber}:${ayahNumber}`, error);
    return { error: "An error occurred while fetching the Tafseer. Please try again." };
  }
}

export async function getAyahText(surahNumber: number, ayahNumberInSurah: number): Promise<string | null> {
    try {
        const surah = await getSurah(surahNumber, 'en'); // get english for context
        const ayah = surah?.ayahs.find(a => a.numberInSurah === ayahNumberInSurah);
        return ayah ? ayah.text : null;
    } catch (error) {
        console.error("Error fetching ayah text:", error);
        return null;
    }
}
