
'use client';

import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface LearningCardProps {
  character?: string;
  name: string;
  description?: string;
  examples?: string;
  isQaida?: boolean;
}

const gradients = [
    'from-sky-400 to-blue-500',
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-orange-500',
    'from-pink-400 to-purple-500',
    'from-red-400 to-yellow-500',
    'from-indigo-400 to-cyan-500',
];

export function LearningCard({
  character,
  name,
  description,
  examples,
  isQaida = false,
}: LearningCardProps) {

  const gradient = useMemo(() => {
    // Simple hash function to pick a gradient based on the character name
    const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[charCodeSum % gradients.length];
  }, [name]);

  return (
    <Card className="group transform hover:-translate-y-1 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-xl border-2 border-transparent hover:border-primary/50 overflow-hidden flex flex-col">
      <div className={cn("h-32 flex items-center justify-center bg-gradient-to-br p-4", gradient)}>
        {isQaida ? (
           <h3 className="font-headline text-2xl font-bold text-white drop-shadow-md text-center">{name}</h3>
        ) : (
          <span className="font-arabic text-7xl font-bold text-white drop-shadow-md">
            {character}
          </span>
        )}
      </div>
      <CardContent className="p-4 text-center bg-card flex flex-col items-center justify-center gap-2 flex-grow">
        {isQaida ? (
            <div className="text-center flex-grow flex flex-col justify-center">
                <p className="text-sm text-muted-foreground mb-2">{description}</p>
                {examples && <p className="font-arabic text-2xl font-bold text-primary">{examples}</p>}
            </div>
        ) : (
          <h3 className="text-xl font-headline font-semibold text-foreground">{name}</h3>
        )}
      </CardContent>
    </Card>
  );
}
