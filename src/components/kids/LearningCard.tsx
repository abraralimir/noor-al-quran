
'use client';

import Image from 'next/image';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';

interface LearningCardProps {
  character: string;
  name: string;
  imageSrc: string;
  dataAiHint: string;
  gradient: string;
}

export function LearningCard({ character, name, imageSrc, dataAiHint, gradient }: LearningCardProps) {
  return (
    <Card className="group transform hover:-translate-y-2 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl border-4 border-transparent hover:border-primary/50 overflow-hidden">
      <div className={cn("h-32 flex items-center justify-center bg-gradient-to-br", gradient)}>
        <span className="font-arabic text-7xl font-bold text-white drop-shadow-md">
          {character}
        </span>
      </div>
      <CardContent className="p-4 text-center bg-card">
        <h3 className="text-xl font-headline font-semibold text-foreground">{name}</h3>
        <div className="relative h-24 w-24 mx-auto mt-2 rounded-lg overflow-hidden border-2 border-muted">
          <Image
            src={imageSrc}
            alt={name}
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint={dataAiHint}
            className="group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </CardContent>
    </Card>
  );
}
