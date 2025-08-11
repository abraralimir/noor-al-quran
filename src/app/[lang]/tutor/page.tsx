

'use client';
import { TutorChat } from '@/components/quran/TutorChat';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';

export default function TutorPage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="h-[75vh]">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{t('tutorCardTitle')}</CardTitle>
          <CardDescription>{t('tutorPageDescription')}</CardDescription>
        </CardHeader>
        <TutorChat />
      </Card>
    </div>
  );
}
