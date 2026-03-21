
'use client';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Firestore } from 'firebase/firestore';

type AnalyticsEventData = {
  type: 'game_played' | 'article_read' | 'exercise_generated';
  details: Record<string, any>;
};

export const logAnalyticsEvent = (firestore: Firestore, userId: string | 'guest', event: AnalyticsEventData) => {
  if (!firestore) return;
  const analyticsCollection = collection(firestore, 'analytics');
  addDocumentNonBlocking(analyticsCollection, {
    userId,
    ...event,
    createdAt: serverTimestamp(),
  });
};

    