
'use server';

/**
 * @fileOverview Provides AI-powered Tafseer (exegesis) for Quranic verses.
 *
 * - quranTafseer - A function that generates Tafseer for a specific Ayah.
 * - QuranTafseerInput - The input type for the quranTafseer function.
 * - QuranTafseerOutput - The return type for the quranTafseer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuranTafseerInputSchema = z.object({
  surahName: z.string().describe('The name of the Surah.'),
  ayahNumber: z.number().describe('The number of the Ayah within the Surah.'),
  ayahText: z.string().describe('The Arabic text of the Ayah.'),
  language: z.enum(['en', 'ur']).default('en').describe('The language for the Tafseer.'),
});
export type QuranTafseerInput = z.infer<typeof QuranTafseerInputSchema>;

const QuranTafseerOutputSchema = z.object({
  introduction: z.string().describe("A brief introduction to the Ayah's context."),
  theme: z.string().describe("The main theme or message of the Ayah."),
  analysis: z.string().describe("A detailed analysis and explanation of the Ayah."),
});
export type QuranTafseerOutput = z.infer<typeof QuranTafseerOutputSchema>;

export async function quranTafseer(input: QuranTafseerInput): Promise<QuranTafseerOutput> {
  return quranTafseerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'quranTafseerPrompt',
  input: { schema: QuranTafseerInputSchema },
  output: { schema: QuranTafseerOutputSchema },
  prompt: `You are an expert in Quranic Tafseer (exegesis). Your name is Noor.

  Provide a detailed Tafseer for the following Ayah. Your explanation should be clear, insightful, and accessible to a general audience.
  
  The user requires the Tafseer in {{language}}. You MUST respond in that language.

  Surah: {{surahName}}
  Ayah Number: {{ayahNumber}}
  Ayah Text: "{{ayahText}}"

  Please structure your response into the following sections:
  1.  **Introduction**: Briefly explain the context of the Ayah within the Surah.
  2.  **Theme**: What is the central message or theme of this Ayah?
  3.  **Analysis**: Provide a detailed verse-by-verse or phrase-by-phrase explanation, touching upon linguistic nuances, historical context, and scholarly interpretations.

  IMPORTANT: Do NOT reveal that you are an AI or a language model. Maintain the persona of a knowledgeable and helpful Quranic scholar.
  `,
});

const quranTafseerFlow = ai.defineFlow(
  {
    name: 'quranTafseerFlow',
    inputSchema: QuranTafseerInputSchema,
    outputSchema: QuranTafseerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
