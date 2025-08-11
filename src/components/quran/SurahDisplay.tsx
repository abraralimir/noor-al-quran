
'use client';

import { useState, useEffect, useRef, forwardRef } from 'react';
import type { SurahDetails, Ayah } from '@/types/quran';
import { AyahCard } from './AyahCard';
import { SurahBookView } from './SurahBookView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookText, Download, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getSurah } from '@/lib/quran-api';
import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';

interface SurahDisplayProps {
  surahNumber: number;
}


function SurahDisplaySkeleton() {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-6">
            <Skeleton className="h-8 w-56" />
          </div>
          <Separator className="mb-6" />
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-4 py-4 border-b border-border last:border-b-0">
                <div className="flex justify-between items-start gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-grow space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-3/4" />
                  </div>
                </div>
                <div className="pl-12">
                   <Skeleton className="h-6 w-full" />
                   <Skeleton className="h-6 w-1/2 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

export function SurahDisplay({ surahNumber }: SurahDisplayProps) {
  const [surah, setSurah] = useState<SurahDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookView, setIsBookView] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setIsLoading(true);
    getSurah(surahNumber)
      .then(data => {
        setSurah(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [surahNumber]);


  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      setIsBookView(false);
    }
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleBookView = async () => {
    const element = containerRef.current;
    if (!element) return;

    if (!isBookView) {
        if (element.requestFullscreen) {
            await element.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
              setIsBookView(true);
            });
        }
        setIsBookView(true);
    } else {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        }
        setIsBookView(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!surah) return;

    setIsGeneratingPdf(true);

    const pagesMap = surah.ayahs.reduce((acc, ayah) => {
        const pageNumber = ayah.page;
        if (!acc[pageNumber]) {
          acc[pageNumber] = [];
        }
        acc[pageNumber].push(ayah);
        return acc;
      }, {} as Record<number, Ayah[]>);

    const pages = Object.entries(pagesMap).map(([pageNumber, pageAyahs]) => ({
      pageNumber: parseInt(pageNumber, 10),
      ayahs: pageAyahs,
    }));
    
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [800, 1200]
    });

    const printNode = document.createElement('div');
    document.body.appendChild(printNode);
    printNode.style.position = 'absolute';
    printNode.style.left = '-9999px';
    printNode.style.width = '800px';
    printNode.style.height = '1200px';

    const root = createRoot(printNode);

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const printablePageRef = React.createRef<HTMLDivElement>();

        await new Promise<void>(resolve => {
            root.render(
              <PrintablePage ref={printablePageRef} pageAyahs={page.ayahs} surahName={surah.englishName} pageNumber={page.pageNumber} />,
              () => {
                setTimeout(resolve, 500);
              }
            );
        });

        const canvas = await html2canvas(printablePageRef.current!, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          width: 800,
          height: 1200,
        });
        
        const imgData = canvas.toDataURL('image/png');
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, 800, 1200);

        pdf.setFontSize(10);
        pdf.setTextColor(150);
        pdf.text('by Noor Al Quran', 400, 1150, { align: 'center' });
        pdf.setTextColor(0, 0, 255);
        pdf.textWithLink('https://noor-al-quran.vercel.app/', 400, 1170, {url: 'https://noor-al-quran.vercel.app/', align: 'center'});

    }
    
    root.unmount();
    document.body.removeChild(printNode);

    pdf.save(`Surah-${surah.englishName.replace(/ /g, '-')}.pdf`);
    setIsGeneratingPdf(false);
  };
  
  if (isLoading) {
    return <SurahDisplaySkeleton />;
  }

  if (!surah) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Surah Not Found</CardTitle>
          <CardDescription>The requested Surah could not be loaded. Please try again.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-background">
      {isBookView ? (
        <SurahBookView 
          ayahs={surah.ayahs} 
          surahName={surah.englishName}
          onExit={toggleBookView}
        />
      ) : (
        <div className="space-y-8">
            <div className="flex items-center space-x-4 justify-end">
                <Button variant="outline" onClick={toggleBookView}>
                    <BookText className="w-4 h-4 mr-2" />
                    Book View
                </Button>
                 <Button variant="outline" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
                    {isGeneratingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    Download PDF
                </Button>
            </div>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-4xl font-headline">{surah.englishName}</CardTitle>
                    <CardDescription>{surah.englishNameTranslation}</CardDescription>
                  </div>
                  <p className="text-4xl font-arabic font-bold text-primary">{surah.name}</p>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-6" />
                <AyahCard 
                  ayahs={surah.ayahs} 
                  surahNumber={surahNumber} 
                  showTranslation={true} 
                />
              </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}

// A hidden component styled for printing to PDF
const PrintablePage = forwardRef<HTMLDivElement, { pageAyahs: Ayah[], surahName: string, pageNumber: number }>(({ pageAyahs, surahName, pageNumber }, ref) => {
    return (
      <div ref={ref} className="w-[800px] h-[1200px] bg-[#fdfdf7] flex flex-col p-12 box-border font-arabic">
        <div className="flex justify-between items-center pb-4 text-amber-950">
           <h2 className="text-lg font-headline font-bold">{surahName}</h2>
           <h2 className="text-lg font-headline font-bold">Page {pageNumber}</h2>
        </div>
        <div className="flex-1 overflow-hidden p-4 border-2 border-amber-800/20">
            <div dir="rtl" className="text-3xl leading-loose text-amber-950 text-right w-full h-full break-words">
            {pageAyahs.map((ayah) => (
                <React.Fragment key={ayah.number}>
                    {ayah.text}
                    <span className="text-xl font-mono text-accent bg-accent/10 rounded-full w-10 h-10 inline-flex items-center justify-center mx-2 align-middle">
                        {ayah.numberInSurah}
                    </span>
                </React.Fragment>
            ))}
            </div>
        </div>
        <div className="h-16">{/* Footer space */}</div>
      </div>
    );
});
PrintablePage.displayName = 'PrintablePage';
