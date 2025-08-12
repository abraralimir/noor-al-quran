
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Surah } from '@/types/quran';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTranslation } from '@/hooks/use-translation';
import { getSurahTafseer, Tafseer, TafseerAyah } from '@/actions/quran';
import { LoaderCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSearchParams } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

interface TafseerPageClientProps {
  surahs: Surah[];
}

const formSchema = z.object({
  surah: z.string().min(1, 'Please select a Surah.'),
});

export function TafseerPageClient({ surahs }: TafseerPageClientProps) {
  const { t, language } = useTranslation();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Tafseer | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      surah: searchParams.get('surah') || '',
    },
  });

  const selectedSurahNumber = form.watch('surah');
  const selectedSurah = surahs.find(s => s.number.toString() === selectedSurahNumber);
  
  useEffect(() => {
    const surahParam = searchParams.get('surah');
    if (surahParam) {
      form.setValue('surah', surahParam);
      form.handleSubmit(onSubmit)();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, form.setValue]);
  
  useEffect(() => {
    if (selectedSurahNumber) {
        form.handleSubmit(onSubmit)();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSurahNumber]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
        const response = await getSurahTafseer(parseInt(values.surah, 10), language);
        if (response) {
            setResult(response);
        } else {
            setError("Could not retrieve the Tafseer for the selected Surah. Please try again.");
        }
    } catch (e) {
        setError("An unexpected error occurred.");
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('selectSurahForTafseer')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="surah"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('surah')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectSurahPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {surahs.map(surah => (
                            <SelectItem key={surah.number} value={surah.number.toString()}>
                              {surah.number}. {surah.englishName} ({surah.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex justify-center items-center p-8">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
         <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">{result.surah_name}</CardTitle>
                <CardDescription>{t('tafseerBy')} {result.tafseer_name}</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {result.ayahs.map(ayah => (
                       <AccordionItem key={ayah.ayah_number} value={`item-${ayah.ayah_number}`}>
                            <AccordionTrigger>
                                <span className="flex items-center gap-4">
                                   <span className="text-sm font-mono text-accent bg-accent/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                                        {ayah.ayah_number}
                                    </span>
                                    <span className="font-arabic text-xl text-right flex-grow" dir="rtl">{ayah.ayah_text}</span>
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className={cn("px-4 text-base", language === 'ur' ? 'text-right font-urdu' : '')} dir={language === 'ur' ? 'rtl' : 'ltr'}>
                                {ayah.tafseer_text}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
