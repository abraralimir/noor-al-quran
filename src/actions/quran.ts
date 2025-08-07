'use server';

import { quranNavigator } from '@/ai/flows/quran-navigator';
import { quranTutor } from '@/ai/flows/quran-tutor';
import { getSurahs } from '@/lib/quran-api';

interface NavigationResult {
  path?: string;
  error?: string;
}

export async function handleNavigationCommand(command: string): Promise<NavigationResult> {
  try {
    const navOutput = await quranNavigator({ command });

    if (navOutput.action === 'unknown' || !navOutput.surahName) {
      return { error: `I couldn't recognize the Surah in your command. Please be more specific.` };
    }

    const surahs = await getSurahs();
    // Fuzzy search for surah name
    const surahNameLower = navOutput.surahName.toLowerCase().replace(/al-/g, '').trim();
    const foundSurah = surahs.find(s => 
        s.englishName.toLowerCase().replace(/al-/g, '').trim().includes(surahNameLower) ||
        s.name.toLowerCase().includes(surahNameLower)
    );

    if (!foundSurah) {
      return { error: `Surah "${navOutput.surahName}" could not be found.` };
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
