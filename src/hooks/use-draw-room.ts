'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// -------------------------------------------------------
// TYPES
// -------------------------------------------------------
export interface RoomPlayer {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
  isFinished: boolean;
  finishTimeRemaining: number;
  canvasPathsCount: number;
  canvasData: string;
  teacherChecked: boolean;
  teacherApproved: boolean | null;
  aiMatchScore: number;
  aiCommentary: string;
}

export interface RoomConfig {
  rounds: number;
  timerLimit: number;
  categoryId: string;
}

export interface DrawRoom {
  id: string;
  roomCode: string;
  creatorId: string;
  status: 'lobby' | 'playing' | 'evaluation' | 'summary' | 'scoreboard';
  config: RoomConfig;
  currentRound: number;
  currentWord: string;
  usedWords: string[];
  roundWinnerId: string | null;
  roundWinningReason: string;
  activeEvaluator: 'none' | 'teacher' | 'ai';
  timerStartedAt: { seconds: number; nanoseconds: number } | null;
  players: { [playerId: string]: RoomPlayer };
}

// -------------------------------------------------------
// HELPERS
// -------------------------------------------------------
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    const stored = sessionStorage.getItem('dtw_player_id');
    if (stored) return stored;
    const newId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('dtw_player_id', newId);
    return newId;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

function getDb() {
  return initializeFirebase().firestore;
}

function buildResetPlayerFields(playerIds: string[]): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  playerIds.forEach((pid) => {
    fields[`players.${pid}.isFinished`] = false;
    fields[`players.${pid}.finishTimeRemaining`] = 0;
    fields[`players.${pid}.canvasPathsCount`] = 0;
    fields[`players.${pid}.canvasData`] = '';
    fields[`players.${pid}.teacherChecked`] = false;
    fields[`players.${pid}.teacherApproved`] = null;
    fields[`players.${pid}.aiMatchScore`] = 0;
    fields[`players.${pid}.aiCommentary`] = '';
  });
  return fields;
}

// -------------------------------------------------------
// ROOM ACTIONS HOOK
// -------------------------------------------------------
export function useDrawRoom() {
  const createRoom = useCallback(
    async (creatorId: string, creatorName: string, config: RoomConfig): Promise<string> => {
      const db = getDb();
      const roomCode = generateRoomCode();
      const roomRef = doc(db, 'draw_rooms', roomCode);

      const creatorPlayer: RoomPlayer = {
        id: creatorId,
        name: creatorName,
        score: 0,
        isReady: true,
        isFinished: false,
        finishTimeRemaining: 0,
        canvasPathsCount: 0,
        canvasData: '',
        teacherChecked: false,
        teacherApproved: null,
        aiMatchScore: 0,
        aiCommentary: '',
      };

      await setDoc(roomRef, {
        roomCode,
        creatorId,
        status: 'lobby',
        config,
        currentRound: 1,
        currentWord: '',
        usedWords: [],
        roundWinnerId: null,
        roundWinningReason: '',
        activeEvaluator: 'none',
        timerStartedAt: null,
        players: { [creatorId]: creatorPlayer },
        createdAt: serverTimestamp(),
      });

      return roomCode;
    },
    []
  );

  const joinRoom = useCallback(
    async (
      roomCode: string,
      playerId: string,
      playerName: string
    ): Promise<{ success: boolean; error?: string }> => {
      const db = getDb();
      const code = roomCode.toUpperCase().trim();
      const roomRef = doc(db, 'draw_rooms', code);
      const snapshot = await getDoc(roomRef);

      if (!snapshot.exists()) {
        return { success: false, error: 'Room not found. Check your invite code.' };
      }

      const data = snapshot.data() as DrawRoom;

      if (data.status !== 'lobby') {
        return { success: false, error: 'This game has already started.' };
      }

      const currentPlayerCount = Object.keys(data.players || {}).length;
      if (currentPlayerCount >= 8) {
        return { success: false, error: 'Room is full (max 8 players).' };
      }

      if (data.players?.[playerId]) {
        return { success: true };
      }

      const newPlayer: RoomPlayer = {
        id: playerId,
        name: playerName,
        score: 0,
        isReady: false,
        isFinished: false,
        finishTimeRemaining: 0,
        canvasPathsCount: 0,
        canvasData: '',
        teacherChecked: false,
        teacherApproved: null,
        aiMatchScore: 0,
        aiCommentary: '',
      };

      await updateDoc(roomRef, { [`players.${playerId}`]: newPlayer });
      return { success: true };
    },
    []
  );

  const setPlayerReady = useCallback(
    async (roomCode: string, playerId: string, isReady: boolean) => {
      const db = getDb();
      await updateDoc(doc(db, 'draw_rooms', roomCode), {
        [`players.${playerId}.isReady`]: isReady,
      });
    },
    []
  );

  const startGame = useCallback(
    async (
      roomCode: string,
      playerIds: string[],
      firstWord: string,
      usedWords: string[]
    ) => {
      const db = getDb();
      await updateDoc(doc(db, 'draw_rooms', roomCode), {
        status: 'playing',
        currentRound: 1,
        currentWord: firstWord,
        usedWords,
        timerStartedAt: serverTimestamp(),
        activeEvaluator: 'none',
        roundWinnerId: null,
        roundWinningReason: '',
        ...buildResetPlayerFields(playerIds),
      });
    },
    []
  );

  const startNextRound = useCallback(
    async (
      roomCode: string,
      playerIds: string[],
      roundNumber: number,
      nextWord: string,
      usedWords: string[]
    ) => {
      const db = getDb();
      await updateDoc(doc(db, 'draw_rooms', roomCode), {
        status: 'playing',
        currentRound: roundNumber,
        currentWord: nextWord,
        usedWords,
        timerStartedAt: serverTimestamp(),
        activeEvaluator: 'none',
        roundWinnerId: null,
        roundWinningReason: '',
        ...buildResetPlayerFields(playerIds),
      });
    },
    []
  );

  const submitDrawing = useCallback(
    async (
      roomCode: string,
      playerId: string,
      canvasData: string,
      pathsCount: number,
      timeRemaining: number
    ) => {
      const db = getDb();
      await updateDoc(doc(db, 'draw_rooms', roomCode), {
        [`players.${playerId}.isFinished`]: true,
        [`players.${playerId}.canvasData`]: canvasData,
        [`players.${playerId}.canvasPathsCount`]: pathsCount,
        [`players.${playerId}.finishTimeRemaining`]: Math.max(0, timeRemaining),
      });
    },
    []
  );

  const startEvaluation = useCallback(async (roomCode: string) => {
    const db = getDb();
    await updateDoc(doc(db, 'draw_rooms', roomCode), {
      status: 'evaluation',
      activeEvaluator: 'teacher',
    });
  }, []);

  const teacherCheckPlayer = useCallback(
    async (
      roomCode: string,
      playerId: string,
      approved: boolean,
      pointsToAdd: number,
      currentScore: number
    ) => {
      const db = getDb();
      await updateDoc(doc(db, 'draw_rooms', roomCode), {
        [`players.${playerId}.teacherChecked`]: true,
        [`players.${playerId}.teacherApproved`]: approved,
        [`players.${playerId}.score`]: approved ? currentScore + pointsToAdd : currentScore,
      });
    },
    []
  );

  const proceedToSummary = useCallback(
    async (roomCode: string, winnerId: string | null, winningReason: string) => {
      const db = getDb();
      await updateDoc(doc(db, 'draw_rooms', roomCode), {
        status: 'summary',
        roundWinnerId: winnerId,
        roundWinningReason: winningReason,
      });
    },
    []
  );

  const triggerAIScan = useCallback(
    async (
      roomCode: string,
      currentWord: string,
      players: { [key: string]: RoomPlayer }
    ) => {
      const db = getDb();
      const updates: Record<string, unknown> = { activeEvaluator: 'ai' };

      let highestScore = -1;
      let winnerId: string | null = null;

      Object.values(players).forEach((p) => {
        let matchScore = 0;
        let comment = '';

        if (p.canvasPathsCount === 0) {
          matchScore = 0;
          comment = 'Empty canvas! Did you fall asleep?';
        } else {
          const seed = p.name.length + currentWord.length + p.canvasPathsCount;
          matchScore = 45 + (seed % 8) * 6 + Math.floor(Math.random() * 6);
          if (matchScore > 96) matchScore = 96;
          if (p.canvasPathsCount < 3) matchScore = Math.floor(20 + Math.random() * 20);

          if (matchScore >= 85) comment = 'Stellar work! Clear structural features.';
          else if (matchScore >= 70) comment = 'Recognizable! AI is confident.';
          else if (matchScore >= 50) comment = 'Slightly abstract. AI is confused.';
          else comment = 'Fascinating modern art, but no resemblance to the word.';
        }

        updates[`players.${p.id}.aiMatchScore`] = matchScore;
        updates[`players.${p.id}.aiCommentary`] = comment;

        if (matchScore > highestScore) {
          highestScore = matchScore;
          winnerId = p.id;
        }
      });

      let winningReason = '';
      if (winnerId && highestScore >= 70) {
        const winnerName = players[winnerId]?.name || 'Unknown';
        updates[`players.${winnerId}.score`] = (players[winnerId]?.score || 0) + 10;
        winningReason = `AI declared ${winnerName}'s drawing the closest match with ${highestScore}% accuracy! (+10 pts)`;
      } else {
        winnerId = null;
        winningReason =
          'AI scanned drawings but none exceeded 70% threshold. No points awarded this round.';
      }

      updates['status'] = 'summary';
      updates['roundWinnerId'] = winnerId;
      updates['roundWinningReason'] = winningReason;

      await updateDoc(doc(db, 'draw_rooms', roomCode), updates);
    },
    []
  );

  const updateRoomConfig = useCallback(
    async (roomCode: string, config: RoomConfig) => {
      const db = getDb();
      await updateDoc(doc(db, 'draw_rooms', roomCode), { config });
    },
    []
  );

  const proceedToScoreboard = useCallback(async (roomCode: string) => {
    const db = getDb();
    await updateDoc(doc(db, 'draw_rooms', roomCode), { status: 'scoreboard' });
  }, []);

  const closeRoom = useCallback(async (roomCode: string) => {
    const db = getDb();
    await updateDoc(doc(db, 'draw_rooms', roomCode), { status: 'scoreboard' });
  }, []);

  return {
    createRoom,
    joinRoom,
    setPlayerReady,
    startGame,
    startNextRound,
    submitDrawing,
    startEvaluation,
    teacherCheckPlayer,
    proceedToSummary,
    triggerAIScan,
    updateRoomConfig,
    proceedToScoreboard,
    closeRoom,
  };
}

// -------------------------------------------------------
// REAL-TIME ROOM LISTENER HOOK
// -------------------------------------------------------
export function useRoomListener(roomCode: string | null) {
  const [room, setRoom] = useState<DrawRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) {
      setRoom(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const db = getDb();
    const roomRef = doc(db, 'draw_rooms', roomCode);

    const unsubscribe = onSnapshot(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setRoom({ id: snapshot.id, ...(snapshot.data() as Omit<DrawRoom, 'id'>) });
          setError(null);
        } else {
          setRoom(null);
          setError('Room not found or has been closed.');
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomCode]);

  return { room, loading, error };
}

