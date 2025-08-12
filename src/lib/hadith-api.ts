
import type { Hadith } from '@/types/hadith';

const HADITH_API_BASE_URL = 'https://random-hadith-generator.vercel.app/bukhari/';

interface ApiHadith {
  Hadith_No: string;
  En_Text: string;
  Ur_Text: string;
  En_Chapter_Name: string;
  Ur_Chapter_Name: string;
}

export async function getHadith(): Promise<Hadith | null> {
  try {
    // The API seems to return a random hadith by default from the bukhari collection
    const response = await fetch(HADITH_API_BASE_URL, { cache: 'no-store' }); // Disable caching for random hadith
    if (!response.ok) {
      throw new Error('Failed to fetch hadith from the API');
    }
    const data = await response.json();
    const apiHadith: ApiHadith = data.data;

    // Map the response to our internal Hadith type
    return {
      hadithNumber: apiHadith.Hadith_No,
      english: apiHadith.En_Text,
      urdu: apiHadith.Ur_Text,
      englishChapterName: apiHadith.En_Chapter_Name,
      urduChapterName: apiHadith.Ur_Chapter_Name,
    };
  } catch (error) {
    console.error("Error fetching hadith:", error);
    return null;
  }
}
