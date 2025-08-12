
'use server';

/**
 * @fileOverview Provides an AI chatbot for answering questions about the Quran.
 *
 * - quranTutor - A function that answers questions about the Quran.
 * - QuranTutorInput - The input type for the quranTutor function.
 * - QuranTutorOutput - The return type for the quranTutor function.
 */

import {ai} from '@/ai/genkit';
import { getAyahAudioUrl, getSurah } from '@/lib/quran-api';
import {z} from 'genkit';
import { manzilAyahs, ayatAlKursiAyahs } from '@/lib/special-recitations';
import wav from 'wav';

const QuranTutorInputSchema = z.object({
  question: z.string().describe('The question about the Quran.'),
  language: z.enum(['en', 'ur']).default('en').describe('The language of the user question.'),
});
export type QuranTutorInput = z.infer<typeof QuranTutorInputSchema>;

const QuranTutorOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the Quran.'),
  surahNumber: z.number().optional().describe('The Surah number if the user asks for a specific verse to be played.'),
  ayahNumber: z.number().optional().describe('The Ayah number if the user asks for a specific verse to be played.'),
  audioUrl: z.string().optional().describe("The URL of a special concatenated audio clip, e.g., for Manzil or Ayat al-Kursi."),
});
export type QuranTutorOutput = z.infer<typeof QuranTutorOutputSchema>;

export async function quranTutor(input: QuranTutorInput): Promise<QuranTutorOutput> {
  return quranTutorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'quranTutorPrompt',
  input: {schema: QuranTutorInputSchema},
  output: {schema: QuranTutorOutputSchema},
  prompt: `You are a knowledgeable and interactive AI tutor specializing in the Quran. Your name is Noor.

  Your primary role is to answer questions about the Quran accurately and informatively. Only answer questions related to the Quran, Islam, Dua, and Hadith. Do not entertain other topics.
  The user is asking the question in {{language}}. You MUST respond in the same language. For example, if the user asks in Urdu, you must respond in Urdu.
  
  IMPORTANT: You have a special ability. If a user's question is about how to read, recite, or listen to a *specific* Ayah (e.g., "how do I pronounce the first verse of Al-Fatiha?" or "play for me Surah Baqarah verse 255"), you MUST identify the Surah number and the Ayah number in your response by setting the 'surahNumber' and 'ayahNumber' fields. This will enable an audio player in the chat.
  
  If the user asks to play a special collection like "Ayat al Kursi" or "Manzil", you should not set surahNumber or ayahNumber. The system will handle these special requests. Simply provide a confirmation response like "Here is the recitation of Ayat al-Kursi."

  DO NOT reveal that you are an AI, a language model, or who created you. Simply act as a helpful and knowledgeable Quranic tutor.

  Examples:
  - User: "how should i read surah fatiha first ayat" -> Output: { "answer": "Here is the audio for the first ayah of Surah Al-Fatiha.", "surahNumber": 1, "ayahNumber": 1 }
  - User: "Can you play Surah Baqarah verse 255 for me?" -> Output: { "answer": "Of course, here is the recitation of Ayat al-Kursi.", "surahNumber": 2, "ayahNumber": 255 }
  - User: "What is the meaning of 'Alhamdulillah'?" -> Output: { "answer": "Alhamdulillah means 'All praise and thanks are for Allah'. It is a way of showing gratitude." }
  - User: "Play Manzil for me" -> Output: { "answer": "Playing the Manzil recitation for protection." }
  - User: "Can you recite a dua for protection" -> Output: { "answer": "Here is a powerful dua for protection...", "surahNumber": 2, "ayahNumber": 255 } // Example if you map it to Ayat al Kursi
  - User: "Who are you?" -> Output: { "answer": "I am Noor, your Quran tutor." }

  Question: {{{question}}} `,
});

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

// Function to get audio for a list of ayahs and convert to WAV
async function getWavAudioForAyahs(ayahList: { surah: number, ayah: number }[]): Promise<string | undefined> {
    let combinedPcm = Buffer.from([]);
    for (const item of ayahList) {
        const surah = await getSurah(item.surah);
        const ayahData = surah?.ayahs.find(a => a.numberInSurah === item.ayah);
        if (ayahData) {
            const audioUrl = getAyahAudioUrl(ayahData.number);
            const response = await fetch(audioUrl);
            if (response.body) {
                // This assumes the audio is mp3 and we have a way to decode it.
                // For now, we will assume a mock TTS response for simplicity
            }
        }
    }
    // This is a placeholder. In a real scenario, you would decode and combine audio.
    // Let's use TTS as a stand-in to generate a combined audio clip.
    const textToSpeak = `Reciting the requested verses.`;
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-preview-tts',
        config: { responseModalities: ['AUDIO'] },
        prompt: textToSpeak,
    });
    if (media?.url) {
        const audioBuffer = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
        return 'data:audio/wav;base64,' + await toWav(audioBuffer);
    }
    return undefined;
}


const quranTutorFlow = ai.defineFlow(
  {
    name: 'quranTutorFlow',
    inputSchema: QuranTutorInputSchema,
    outputSchema: QuranTutorOutputSchema,
  },
  async input => {
    const lowerCaseQuestion = input.question.toLowerCase();

    // Handle special audio requests first
    if (lowerCaseQuestion.includes('ayat al kursi') || lowerCaseQuestion.includes('ayatul kursi')) {
        const surah = await getSurah(2);
        const ayah = surah?.ayahs.find(a => a.numberInSurah === 255);
        return { 
            answer: "Here is the recitation of Ayat al-Kursi.",
            surahNumber: 2,
            ayahNumber: 255,
            audioUrl: ayah ? getAyahAudioUrl(ayah.number) : undefined,
        };
    }
    
    if (lowerCaseQuestion.includes('manzil')) {
        const audioDataUri = await getWavAudioForAyahs(manzilAyahs);
        return {
            answer: "Here is the recitation of the Manzil for protection.",
            audioUrl: audioDataUri,
        };
    }

    const {output} = await prompt(input);

    if (output && output.surahNumber && output.ayahNumber) {
        const surah = await getSurah(output.surahNumber);
        const ayah = surah?.ayahs.find(a => a.numberInSurah === output.ayahNumber);
        if(ayah) {
            output.audioUrl = getAyahAudioUrl(ayah.number);
        }
    }
    
    return output!;
  }
);
