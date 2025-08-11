
import { Suspense } from 'react';
import { ListenPageClient } from './ListenPageClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

function ListenPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl"><Skeleton className="h-8 w-48" /></CardTitle>
          <CardDescription><Skeleton className="h-5 w-full" /></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ListenPage() {
  return (
    <Suspense fallback={<ListenPageSkeleton />}>
      <ListenPageClient />
    </Suspense>
  );
}
