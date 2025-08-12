'use server';

/**
 * @fileOverview AI-powered Quran navigator flow.
 *
 * - quranNavigator - A function that takes a user command and returns the appropriate action.
 * - QuranNavigatorInput - The input type for the quranNavigator function.
 * - QuranNavigatorOutput - The return type for the quranNavigator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuranNavigatorInputSchema = z.object({
  command: z.string().describe('A command to navigate the Quran, e.g., "Open Surah Al-Fatiha", "Play Surah Al-Baqarah", or "Tafseer of Surah Al-Baqarah Ayah 255".'),
});
export type QuranNavigatorInput = z.infer<typeof QuranNavigatorInputSchema>;

const QuranNavigatorOutputSchema = z.object({
  action: z.enum(['openSurah', 'playSurah', 'tafseer', 'unknown']).describe('The action to take: openSurah, playSurah, tafseer, or unknown if the command is not recognized.'),
  surahName: z.string().optional().describe('The name of the surah to open, play, or analyze.'),
  ayahNumber: z.number().optional().describe('The ayah number for the Tafseer action.'),
});
export type QuranNavigatorOutput = z.infer<typeof QuranNavigatorOutputSchema>;

export async function quranNavigator(input: QuranNavigatorInput): Promise<QuranNavigatorOutput> {
  return quranNavigatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'quranNavigatorPrompt',
  input: {schema: QuranNavigatorInputSchema},
  output: {schema: QuranNavigatorOutputSchema},
  prompt: `You are an intelligent Quran navigation assistant. Your task is to interpret user commands and identify the intended action and the relevant details.

You must identify the action, the Surah name, and optionally the Ayah number.
- The action should be one of: 'openSurah', 'playSurah', 'tafseer'.
- If the command is unclear or not related to Quran navigation, set the action to 'unknown'.
- The surahName should be the canonical English name of the Surah. If the Surah name starts with "Al-", "Ar-", "As-", etc., you MUST include that prefix in the output. Your goal is to return the most accurate, official English transliteration.
- If the action is 'tafseer', you MUST also extract the ayah number if it is specified.

Here are some examples:
- Command: "Open Surah Al-Fatiha" -> Output: { "action": "openSurah", "surahName": "Al-Fatiha" }
- Command: "Open Surah Fatiha" -> Output: { "action": "openSurah", "surahName": "Al-Fatiha" }
- Command: "I want to listen to Surah Baqarah" -> Output: { "action": "playSurah", "surahName": "Al-Baqarah" }
- Command: "Read Yaseen" -> Output: { "action": "openSurah", "surahName": "Yaseen" }
- Command: "Play me Surah Rahman" -> Output: { "action": "playSurah", "surahName": "Ar-Rahman" }
- Command: "tafseer of surah baqarah verse 255" -> Output: { "action": "tafseer", "surahName": "Al-Baqarah", "ayahNumber": 255 }
- Command: "what is the meaning of al-fatiha ayah 1" -> Output: { "action": "tafseer", "surahName": "Al-Fatiha", "ayahNumber": 1 }
- Command: "tafseer al ikhlas" -> Output: { "action": "tafseer", "surahName": "Al-Ikhlas" }
- Command: "what is surah iklas about" -> Output: { "action": "unknown" }
- Command: "What's the weather like?" -> Output: { "action": "unknown" }
- Command: "show me tafseer for surah al-nas" -> Output: { "action": "tafseer", "surahName": "An-Nas" }
- Command: "interpretation of al-falaq" -> Output: { "action": "tafseer", "surahName": "Al-Falaq" }

Now, analyze the following user command.

Command: {{{command}}}
Output:`,
});

const quranNavigatorFlow = ai.defineFlow(
  {
    name: 'quranNavigatorFlow',
    inputSchema: QuranNavigatorInputSchema,
    outputSchema: QuranNavigatorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
