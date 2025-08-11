
'use client';

import { useState, useEffect, useRef, forwardRef } from 'react';
import type { SurahDetails, Ayah } from '@/types/quran';
import { AyahCard } from './AyahCard';
import { SurahBookView } from './SurahBookView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookText, Download, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import React from 'react';
import { Button } from '../ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';

interface SurahDisplayProps {
  surah: SurahDetails;
}


export function SurahDisplay({ surah }: SurahDisplayProps) {
  const [isBookView, setIsBookView] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset book view if surah changes
  useEffect(() => {
    setIsBookView(false);
  }, [surah]);


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
        try {
            if (element.requestFullscreen) {
                await element.requestFullscreen();
            }
            setIsBookView(true);
        } catch (err) {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            // Fallback for browsers that don't support fullscreen API or if it fails
            setIsBookView(true); 
        }
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
                setTimeout(resolve, 500); // Give it time to render fonts
              }
            );
        });
        
        if (printablePageRef.current) {
            const canvas = await html2canvas(printablePageRef.current, {
              scale: 2,
              useCORS: true,
              backgroundColor: null,
              width: 800,
              height: 1200,
            });
            
            const imgData = canvas.toDataURL('image/png');
            if (i > 0) pdf.addPage([800, 1200], 'portrait');
            pdf.addImage(imgData, 'PNG', 0, 0, 800, 1200);

            pdf.setFontSize(10);
            pdf.setTextColor(150);
            pdf.text('by Noor Al Quran', 400, 1150, { align: 'center' });
            pdf.setTextColor(0, 0, 255);
            pdf.textWithLink('https://noor-al-quran.vercel.app/', 400, 1170, {url: 'https://noor-al-quran.vercel.app/', align: 'center'});
        }

    }
    
    root.unmount();
    document.body.removeChild(printNode);

    pdf.save(`Surah-${surah.englishName.replace(/ /g, '-')}.pdf`);
    setIsGeneratingPdf(false);
  };
  
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
                  surahNumber={surah.number} 
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
