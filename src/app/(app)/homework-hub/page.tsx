'use client';

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, UserPlus, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomeworkHubPage() {
    const { user, isGuest, isLoading } = useAuth();
    const homeworkHubUrl = 'https://studio--studio-4268485583-459c4.us-central1.hosted.app/';

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        )
    }

    if (isGuest || !user) {
        return (
            <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full gap-4 border border-dashed rounded-lg p-12">
                <UserPlus className="h-16 w-16" />
                <h3 className="text-xl font-bold">Please Login to Access the Homework Hub</h3>
                <p>The Homework Hub is an exclusive feature for our registered members.</p>
                <Button asChild>
                    <Link href="/auth">Sign In or Create Account</Link>
                </Button>
            </div>
        );
    }
    
    // UI for logged-in users that requires a direct click
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">Redirecting to Homework Hub</CardTitle>
                    <CardDescription>The Homework Hub will open in a new browser tab.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-6 text-muted-foreground">
                        Click the button below to proceed.
                    </p>
                    <Button asChild size="lg">
                        <a href={homeworkHubUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-5 w-5" />
                            Open Homework Hub
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
