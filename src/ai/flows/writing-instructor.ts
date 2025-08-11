
'use server';

/**
 * @fileOverview AI-powered writing instructor for Arabic letters.
 *
 * - writingInstructor - A function that evaluates a user's drawing of an Arabic letter.
 * - WritingInstructorInput - The input type for the writingInstructor function.
 * - WritingInstructorOutput - The return type for the writingInstructor function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { arabicAlphabet } from '@/lib/kids-data';

const WritingInstructorInputSchema = z.object({
  drawing: z.string().describe("The user's drawing of the letter as a data URI."),
  letter: z.string().describe('The Arabic letter the user was asked to write.'),
  language: z.enum(['en', 'ur']).default('en').describe('The language for the feedback.'),
});
export type WritingInstructorInput = z.infer<typeof WritingInstructorInputSchema>;

const WritingInstructorOutputSchema = z.object({
  isCorrect: z.boolean().describe('Whether the drawing is a correct representation of the letter.'),
  feedback: z.string().describe('Encouraging and helpful feedback for the user.'),
  nextLetter: z.string().optional().describe('The next letter to practice if the current one was correct.'),
});
export type WritingInstructorOutput = z.infer<typeof WritingInstructorOutputSchema>;

export async function writingInstructor(input: WritingInstructorInput): Promise<WritingInstructorOutput> {
  return writingInstructorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'writingInstructorPrompt',
  input: { schema: WritingInstructorInputSchema },
  output: { schema: WritingInstructorOutputSchema },
  prompt: `You are a friendly and encouraging AI instructor for kids learning to write Arabic letters. Your name is Noor.

You will be given an image of a child's drawing and the letter they were supposed to write. Your task is to:
1.  Analyze the drawing.
2.  Determine if the drawing correctly represents the target letter. Be lenient, as this is for a child. A recognizable attempt is good enough.
3.  Provide short, positive, and encouraging feedback in the specified language ({{language}}).
4.  If the letter is correct, identify the next letter in the Arabic alphabet.

Example Interaction (User draws "Alif" correctly):
- Input: { drawing: (image data), letter: "Alif", language: "en" }
- Output: { "isCorrect": true, "feedback": "Excellent! That's a perfect Alif. Now, let's try the next letter.", "nextLetter": "Ba" }

Example Interaction (User draws "Alif" incorrectly):
- Input: { drawing: (image data), letter: "Alif", language: "en" }
- Output: { "isCorrect": false, "feedback": "That's a good try! Let's try drawing Alif one more time. It's just a straight line." }

Example Interaction (User draws "Ba" correctly):
- Input: { drawing: (image data), letter: "Ba", language: "ur" }
- Output: { "isCorrect": true, "feedback": "بہت خوب! یہ ایک بہترین 'با' ہے۔ اب، اگلا حرف آزماتے ہیں۔", "nextLetter": "Ta" }

The target letter is: {{letter}}.
The provided drawing is:
{{media url=drawing}}
`,
});

const writingInstructorFlow = ai.defineFlow(
  {
    name: 'writingInstructorFlow',
    inputSchema: WritingInstructorInputSchema,
    outputSchema: WritingInstructorOutputSchema,
  },
  async (input) => {
    const response = await prompt(input);
    const output = response.output!;

    if (output.isCorrect) {
        const currentIndex = arabicAlphabet.findIndex(item => item.name === input.letter);
        if (currentIndex !== -1 && currentIndex < arabicAlphabet.length - 1) {
            output.nextLetter = arabicAlphabet[currentIndex + 1].name;
        } else {
             output.feedback = "You did it! You've practiced all the letters. Great job!";
             if(input.language === 'ur') {
                output.feedback = "آپ نے کر دکھایا! آپ نے تمام حروف کی مشق کر لی ہے۔ بہت اچھا کام!";
             }
        }
    }
    return output;
  }
);
