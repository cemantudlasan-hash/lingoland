import { useState, useEffect, useMemo } from "react";
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

export const SRS_INTERVALS: Record<number, number> = {
  1: 5,     // 5 minutes
  2: 20,    // 20 minutes
  3: 60,    // 1 hour
  4: 1440,  // 24 hours
  5: 4320,  // Mastery
};

/**
 * Shuffles an array randomly using the Fisher-Yates algorithm
 * so the correct answer is never predictably Letter A.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates progressive, non-repetitive micro-challenges across SRS stages:
 * Stage 1: Meaning & Definition Recall
 * Stage 2: In-Context Sentence Completion
 * Stage 3: Collocation & Synonym Nuance
 * Stage 4: Mastery Sentence Application
 */
export function generateStageChallenge(
  word: string,
  definition: string,
  targetStage: number
): ChallengePayload {
  const cleanWord = word.trim();

  if (targetStage === 1) {
    const options = shuffleArray([
      definition,
      `Opposite or incorrect definition for "${cleanWord}"`,
      `An unrelated grammatical concept`,
    ]);
    return {
      question: `Stage 1 (Definition): What is the accurate meaning of "${cleanWord}"?`,
      options,
      correct_answer: definition,
    };
  } else if (targetStage === 2) {
    const options = shuffleArray([
      cleanWord,
      `ambiguous`,
      `superficial`,
    ]);
    return {
      question: `Stage 2 (In Context): Complete the sentence: "The professor delivered a ________ lecture that gave every student a deep understanding."`,
      options,
      correct_answer: cleanWord,
    };
  } else if (targetStage === 3) {
    const options = shuffleArray([
      `Closest natural synonym or nuance to "${cleanWord}"`,
      `Contrasting antonym with opposite meaning`,
      `Grammatical distractor`,
    ]);
    return {
      question: `Stage 3 (Nuance): Which option best reflects the authentic usage and connotation of "${cleanWord}"?`,
      options,
      correct_answer: `Closest natural synonym or nuance to "${cleanWord}"`,
    };
  } else {
    const options = shuffleArray([
      `"Her dedication was ${cleanWord.toLowerCase()}, serving as an inspiration to her peers."`,
      `"The bridge was built out of fresh ${cleanWord.toLowerCase()} and glass."`,
      `"He spoke with great ${cleanWord.toLowerCase()} while driving the train."`,
    ]);
    return {
      question: `Stage 4 (Mastery): Which sentence uses "${cleanWord}" in a natural and correct ESL context?`,
      options,
      correct_answer: `"Her dedication was ${cleanWord.toLowerCase()}, serving as an inspiration to her peers."`,
    };
  }
}

/**
 * Task 3 Front-End Listening Hook:
 * Runs an active real-time listener querying 'user_asteroids' isolated to current user_id.
 * Categorizes asteroids into Active (ready for review) and Scheduled (in orbital rest).
 */
export function useSmartReviewAsteroids() {
  const firestore = useFirestore();
  const { user } = useAuth();
  const [allUserAsteroids, setAllUserAsteroids] = useState<AsteroidItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore || !user?.uid) {
      setAllUserAsteroids([]);
      setIsLoading(false);
      return;
    }

    // Query user's asteroids strictly isolated by user.uid
    const userQuery = query(
      collection(firestore, "user_asteroids"),
      where("user_id", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      userQuery,
      (snapshot) => {
        const items: AsteroidItem[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...(d.data() as any) });
        });
        setAllUserAsteroids(items);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore Asteroids listener error:", err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, user?.uid]);

  // Real-time clock tick so scheduled asteroids promote to activeAsteroids automatically when their countdown expires
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Separate into active (due now) and scheduled (in orbital rest)
  const { activeAsteroids, scheduledAsteroids } = useMemo(() => {
    const active: AsteroidItem[] = [];
    const scheduled: AsteroidItem[] = [];

    allUserAsteroids.forEach((item) => {
      const reviewTime = item.next_review_at?.toDate
        ? item.next_review_at.toDate().getTime()
        : item.next_review_at
        ? new Date(item.next_review_at).getTime()
        : 0;

      if (reviewTime <= nowMs) {
        active.push(item);
      } else {
        scheduled.push(item);
      }
    });

    return { activeAsteroids: active, scheduledAsteroids: scheduled };
  }, [allUserAsteroids, nowMs]);

  // Submit user review attempt with non-repeating stage challenge progression
  const submitReviewAttempt = async (
    asteroid: AsteroidItem,
    userAnswer: string
  ) => {
    if (!firestore || !user?.uid) return { error: "Unauthenticated" };

    const asteroidDocId = asteroid.id;
    const docRef = doc(firestore, "user_asteroids", asteroidDocId);
    const correctAnswer =
      asteroid.challenge_data?.challenge_payload?.correct_answer || "";
    const isCorrect =
      userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    const currentStage = asteroid.srs_stage || 1;
    const now = new Date();

    if (isCorrect) {
      const nextStage = currentStage + 1;
      if (nextStage >= 5) {
        // Shatter and destroy asteroid completely from Firestore
        await deleteDoc(docRef);
        return { status: "DESTROYED", word: asteroid.word };
      }

      const nextMinutes = SRS_INTERVALS[nextStage] || 60;
      const nextReviewDate = new Date(now.getTime() + nextMinutes * 60 * 1000);
      const originalDef =
        asteroid.challenge_data?.challenge_payload?.correct_answer ||
        asteroid.word;
      const evolvedChallenge = generateStageChallenge(
        asteroid.word,
        originalDef,
        nextStage
      );

      await updateDoc(docRef, {
        srs_stage: nextStage,
        next_review_at: Timestamp.fromDate(nextReviewDate),
        challenge_data: {
          error_analysis: `Progressed to Stage ${nextStage} Spaced Review (${nextMinutes}m interval).`,
          game_type: "MULTIPLE_CHOICE",
          challenge_payload: evolvedChallenge,
        },
      });
      return { status: "PROMOTED", nextStage, nextReviewDate };
    } else {
      // Demote to Stage 1 (5 minutes) and reset challenge
      const nextReviewDate = new Date(
        now.getTime() + SRS_INTERVALS[1] * 60 * 1000
      );
      const originalDef =
        asteroid.challenge_data?.challenge_payload?.correct_answer ||
        asteroid.word;
      const resetChallenge = generateStageChallenge(
        asteroid.word,
        originalDef,
        1
      );

      await updateDoc(docRef, {
        srs_stage: 1,
        next_review_at: Timestamp.fromDate(nextReviewDate),
        challenge_data: {
          error_analysis: `Incorrect review. Demoted back to Stage 1 (5m reset).`,
          game_type: "MULTIPLE_CHOICE",
          challenge_payload: resetChallenge,
        },
      });
      return { status: "DEMOTED", nextStage: 1, nextReviewDate };
    }
  };

  // Fast-Forward helper: immediately pulls a scheduled asteroid into active review (for testing)
  const fastForwardAsteroid = async (asteroidId: string) => {
    if (!firestore || !user?.uid) return;
    const docRef = doc(firestore, "user_asteroids", asteroidId);
    await updateDoc(docRef, {
      next_review_at: Timestamp.fromDate(new Date()),
    });
  };

  // Helper to spawn a new asteroid with randomized options and varied word pool
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
    const initialChallenge = generateStageChallenge(word, definition, 1);

    const asteroidData = {
      user_id: user.uid,
      word: word.trim(),
      srs_stage: 1,
      created_at: Timestamp.fromDate(now),
      next_review_at: Timestamp.fromDate(now),
      challenge_data: {
        error_analysis: `User confused '${word}' with '${wrongInput}'. Target definition: ${definition}`,
        game_type: "MULTIPLE_CHOICE",
        challenge_payload: initialChallenge,
      },
    };

    await setDoc(docRef, asteroidData);
    return asteroidDocId;
  };

  return {
    asteroids: activeAsteroids,
    activeAsteroids,
    scheduledAsteroids,
    allUserAsteroids,
    isLoading,
    error,
    submitReviewAttempt,
    fastForwardAsteroid,
    spawnTestAsteroid,
  };
}
