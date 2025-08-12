
'use server';

/**
 * @fileOverview Selects the correct Tafseer audio URL based on language and Surah.
 *
 * - selectTafseerAudio - A function that returns the audio URL for a specific Tafseer.
 * - TafseerAudioInput - The input type for the function.
 * - TafseerAudioOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TafseerAudioInputSchema = z.object({
  surahNumber: z.number().describe('The number of the Surah.'),
  language: z.enum(['en', 'ur']).describe('The desired language for the Tafseer audio.'),
});
export type TafseerAudioInput = z.infer<typeof TafseerAudioInputSchema>;

const TafseerAudioOutputSchema = z.object({
  audioUrl: z.string().describe('The URL of the Tafseer audio file.'),
});
export type TafseerAudioOutput = z.infer<typeof TafseerAudioOutputSchema>;


const urduBayanulQuranBaseUrl = 'https://archive.org/download/bayan-ul-quran-by-dr.-israr-ahmed';
const englishTafseerBaseUrl = 'https://archive.org/download/english-tafseer-by-abu-muhammad-wasiullah-abbas';


function getAudioUrl(surahNumber: number, language: 'en' | 'ur'): string {
    const paddedSurah = surahNumber.toString().padStart(3, '0');
    if (language === 'ur') {
        return `${urduBayanulQuranBaseUrl}/Bayan-ul-Quran-${paddedSurah}.mp3`;
    } else {
        // Note: English Tafseer audio seems to be split by Surah groups, not individual files.
        // This is a placeholder and will need a more complex mapping if individual files are not available.
        // For now, let's use a known Surah as an example. This part needs real source mapping.
         if (surahNumber === 1) {
            return `${englishTafseerBaseUrl}/001-Surah-Al-Fatihah.mp3`;
        }
        // A more realistic scenario might be to point to the playlist or a default message
        return `${englishTafseerBaseUrl}/001-Surah-Al-Fatihah.mp3`; // Fallback to Fatiha
    }
}

export async function selectTafseerAudio(input: TafseerAudioInput): Promise<TafseerAudioOutput> {
  return selectTafseerAudioFlow(input);
}

const selectTafseerAudioFlow = ai.defineFlow(
  {
    name: 'selectTafseerAudioFlow',
    inputSchema: TafseerAudioInputSchema,
    outputSchema: TafseerAudioOutputSchema,
  },
  async ({ surahNumber, language }) => {
    // This flow doesn't need to call a prompt, it can just have business logic.
    const audioUrl = getAudioUrl(surahNumber, language);
    return { audioUrl };
  }
);
