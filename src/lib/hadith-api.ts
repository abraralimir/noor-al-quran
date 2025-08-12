
import type { Hadith } from '@/types/hadith';

// Using a more reliable Hadith API
const HADITH_API_BASE_URL = 'https://hadith.gq/api/v1/hadiths/random';

interface ApiHadithData {
  id: number;
  hadith_narrated: string;
  hadith_english: string;
  hadith_urdu: string;
  hadith_arabic: string;
  chapter_id: number;
  book_id: number;
  volume: number;
  chapter: {
    chapter_english: string;
    chapter_urdu: string;
  };
  book: {
    book_name_english: string;
    book_name_urdu: string;
  };
}

interface ApiResponse {
  hadith: ApiHadithData;
}

export async function getHadith(): Promise<Hadith | null> {
  try {
    const apiKey = process.env.HADITH_API_KEY;
    if (!apiKey) {
      throw new Error("Hadith API key is not configured in .env file.");
    }
    
    // This API provides random hadith from various books. We can filter for Bukhari if needed,
    // but for "Hadith of the Day", a random one from any authentic book is also good.
    // For now, we will fetch a completely random one.
    const response = await fetch(HADITH_API_BASE_URL, {
      headers: {
        'API-KEY': apiKey,
        'Accept': 'application/json'
      },
      cache: 'no-store' 
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Hadith API Error Response:", errorBody);
      throw new Error(`Failed to fetch hadith. Status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    const apiHadith = data.hadith;

    return {
      hadithNumber: apiHadith.id.toString(),
      english: apiHadith.hadith_english,
      urdu: apiHadith.hadith_urdu,
      englishChapterName: apiHadith.chapter.chapter_english,
      urduChapterName: apiHadith.chapter.chapter_urdu,
    };
  } catch (error) {
    console.error("Error fetching hadith:", error);
    return null;
  }
}
