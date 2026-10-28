'use client';

import React, { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, onSnapshot, increment, runTransaction } from 'firebase/firestore';
import { Users } from 'lucide-react';

const BASE_VISITOR_COUNT = 10000;

export function VisitorCounter() {
  const [count, setCount] = useState<number>(BASE_VISITOR_COUNT);
  const [error, setError] = useState<string | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) {
      setError('Firestore is not available.');
      return;
    }

    const counterRef = doc(firestore, 'stats', 'visitorCount');
    const sessionKey = 'visitorCountIncremented';

    const syncAndIncrementCount = async () => {
      const alreadyIncremented = Boolean(sessionStorage.getItem(sessionKey));

      try {
        await runTransaction(firestore, async (transaction) => {
          const docSnap = await transaction.get(counterRef);
          if (!docSnap.exists()) {
            const initial = alreadyIncremented ? BASE_VISITOR_COUNT : BASE_VISITOR_COUNT + 1;
            transaction.set(counterRef, { count: initial });
          } else {
            const currentCount = docSnap.data().count || 0;
            if (currentCount < BASE_VISITOR_COUNT) {
              const nextCount = alreadyIncremented ? BASE_VISITOR_COUNT : BASE_VISITOR_COUNT + 1;
              transaction.update(counterRef, { count: nextCount });
            } else if (!alreadyIncremented) {
              transaction.update(counterRef, { count: currentCount + 1 });
            }
          }
        });
        if (!alreadyIncremented) {
          sessionStorage.setItem(sessionKey, 'true');
        }
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
          const rawCount = docSnap.data().count || 0;
          setCount(Math.max(BASE_VISITOR_COUNT, rawCount));
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

    syncAndIncrementCount().then(loadCount);

    const unsubscribe = onSnapshot(
      counterRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const rawCount = docSnap.data().count || 0;
          setCount(Math.max(BASE_VISITOR_COUNT, rawCount));
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