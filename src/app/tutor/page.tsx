import { TutorChat } from '@/components/quran/TutorChat';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Quran Tutor | Noor Al Quran',
  description: 'Ask questions and deepen your understanding of the Holy Quran. Our knowledgeable AI tutor is available 24/7 to provide insights and explanations.',
   openGraph: {
    title: 'AI Quran Tutor | Noor Al Quran',
    description: 'Ask questions and deepen your understanding of the Holy Quran.',
    url: '/tutor',
  },
  twitter: {
    title: 'AI Quran Tutor | Noor Al Quran',
    description: 'Ask questions and deepen your understanding of the Holy Quran.',
  },
};

export default function TutorPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="h-[75vh]">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">AI Quran Tutor</CardTitle>
          <CardDescription>Ask questions about the Quran. Our AI tutor, Noor, is here to help you learn.</CardDescription>
        </CardHeader>
        <TutorChat />
      </Card>
    </div>
  );
}
