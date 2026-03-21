
"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

export const GeneratorForm = dynamic(() => import('./generator-form').then(mod => mod.GeneratorForm), { 
    ssr: false,
    loading: () => <GeneratorSkeleton />
});

function GeneratorSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Generate a New Exercise</CardTitle>
                <CardDescription>
                Enter a topic and select a difficulty to create a custom ESL exercise.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                <Skeleton className="h-10 w-40" />
            </CardContent>
        </Card>
    )
}

export default function GeneratorPage() {
    return (
      <React.Suspense fallback={<GeneratorSkeleton />}>
        <GeneratorForm />
      </React.Suspense>
    );
}
