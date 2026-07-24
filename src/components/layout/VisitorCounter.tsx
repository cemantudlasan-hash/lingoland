'use client';

import React, { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, onSnapshot, increment, runTransaction } from 'firebase/firestore';
import { Users } from 'lucide-react';

export function VisitorCounter() {
  const [count, setCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) {
      setError('Firestore is not available.');
      return;
    }

    const counterRef = doc(firestore, 'stats', 'visitorCount');
    const sessionKey = 'visitorCountIncremented';

    const incrementCount = async () => {
      if (sessionStorage.getItem(sessionKey)) {
        return;
      }

      try {
        await runTransaction(firestore, async (transaction) => {
          const docSnap = await transaction.get(counterRef);
          if (!docSnap.exists()) {
            transaction.set(counterRef, { count: 1 });
          } else {
            const currentCount = docSnap.data().count || 0;
            transaction.update(counterRef, { count: currentCount + 1 });
          }
        });
        sessionStorage.setItem(sessionKey, 'true');
      } catch (transactionError: unknown) {
        console.error('Visitor counter transaction failed:', transactionError);
        setError(
          transactionError instanceof Error
            ? `Unable to update visitor count: ${transactionError.message}`
            : 'Unable to update visitor count.'
        );
      }
    };

    const loadCount = async () => {
      try {
        const docSnap = await getDoc(counterRef);
        if (docSnap.exists()) {
          setCount(docSnap.data().count || 0);
          setError(null);
        }
      } catch (loadError: unknown) {
        console.error('Visitor counter load error:', loadError);
        if (!error) {
          setError(
            loadError instanceof Error
              ? `Unable to load visitor count: ${loadError.message}`
              : 'Unable to load visitor count.'
          );
        }
      }
    };

    incrementCount().then(loadCount);

    const unsubscribe = onSnapshot(
      counterRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setCount(docSnap.data().count || 0);
          setError(null);
        }
      },
      (snapshotError) => {
        console.error('Visitor counter snapshot error:', snapshotError);
        setError(
          snapshotError instanceof Error
            ? `Unable to load visitor count: ${snapshotError.message}`
            : 'Unable to load visitor count.'
        );
      }
    );

    return () => {
      unsubscribe();
    };
  }, [firestore]);

  return (
    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-400 mt-4 pt-4 border-t border-white/5">
      <Users className="h-3.5 w-3.5 text-indigo-400" />
      <span>{error ? error : `${count.toLocaleString()} lifetime visitors`}</span>
    </div>
  );
}