'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// -------------------------------------------------------
// TYPES
// -------------------------------------------------------
export interface TugPlayer {
  id: string;
  name: string;
  isReady: boolean;
  team: 'blue' | 'red';
  score: number;
  lastAnsweredCorrectly: boolean | null;
}

export interface TugRoomConfig {
  rounds: number;
  timerLimit: number;
  categoryId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  winPullsRequired: number; // e.g. 5 pulls from center
}

export interface TugRoom {
  id: string;
  roomCode: string;
  creatorId: string;
  status: 'lobby' | 'playing' | 'round_end' | 'game_over';
  config: TugRoomConfig;
  currentRound: number;
  currentProblem: {
    question: string;
    answer: string;
    options: string[];
    solutionHint?: string;
  } | null;
  ropePosition: number; // 0 is center, positive = Blue (left), negative = Red (right)
  pullWinnerId: string | null;
  pullWinnerTeam: 'blue' | 'red' | null;
  winnerTeam: 'blue' | 'red' | null;
  players: { [playerId: string]: TugPlayer };
}

// -------------------------------------------------------
// HELPERS
// -------------------------------------------------------
export function generateTugRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getOrCreateTugPlayerId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    const stored = sessionStorage.getItem('tow_player_id');
    if (stored) return stored;
    const newId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('tow_player_id', newId);
    return newId;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

function getDb() {
  return initializeFirebase().firestore;
}

// -------------------------------------------------------
// HOOK
// -------------------------------------------------------
export function useTugRoom() {
  const createRoom = useCallback(
    async (creatorId: string, creatorName: string, config: TugRoomConfig): Promise<string> => {
      const db = getDb();
      const roomCode = generateTugRoomCode();
      const roomRef = doc(db, 'math_tug_rooms', roomCode);

      const creatorPlayer: TugPlayer = {
        id: creatorId,
        name: creatorName,
        isReady: true,
        team: 'blue', // Host is blue by default
        score: 0,
        lastAnsweredCorrectly: null,
      };

      await setDoc(roomRef, {
        id: roomCode,
        roomCode,
        creatorId,
        status: 'lobby',
        config,
        currentRound: 1,
        currentProblem: null,
        ropePosition: 0,
        pullWinnerId: null,
        pullWinnerTeam: null,
        winnerTeam: null,
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
      const roomRef = doc(db, 'math_tug_rooms', code);
      const snapshot = await getDoc(roomRef);

      if (!snapshot.exists()) {
        return { success: false, error: 'Room not found. Check your invite code.' };
      }

      const data = snapshot.data() as TugRoom;

      if (data.status !== 'lobby') {
        return { success: false, error: 'This game has already started.' };
      }

      const players = Object.values(data.players || {});
      if (players.length >= 20) {
        return { success: false, error: 'Room is full (max 20 players).' };
      }

      if (data.players?.[playerId]) {
        return { success: true };
      }

      // Balance teams: place new player on the team with fewer players
      const blueCount = players.filter((p) => p.team === 'blue').length;
      const redCount = players.filter((p) => p.team === 'red').length;
      const assignedTeam: 'blue' | 'red' = blueCount <= redCount ? 'blue' : 'red';

      const newPlayer: TugPlayer = {
        id: playerId,
        name: playerName,
        isReady: false,
        team: assignedTeam,
        score: 0,
        lastAnsweredCorrectly: null,
      };

      await updateDoc(roomRef, { [`players.${playerId}`]: newPlayer });
      return { success: true };
    },
    []
  );

  const selectTeam = useCallback(
    async (roomCode: string, playerId: string, team: 'blue' | 'red') => {
      const db = getDb();
      await updateDoc(doc(db, 'math_tug_rooms', roomCode), {
        [`players.${playerId}.team`]: team,
      });
    },
    []
  );

  const setPlayerReady = useCallback(
    async (roomCode: string, playerId: string, isReady: boolean) => {
      const db = getDb();
      await updateDoc(doc(db, 'math_tug_rooms', roomCode), {
        [`players.${playerId}.isReady`]: isReady,
      });
    },
    []
  );

  const startGame = useCallback(
    async (roomCode: string, firstProblem: TugRoom['currentProblem']) => {
      const db = getDb();
      const roomRef = doc(db, 'math_tug_rooms', roomCode);
      const snapshot = await getDoc(roomRef);
      if (!snapshot.exists()) return;

      const data = snapshot.data() as TugRoom;
      const updatedPlayers = { ...data.players };
      Object.keys(updatedPlayers).forEach((k) => {
        updatedPlayers[k].score = 0;
        updatedPlayers[k].lastAnsweredCorrectly = null;
      });

      await updateDoc(roomRef, {
        status: 'playing',
        currentRound: 1,
        currentProblem: firstProblem,
        ropePosition: 0,
        pullWinnerId: null,
        pullWinnerTeam: null,
        winnerTeam: null,
        players: updatedPlayers,
        timerStartedAt: serverTimestamp(),
      });
    },
    []
  );

  const submitAnswer = useCallback(
    async (roomCode: string, playerId: string, isCorrect: boolean): Promise<void> => {
      const db = getDb();
      const roomRef = doc(db, 'math_tug_rooms', roomCode);

      try {
        await runTransaction(db, async (transaction) => {
          const sfDoc = await transaction.get(roomRef);
          if (!sfDoc.exists()) throw new Error('Room not found');

          const data = sfDoc.data() as TugRoom;
          if (data.status !== 'playing' || data.pullWinnerId !== null) {
            // Already answered correctly by someone else or round ended
            return;
          }

          const player = data.players[playerId];
          if (!player) return;

          const updatedPlayers = { ...data.players };

          if (isCorrect) {
            // Answered correctly first!
            const team = player.team;
            // Shift rope: Blue pulls left (+1), Red pulls right (-1)
            const shift = team === 'blue' ? 1 : -1;
            const newPos = data.ropePosition + shift;

            // Check win condition
            let newStatus: TugRoom['status'] = 'round_end';
            let winnerTeam: 'blue' | 'red' | null = null;

            if (Math.abs(newPos) >= data.config.winPullsRequired) {
              newStatus = 'game_over';
              winnerTeam = newPos > 0 ? 'blue' : 'red';
            }

            updatedPlayers[playerId] = {
              ...player,
              score: player.score + 10,
              lastAnsweredCorrectly: true,
            };

            transaction.update(roomRef, {
              ropePosition: newPos,
              pullWinnerId: playerId,
              pullWinnerTeam: team,
              status: newStatus,
              winnerTeam,
              players: updatedPlayers,
            });
          } else {
            // Wrong answer: mark player status for this round, but round continues
            updatedPlayers[playerId] = {
              ...player,
              lastAnsweredCorrectly: false,
            };
            
            // Check if all players got it wrong
            const playersArray = Object.values(updatedPlayers);
            const allGotWrong = playersArray.length > 0 && playersArray.every((p) => p.lastAnsweredCorrectly === false);

            if (allGotWrong) {
              transaction.update(roomRef, {
                status: 'round_end',
                pullWinnerId: 'all_failed',
                pullWinnerTeam: null,
                players: updatedPlayers,
              });
            } else {
              transaction.update(roomRef, {
                players: updatedPlayers,
              });
            }
          }
        });
      } catch (err) {
        console.error('Answer transaction failed:', err);
      }
    },
    []
  );

  const handleTimeout = useCallback(
    async (roomCode: string) => {
      const db = getDb();
      const roomRef = doc(db, 'math_tug_rooms', roomCode);
      const snapshot = await getDoc(roomRef);
      if (!snapshot.exists()) return;
      const data = snapshot.data() as TugRoom;

      if (data.status !== 'playing' || data.pullWinnerId !== null) return;

      // Round ended in timeout (no pull winner)
      await updateDoc(roomRef, {
        status: 'round_end',
        pullWinnerId: 'timeout',
        pullWinnerTeam: null,
      });
    },
    []
  );

  const startNextRound = useCallback(
    async (roomCode: string, nextProblem: TugRoom['currentProblem'], nextRoundNumber: number) => {
      const db = getDb();
      const roomRef = doc(db, 'math_tug_rooms', roomCode);
      const snapshot = await getDoc(roomRef);
      if (!snapshot.exists()) return;

      const data = snapshot.data() as TugRoom;
      const updatedPlayers = { ...data.players };
      Object.keys(updatedPlayers).forEach((k) => {
        updatedPlayers[k].lastAnsweredCorrectly = null;
      });

      await updateDoc(roomRef, {
        status: 'playing',
        currentRound: nextRoundNumber,
        currentProblem: nextProblem,
        pullWinnerId: null,
        pullWinnerTeam: null,
        players: updatedPlayers,
        timerStartedAt: serverTimestamp(),
      });
    },
    []
  );

  const resetRoom = useCallback(
    async (roomCode: string) => {
      const db = getDb();
      const roomRef = doc(db, 'math_tug_rooms', roomCode);
      await updateDoc(roomRef, {
        status: 'lobby',
        currentRound: 1,
        currentProblem: null,
        ropePosition: 0,
        pullWinnerId: null,
        pullWinnerTeam: null,
        winnerTeam: null,
      });
    },
    []
  );

  const closeRoom = useCallback(
    async (roomCode: string) => {
      const db = getDb();
      const roomRef = doc(db, 'math_tug_rooms', roomCode);
      await setDoc(roomRef, { status: 'game_over', players: {} }, { merge: true });
    },
    []
  );

  return {
    createRoom,
    joinRoom,
    selectTeam,
    setPlayerReady,
    startGame,
    submitAnswer,
    handleTimeout,
    startNextRound,
    resetRoom,
    closeRoom,
  };
}

// -------------------------------------------------------
// ROOM REAL-TIME LISTENER HOOK
// -------------------------------------------------------
export function useTugRoomListener(roomCode: string | null) {
  const [room, setRoom] = useState<TugRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) {
      setRoom(null);
      return;
    }

    setLoading(true);
    const db = getDb();
    const unsub = onSnapshot(
      doc(db, 'math_tug_rooms', roomCode),
      (docSnap) => {
        setLoading(false);
        if (docSnap.exists()) {
          setRoom(docSnap.data() as TugRoom);
          setError(null);
        } else {
          setRoom(null);
          setError('Room not found');
        }
      },
      (err) => {
        setLoading(false);
        setError(err.message);
      }
    );

    return () => unsub();
  }, [roomCode]);

  return { room, loading, error };
}
