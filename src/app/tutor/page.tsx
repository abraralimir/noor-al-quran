import { TutorChat } from '@/components/quran/TutorChat';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TutorPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="h-[75vh]">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">AI Quran Tutor</CardTitle>
          <CardDescription>Ask questions about the Quran. Our AI tutor, powered by Gemini, is here to help you learn.</CardDescription>
        </CardHeader>
        <TutorChat />
      </Card>
    </div>
  );
}
