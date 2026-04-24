'use client';

import React, { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, setDoc, onSnapshot, increment } from 'firebase/firestore';
import { Users } from 'lucide-react';

export function VisitorCounter() {
  const [count, setCount] = useState<number>(0);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;

    const counterRef = doc(firestore, 'stats', 'visitorCount');
    const sessionKey = 'visitorCountIncremented';

    // Only increment once per browser session
    const incrementCount = async () => {
      if (sessionStorage.getItem(sessionKey)) {
        // Already incremented this session, just listen for updates
        console.log('Visitor counter: Already incremented this session');
        return;
      }

      try {
        console.log('Visitor counter: Attempting to increment...');
        const docSnap = await getDoc(counterRef);
        if (docSnap.exists()) {
          console.log('Visitor counter: Document exists, incrementing...');
          // Document exists, increment it
          await updateDoc(counterRef, {
            count: increment(1)
          });
        } else {
          console.log('Visitor counter: Document does not exist, creating...');
          // Document doesn't exist, create it with count 1
          await setDoc(counterRef, {
            count: 1
          });
        }
        // Mark as incremented for this session
        sessionStorage.setItem(sessionKey, 'true');
        console.log('Visitor counter: Successfully incremented');
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

    return () => {
      unsubscribe();
    };
  }, [firestore]);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium backdrop-blur-sm border border-white/20 z-50">
      <Users className="h-4 w-4" />
      <span>{count.toLocaleString()} lifetime visitors</span>
    </div>
  );
}