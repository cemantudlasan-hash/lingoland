
'use client';
import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { logAnalyticsEvent } from '@/lib/analytics';
import type { Article } from '@/lib/articles';

export function ArticleViewTracker({ article }: { article: Article }) {
    const { user } = useAuth();
    const firestore = useFirestore();

    useEffect(() => {
        if (firestore && article) {
            logAnalyticsEvent(firestore, user?.uid || 'guest', {
                type: 'article_read',
                details: { slug: article.slug, title: article.title }
            });
        }
    // We only want to run this once on mount, so we can ignore the dependency array warnings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firestore]);

    return null; // This component renders nothing
}

    