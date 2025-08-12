
'use server';

import { quranNavigator } from '@/ai/flows/quran-navigator';
import { quranTutor } from '@/ai/flows/quran-tutor';
import { writingInstructor } from '@/ai/flows/writing-instructor';
import { getSurahs } from '@/lib/quran-api';
import { selectTafseerAudio } from '@/ai/flows/tafseer-audio-selector';

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
    const tafseerEditionId = lang === 'en' ? 169 : 159; // 169: Ibn Kathir (en), 159: Dr. Israr (ur)
    const baseUrl = `https://quran-tafseer.com/api`;
    
    try {
        const url = `${baseUrl}/tafseer/${tafseerEditionId}/${surahNumber}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error(`Failed to fetch Tafseer for Surah ${surahNumber} from ${url}. Status: ${response.status}`);
            return null;
        }
        
        const data = await response.json();

        if (!data || !Array.isArray(data) || data.length === 0) {
            console.error(`No Tafseer data returned for Surah ${surahNumber} from ${url}.`);
            return null;
        }

        // Get audio URL from our AI flow
        const audioResponse = await selectTafseerAudio({ surahNumber, language: lang });
        const audioUrl = audioResponse.audioUrl;

        const ayahs: TafseerAyah[] = data.map((ayah: any) => ({
            ayah: parseInt(ayah.ayah_number, 10),
            text: ayah.text,
        }));
        
        return {
          tafseer_id: data[0].tafseer_id,
          tafseer_name: data[0].tafseer_name,
          surah_name: data[0].surah_name,
          surah_number: data[0].surah_number,
          ayahs: ayahs,
          audioUrl: audioUrl,
        };
    } catch (error) {
        console.error('Error fetching or processing surah tafseer:', error);
        return null;
    }
}
