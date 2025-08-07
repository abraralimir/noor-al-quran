'use server';

import { quranNavigator } from '@/ai/flows/quran-navigator';
import { quranTutor } from '@/ai/flows/quran-tutor';
import { getSurahs } from '@/lib/quran-api';
import { Surah } from '@/types/quran';

interface NavigationResult {
  path?: string;
  error?: string;
}

const normalizeString = (str: string) => str.toLowerCase().replace(/al-/g, '').replace(/[\s'-]/g, '');

export async function handleNavigationCommand(command: string): Promise<NavigationResult> {
  try {
    const navOutput = await quranNavigator({ command });

    if (navOutput.action === 'unknown' || !navOutput.surahName) {
      return { error: `I couldn't recognize the Surah in your command. Please be more specific.` };
    }

    const surahs = await getSurahs();
    // Fuzzy search for surah name
    const surahNameLower = normalizeString(navOutput.surahName);
    
    const foundSurah = surahs.find(s => {
      const englishName = normalizeString(s.englishName);
      const arabicName = normalizeString(s.name.replace('سُورَةُ ', ''));
      return englishName.includes(surahNameLower) || arabicName.includes(surahNameLower);
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
