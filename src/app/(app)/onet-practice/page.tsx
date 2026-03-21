
'use client';

import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';

export default function OnetPracticePage() {
    const { isLoading } = useAuth();
    const onetUrl = 'https://studio--studio-7996230591-b4a63.us-central1.hosted.app';

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">O-Net Test Practice</CardTitle>
                    <CardDescription>The O-Net Test Practice will open in a new browser tab.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-6 text-muted-foreground">
                        Click the button below to access the practice test.
                    </p>
                    <Button asChild size="lg">
                        <a href={onetUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-5 w-5" />
                            Open O-Net Practice
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
