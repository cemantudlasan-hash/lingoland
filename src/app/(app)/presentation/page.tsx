
"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

export const PresentationForm = dynamic(() => import('./presentation-form').then(mod => mod.PresentationForm), { 
    ssr: false,
});

function PresentationSkeleton() {
    return (
         <Card>
            <CardHeader className="bg-white text-black">
            <CardTitle>Presentation Maker</CardTitle>
            <CardDescription>
                Enter a topic to generate a presentation outline.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-48" />
                </div>
                <Skeleton className="h-10 w-44" />
            </CardContent>
        </Card>
    )
}

export default function PresentationPage() {
    return (
      <React.Suspense fallback={<PresentationSkeleton />}>
        <PresentationForm />
      </React.Suspense>
    );
}
