'use server';

/**
 * @fileOverview Provides an AI chatbot for answering questions about the Quran.
 *
 * - quranTutor - A function that answers questions about the Quran.
 * - QuranTutorInput - The input type for the quranTutor function.
 * - QuranTutorOutput - The return type for the quranTutor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuranTutorInputSchema = z.object({
  question: z.string().describe('The question about the Quran.'),
});
export type QuranTutorInput = z.infer<typeof QuranTutorInputSchema>;

const QuranTutorOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the Quran.'),
});
export type QuranTutorOutput = z.infer<typeof QuranTutorOutputSchema>;

export async function quranTutor(input: QuranTutorInput): Promise<QuranTutorOutput> {
  return quranTutorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'quranTutorPrompt',
  input: {schema: QuranTutorInputSchema},
  output: {schema: QuranTutorOutputSchema},
  prompt: `You are a knowledgeable AI tutor specializing in the Quran.

  Answer the following question about the Quran accurately and informatively. Only answer questions related to the Quran and do not entertain other topics.

  Question: {{{question}}} `,
});

const quranTutorFlow = ai.defineFlow(
  {
    name: 'quranTutorFlow',
    inputSchema: QuranTutorInputSchema,
    outputSchema: QuranTutorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
