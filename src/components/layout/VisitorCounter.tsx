'use client';

import React, { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, onSnapshot, increment } from 'firebase/firestore';
import { Users } from 'lucide-react';

export function VisitorCounter() {
  const [count, setCount] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;

    const counterRef = doc(firestore, 'stats', 'visitorCount');

    // Increment the count on load
    const incrementCount = async () => {
      try {
        await setDoc(counterRef, {
          count: increment(1)
        }, { merge: true });
      } catch (error) {
        console.error('Error incrementing visitor count:', error);
      }
    };

    incrementCount();

    // Listen for real-time updates
    const unsubscribe = onSnapshot(counterRef, (docSnap) => {
      if (docSnap.exists()) {
        setCount(docSnap.data().count || 0);
      }
    });

    // Hide after 15 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 15000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [firestore]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium backdrop-blur-sm border border-white/20 z-50">
      <Users className="h-4 w-4" />
      <span>{count.toLocaleString()} visitors</span>
    </div>
  );
}