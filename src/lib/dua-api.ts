
import type { Dua } from '@/types/dua';

// This is a static list for simplicity. In a real app, this could come from a database or a dedicated API.
const duas: Dua[] = [
    {
        arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
        englishTranslation: "Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.",
        urduTranslation: "اے ہمارے رب! ہمیں دنیا میں بھلائی عطا فرما اور آخرت میں بھی بھلائی عطا فرما اور ہمیں آگ کے عذاب سے بچا لے۔",
    },
    {
        arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي",
        englishTranslation: "My Lord, expand for me my breast [with assurance] and ease for me my task and untie the knot from my tongue that they may understand my speech.",
        urduTranslation: "اے میرے رب! میرا سینہ میرے لیے کھول دے، اور میرا کام میرے لیے آسان کر دے، اور میری زبان کی گرہ کھول دے، تاکہ وہ میری بات سمجھ سکیں۔",
    },
    {
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
        englishTranslation: "O Allah, I ask You for guidance, piety, abstinence (from the unlawful) and modesty, and contentment and sufficiency.",
        urduTranslation: "اے اللہ! میں تجھ سے ہدایت، تقویٰ، پاکدامنی اور بےنیازی کا سوال کرتا ہوں۔",
    },
    {
        arabic: "رَبِّ زِدْنِي عِلْمًا",
        englishTranslation: "My Lord, increase me in knowledge.",
        urduTranslation: "اے میرے رب! میرے علم میں اضافہ فرما۔",
    },
];

export async function getDuaOfTheDay(): Promise<Dua | null> {
    try {
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const duaIndex = dayOfYear % duas.length;
        return duas[duaIndex];
    } catch (error) {
        console.error("Failed to get Dua of the day:", error);
        return null;
    }
}
