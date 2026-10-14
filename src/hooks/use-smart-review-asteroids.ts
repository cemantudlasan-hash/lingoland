import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useAuth } from "@/context/auth-context";

export interface ChallengePayload {
  question: string;
  options: string[];
  correct_answer: string;
}

export interface AsteroidChallengeData {
  error_analysis: string;
  game_type: "MULTIPLE_CHOICE" | "SENTENCE_SCRAMBLE";
  challenge_payload: ChallengePayload;
}

export interface AsteroidItem {
  id: string;
  user_id: string;
  word: string;
  srs_stage: number;
  created_at: any;
  next_review_at: any;
  challenge_data: AsteroidChallengeData;
}

const SRS_INTERVALS: Record<number, number> = {
  1: 5,     // 5 minutes
  2: 20,    // 20 minutes
  3: 60,    // 1 hour
  4: 1440,  // 24 hours
  5: 4320,  // Mastery
};

/**
 * Task 3 Front-End Listening Hook:
 * Runs an active index listener (onSnapshot) querying 'user_asteroids'
 * in real-time, fetching records only when next_review_at <= current date.
 */
export function useSmartReviewAsteroids() {
  const firestore = useFirestore();
  const { user } = useAuth();
  const [asteroids, setAsteroids] = useState<AsteroidItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore || !user?.uid) {
      setAsteroids([]);
      setIsLoading(false);
      return;
    }

    let activeUnsubscribe: (() => void) | null = null;

    const processSnapshot = (snapshot: any, clientFilter = false) => {
      const now = Date.now();
      const items: AsteroidItem[] = [];
      snapshot.forEach((d: any) => {
        const data = d.data() as any;
        if (clientFilter) {
          const reviewTime = data.next_review_at?.toDate
            ? data.next_review_at.toDate().getTime()
            : (data.next_review_at ? new Date(data.next_review_at).getTime() : 0);
          if (reviewTime <= now) {
            items.push({ id: d.id, ...data });
          }
        } else {
          items.push({ id: d.id, ...data });
        }
      });
      setAsteroids(items);
      setIsLoading(false);
      setError(null);
    };

    // Primary query using composite index (user_id == uid and next_review_at <= now)
    const nowTimestamp = Timestamp.fromDate(new Date());
    const compositeQuery = query(
      collection(firestore, "user_asteroids"),
      where("user_id", "==", user.uid),
      where("next_review_at", "<=", nowTimestamp)
    );

    activeUnsubscribe = onSnapshot(
      compositeQuery,
      (snapshot) => {
        processSnapshot(snapshot, false);
      },
      (err) => {
        // If composite index is still building or missing, fallback to single-field query
        console.warn("Composite index building in background; using client-filtered query:", err.message);
        const fallbackQuery = query(
          collection(firestore, "user_asteroids"),
          where("user_id", "==", user.uid)
        );
        activeUnsubscribe = onSnapshot(
          fallbackQuery,
          (fallbackSnapshot) => {
            processSnapshot(fallbackSnapshot, true);
          },
          (fallbackErr) => {
            console.error("Firestore Asteroids fallback listener error:", fallbackErr);
            setError(fallbackErr.message);
            setIsLoading(false);
          }
        );
      }
    );

    return () => {
      if (activeUnsubscribe) {
        activeUnsubscribe();
      }
    };
  }, [firestore, user?.uid]);

  // Client-side helper to submit answer according to SM-2 specifications
  const submitReviewAttempt = async (asteroid: AsteroidItem, userAnswer: string) => {
    if (!firestore || !user?.uid) return { error: "Unauthenticated" };

    const asteroidDocId = asteroid.id;
    const docRef = doc(firestore, "user_asteroids", asteroidDocId);
    const correctAnswer = asteroid.challenge_data?.challenge_payload?.correct_answer || "";
    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    const currentStage = asteroid.srs_stage || 1;
    const now = new Date();

    if (isCorrect) {
      const nextStage = currentStage + 1;
      if (nextStage >= 5) {
        // Shatter and destroy asteroid completely
        await deleteDoc(docRef);
        return { status: "DESTROYED", word: asteroid.word };
      }

      const nextMinutes = SRS_INTERVALS[nextStage] || 60;
      const nextReviewDate = new Date(now.getTime() + nextMinutes * 60 * 1000);
      await updateDoc(docRef, {
        srs_stage: nextStage,
        next_review_at: Timestamp.fromDate(nextReviewDate),
      });
      return { status: "PROMOTED", nextStage, nextReviewDate };
    } else {
      // Demote to Stage 1 (5 minutes)
      const nextReviewDate = new Date(now.getTime() + SRS_INTERVALS[1] * 60 * 1000);
      await updateDoc(docRef, {
        srs_stage: 1,
        next_review_at: Timestamp.fromDate(nextReviewDate),
      });
      return { status: "DEMOTED", nextStage: 1, nextReviewDate };
    }
  };

  // Helper to spawn an asteroid (for testing on localhost)
  const spawnTestAsteroid = async (
    word: string,
    definition: string,
    wrongInput: string
  ) => {
    if (!firestore || !user?.uid) return;
    const cleanWord = word.trim().toLowerCase();
    const asteroidDocId = `${user.uid}_${cleanWord}`;
    const docRef = doc(firestore, "user_asteroids", asteroidDocId);

    const now = new Date();
    // For immediate testing on localhost, set next_review_at to right now
    const asteroidData = {
      user_id: user.uid,
      word: word.trim(),
      srs_stage: 1,
      created_at: Timestamp.fromDate(now),
      next_review_at: Timestamp.fromDate(now),
      challenge_data: {
        error_analysis: `User confused '${word}' with '${wrongInput}'. Target definition: ${definition}`,
        game_type: "MULTIPLE_CHOICE",
        challenge_payload: {
          question: `Which is the accurate definition for "${word}"?`,
          options: [
            definition,
            `Opposite or incorrect usage of ${word}`,
            `Irrelevant distracter concept`,
          ],
          correct_answer: definition,
        },
      },
    };

    await setDoc(docRef, asteroidData);
    return asteroidDocId;
  };

  return {
    asteroids,
    isLoading,
    error,
    submitReviewAttempt,
    spawnTestAsteroid,
  };
}
