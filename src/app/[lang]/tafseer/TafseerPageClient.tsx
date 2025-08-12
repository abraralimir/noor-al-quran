
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Surah } from '@/types/quran';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTranslation } from '@/hooks/use-translation';
import { handleTafseerQuery, getAyahText } from '@/actions/quran';
import { LoaderCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSearchParams } from 'next/navigation';

interface TafseerPageClientProps {
  surahs: Surah[];
}

const formSchema = z.object({
  surah: z.string().min(1, 'Please select a Surah.'),
  ayah: z.coerce.number().int().min(1, 'Ayah number must be at least 1.'),
});

interface TafseerResult {
  introduction: string;
  theme: string;
  analysis: string;
}

export function TafseerPageClient({ surahs }: TafseerPageClientProps) {
  const { t, language } = useTranslation();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TafseerResult | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      surah: searchParams.get('surah') || '',
      ayah: Number(searchParams.get('ayah')) || undefined,
    },
  });

  const selectedSurahNumber = form.watch('surah');
  const selectedSurah = surahs.find(s => s.number.toString() === selectedSurahNumber);

  useEffect(() => {
    form.register('ayah', {
        validate: value => {
            if (!selectedSurah) return true;
            if (value > selectedSurah.numberOfAyahs) {
                return `Ayah number cannot exceed ${selectedSurah.numberOfAyahs} for this Surah.`;
            }
            return true;
        }
    });
  }, [form, selectedSurah]);
  
  useEffect(() => {
    const surahParam = searchParams.get('surah');
    const ayahParam = searchParams.get('ayah');
    if (surahParam && ayahParam) {
      form.setValue('surah', surahParam);
      form.setValue('ayah', Number(ayahParam));
      // Automatically submit form if params are present
      form.handleSubmit(onSubmit)();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, form.setValue]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const surah = surahs.find(s => s.number.toString() === values.surah);
    if (!surah) {
        setError("Selected Surah not found.");
        setIsLoading(false);
        return;
    }
    
    if (values.ayah > surah.numberOfAyahs) {
        form.setError("ayah", { type: "manual", message: `This Surah only has ${surah.numberOfAyahs} ayahs.`});
        setIsLoading(false);
        return;
    }
    
    try {
        const ayahText = await getAyahText(surah.number, values.ayah);
        if (!ayahText) {
             setError("Could not retrieve the text for the selected Ayah. Please try again.");
             setIsLoading(false);
             return;
        }

        const response = await handleTafseerQuery(surah.number, values.ayah, surah.englishName, ayahText, language);
        if (response.error) {
            setError(response.error);
        } else if (response.tafseer) {
            setResult(response.tafseer);
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
          <CardTitle>{t('selectVerseForTafseer')}</CardTitle>
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
                <FormField
                  control={form.control}
                  name="ayah"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ayahNumber')}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={t('ayahNumberPlaceholder')} {...field} disabled={!selectedSurahNumber} />
                      </FormControl>
                      {selectedSurah && <p className="text-sm text-muted-foreground">{t('totalAyahs')}: {selectedSurah.numberOfAyahs}</p>}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                {t('getTafseer')}
              </Button>
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
                <CardTitle className="font-headline text-3xl">{t('tafseerResultTitle')} - {selectedSurah?.englishName} {form.getValues('ayah')}</CardTitle>
            </CardHeader>
            <CardContent className={cn("space-y-6", language === 'ur' ? 'text-right font-urdu' : '')} dir={language === 'ur' ? 'rtl' : 'ltr'}>
                <div>
                    <h3 className="text-xl font-bold text-primary mb-2">{t('tafseerIntroduction')}</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.introduction}</p>
                </div>
                 <div>
                    <h3 className="text-xl font-bold text-primary mb-2">{t('tafseerTheme')}</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.theme}</p>
                </div>
                 <div>
                    <h3 className="text-xl font-bold text-primary mb-2">{t('tafseerAnalysis')}</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.analysis}</p>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
