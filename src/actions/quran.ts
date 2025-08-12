
'use server';

import { quranNavigator } from '@/ai/flows/quran-navigator';
import { quranTutor } from '@/ai/flows/quran-tutor';
import { writingInstructor } from '@/ai/flows/writing-instructor';
import { getSurahs, getSurah } from '@/lib/quran-api';
import { selectTafseerAudio } from '@/ai/flows/tafseer-audio-selector';
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

export async function handleWritingSubmission(imageDataUri: string, letter: string, language: 'en' | 'ur'): Promise<WritingInstructorResult> {
    try {
        if (!imageDataUri) {
            return { isCorrect: false, feedback: "Please draw the letter before submitting." };
        }
        const { isCorrect, feedback, nextLetter } = await writingInstructor({ drawing: imageDataUri, letter, language });
        return { isCorrect, feedback, nextLetter };
    } catch (error) {
        console.error('Error handling writing submission:', error);
        const fallbackFeedback = "I'm sorry, something went wrong. Let's try that again.";
        return { isCorrect: false, feedback: fallbackFeedback };
    }
}


export interface TafseerAyah {
  ayah: number;
  text: string;
}

export interface Tafseer {
  tafseer_id: number;
  tafseer_name: string;
  surah_name: string;
  surah_number: number;
  ayahs: TafseerAyah[];
  audioUrl?: string;
}


export async function getSurahTafseer(surahNumber: number, lang: 'en' | 'ur'): Promise<Tafseer | null> {
    try {
        const surahData = await getSurah(surahNumber, lang);
        if (!surahData) {
            return null;
        }

        const audioResponse = await selectTafseerAudio({ surahNumber, language: lang });
        const audioUrl = audioResponse.audioUrl;
        
        const tafseerName = lang === 'en' ? 'English Translation (Saheeh International)' : 'Urdu Translation (Maududi)';

        const ayahs: TafseerAyah[] = surahData.ayahs.map(ayah => ({
            ayah: ayah.numberInSurah,
            text: ayah.translation || "No Tafseer text available for this Ayah.",
        }));
        
        return {
          tafseer_id: lang === 'en' ? 1 : 2, // Arbitrary ID
          tafseer_name: tafseerName,
          surah_name: surahData.englishName,
          surah_number: surahData.number,
          ayahs: ayahs,
          audioUrl: audioUrl,
        };
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error fetching or processing surah tafseer for Surah ${surahNumber}:`, error.message);
            console.error(error.stack);
        } else {
            console.error(`An unknown error occurred while fetching tafseer for Surah ${surahNumber}:`, error);
        }
        return null;
    }
}

export async function getSurahOfTheDay(): Promise<Surah | null> {
    try {
        const surahs = await getSurahs();
        if (surahs.length > 0) {
            const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
            const surahIndex = dayOfYear % surahs.length;
            return surahs[surahIndex];
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch Surah of the day:", error);
        return null;
    }
}
