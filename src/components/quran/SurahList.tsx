

import type { Surah } from "@/types/quran";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";

interface SurahListProps {
  surahs: Surah[];
  activeSurah: number;
  title: string;
}

export function SurahList({ surahs, activeSurah, title }: SurahListProps) {
  const { language } = useLanguage();
  
  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <h2 className="text-xl font-headline font-semibold mb-4 text-primary">{title}</h2>
        <nav>
          <ul>
            {surahs.map((surah) => (
              <li key={surah.number}>
                <Link
                  href={`/${language}/read?surah=${surah.number}`}
                  className={cn(
                    "block p-3 rounded-lg transition-colors",
                    activeSurah === surah.number
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent/50"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono w-6 text-center h-6 flex items-center justify-center rounded-full bg-muted text-muted-foreground">
                        {surah.number}
                      </span>
                      <div>
                        <p className="font-semibold font-headline">{surah.englishName}</p>
                        <p className="text-xs text-muted-foreground">{surah.englishNameTranslation}</p>
                      </div>
                    </div>
                    <p className="text-lg font-arabic">{surah.name.replace("سُورَةُ ", "")}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </ScrollArea>
  );
}
