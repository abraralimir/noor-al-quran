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
  prompt: `You are a helpful AI assistant designed to navigate the Quran based on user commands.

  Examples of commands and expected output:
  - Command: Open Surah Al-Fatiha
    Output: { "action": "openSurah", "surahName": "Al-Fatiha" }
  - Command: Play Surah Al-Baqarah
    Output: { "action": "playSurah", "surahName": "Al-Baqarah" }
  - Command: What is the meaning of life?
    Output: { "action": "unknown" }
  - Command: Play some random music
   Output: { \"action\": \"unknown\" }

  Analyze the following command and determine the appropriate action and surah name (if any). If the command is not related to opening or playing a surah, return action as \"unknown\".

  Command: {{{command}}}
  Output:`, // Ensure proper escaping of backslashes
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
