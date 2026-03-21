
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingPlaceholder() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center items-center space-y-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-6 text-center min-h-[20rem] flex flex-col items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
