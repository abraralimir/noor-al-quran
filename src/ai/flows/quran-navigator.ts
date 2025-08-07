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
  command: z.string().describe('A command to navigate the Quran, e.g., "Open Surah Al-Fatiha" or "Play Surah Al-Baqarah".'),
});
export type QuranNavigatorInput = z.infer<typeof QuranNavigatorInputSchema>;

const QuranNavigatorOutputSchema = z.object({
  action: z.enum(['openSurah', 'playSurah', 'unknown']).describe('The action to take: openSurah, playSurah, or unknown if the command is not recognized.'),
  surahName: z.string().optional().describe('The name of the surah to open or play, if specified in the command.'),
});
export type QuranNavigatorOutput = z.infer<typeof QuranNavigatorOutputSchema>;

export async function quranNavigator(input: QuranNavigatorInput): Promise<QuranNavigatorOutput> {
  return quranNavigatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'quranNavigatorPrompt',
  input: {schema: QuranNavigatorInputSchema},
  output: {schema: QuranNavigatorOutputSchema},
  prompt: `You are an intelligent Quran navigation assistant. Your task is to interpret user commands and identify the intended action (open or play a Surah) and the name of the Surah.

You must identify the action and the Surah name.
- The action should be one of: 'openSurah', 'playSurah'.
- If the command is unclear or not related to Quran navigation, set the action to 'unknown'.
- The surahName should be the English name of the Surah. Do not remove "Al-" from the name.

Here are some examples:
- Command: "Open Surah Al-Fatiha" -> Output: { "action": "openSurah", "surahName": "Al-Fatiha" }
- Command: "I want to listen to Surah Baqarah" -> Output: { "action": "playSurah", "surahName": "Al-Baqarah" }
- Command: "Read Yaseen" -> Output: { "action": "openSurah", "surahName": "Yaseen" }
- Command: "Play me Surah Rahman" -> Output: { "action": "playSurah", "surahName": "Ar-Rahman" }
- Command: "go to surah al kahf" -> Output: { "action": "openSurah", "surahName": "Al-Kahf" }
- Command: "What's the weather like?" -> Output: { "action": "unknown" }
- Command: "Tell me about prophet Muhammad" -> Output: { "action": "unknown" }

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
