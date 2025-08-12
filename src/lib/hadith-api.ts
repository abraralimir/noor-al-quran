
import type { Hadith } from '@/types/hadith';

const HADITH_API_BASE_URL = 'https://random-hadith-generator.vercel.app/bukhari/';

interface ApiHadith {
  Hadith_No: string;
  En_Text: string;
  Ur_Text: string;
  En_Chapter_Name: string;
  Ur_Chapter_Name: string;
}

// The API response is sometimes nested under a "data" key, and sometimes it's the root object.
// This type handles both possibilities.
type ApiResponse = { data: ApiHadith } | ApiHadith;


export async function getHadith(): Promise<Hadith | null> {
  try {
    const response = await fetch(HADITH_API_BASE_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch hadith from the API. Status: ${response.status}`);
    }
    const rawData: ApiResponse = await response.json();
    
    // Check if the data is nested under a 'data' property
    const apiHadith: ApiHadith = 'data' in rawData ? rawData.data : rawData;

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
