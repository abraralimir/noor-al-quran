'use server';

import { quranNavigator } from '@/ai/flows/quran-navigator';
import { quranTutor } from '@/ai/flows/quran-tutor';
import { getSurahs } from '@/lib/quran-api';
import { Surah } from '@/types/quran';

interface NavigationResult {
  path?: string;
  error?: string;
}

// More robust normalization: handles missing "Al-", hyphens, and spaces.
const normalizeString = (str: string) => str.toLowerCase().replace(/^(al-)?/,'').replace(/[\s'-]/g, '');

export async function handleNavigationCommand(command: string): Promise<NavigationResult> {
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

    if (navOutput.action === 'openSurah') {
      return { path: `/read?surah=${foundSurah.number}` };
    }

    if (navOutput.action === 'playSurah') {
      return { path: `/listen?surah=${foundSurah.number}` };
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

export async function handleTutorQuery(question: string): Promise<TutorResult> {
  try {
    const tutorOutput = await quranTutor({ question });
    return { answer: tutorOutput.answer };
  } catch (error) {
    console.error('Error handling tutor query:', error);
    return { answer: "I'm sorry, I encountered an issue while trying to answer your question. Please try again." };
  }
}
