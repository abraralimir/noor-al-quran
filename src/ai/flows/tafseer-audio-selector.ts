
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
        // Dr. Israr Ahmed's Bayan-ul-Quran
        return `${urduBayanulQuranBaseUrl}/Bayan-ul-Quran-${paddedSurah}.mp3`;
    } else {
        // Wasiullah Abbas's English Tafseer
        // Pad with two zeros for surahs 1-9
        const englishPaddedSurah = surahNumber.toString().padStart(3, '0');
        return `${englishTafseerBaseUrl}/${englishPaddedSurah}-surah-al-fatihah.mp3`; // This naming is an example, it likely varies.
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
