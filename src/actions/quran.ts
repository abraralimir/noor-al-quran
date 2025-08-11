
'use server';

import { quranNavigator } from '@/ai/flows/quran-navigator';
import { quranTutor } from '@/ai/flows/quran-tutor';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { writingInstructor } from '@/ai/flows/writing-instructor';
import { getSurahs } from '@/lib/quran-api';

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
  feedbackAudio: string;
  nextLetter?: string;
}

export async function handleWritingSubmission(imageDataUri: string, letter: string, lang: 'en' | 'ur'): Promise<WritingInstructorResult> {
    try {
        const { isCorrect, feedback, nextLetter } = await writingInstructor({ drawing: imageDataUri, letter, language: lang });
        const { audioDataUri } = await textToSpeech({ text: feedback });
        
        return { isCorrect, feedback, feedbackAudio: audioDataUri, nextLetter };
    } catch (error) {
        console.error('Error handling writing submission:', error);
        const fallbackFeedback = "I'm sorry, something went wrong. Let's try that again.";
        const { audioDataUri } = await textToSpeech({ text: fallbackFeedback });
        return { isCorrect: false, feedback: fallbackFeedback, feedbackAudio: audioDataUri };
    }
}

export async function getInstructionAudio(text: string): Promise<{ audioDataUri: string }> {
    try {
        return await textToSpeech({ text });
    } catch (error) {
        console.error('Error getting instruction audio:', error);
        return { audioDataUri: '' };
    }
}
