
'use server';

/**
 * @fileOverview Selects the correct Tafseer audio URL based on language and Surah.
 *
 * - selectTafseerAudio - A function that returns the audio URL for a specific Tafseer.
 * - TafseerAudioInput - The input type for the function.
 * - TafseerAudioOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { getSurahs } from '@/lib/quran-api';
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
const englishTafseerBaseUrl = 'https://archive.org/download/TafseerIbnKathir-Eng-MuftiAbuLayth';


async function getAudioUrl(surahNumber: number, language: 'en' | 'ur'): Promise<string> {
    const paddedSurah = surahNumber.toString().padStart(3, '0');
    if (language === 'ur') {
        // Dr. Israr Ahmed's Bayan-ul-Quran
        return `${urduBayanulQuranBaseUrl}/Bayan-ul-Quran-${paddedSurah}.mp3`;
    } else {
        // English Tafsir by Mufti Abu Layth (based on Ibn Kathir)
        const surahs = await getSurahs();
        const surah = surahs.find(s => s.number === surahNumber);
        if (!surah) {
            // Fallback just in case, though it's unlikely to be needed.
            return `${englishTafseerBaseUrl}/${paddedSurah}.mp3`;
        }
        // Correctly format the name to match archive.org filenames like "001 Surah Al-Fatihah.mp3"
        // This handles cases like "An-Nas", "Ash-Shams" etc. by adding a space after the prefix.
        const surahName = surah.englishName.replace(/^(Al-)|(As-)|(Ad-)|(Ar-)|(At-)/, (match) => match.slice(0, -1) + ' ');
        const encodedSurahName = encodeURIComponent(surahName);
        return `${englishTafseerBaseUrl}/${paddedSurah}%20Surah%20${encodedSurahName}.mp3`;
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
    const audioUrl = await getAudioUrl(surahNumber, language);
    return { audioUrl };
  }
);
