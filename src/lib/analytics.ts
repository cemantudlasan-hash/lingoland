
'use client';
import { collection, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Firestore } from 'firebase/firestore';
import { allGames } from './games';

type AnalyticsEventData = {
  type: 'game_played' | 'article_read' | 'exercise_generated';
  details: Record<string, any>;
};

// Helper to get daily bonus game deterministically
export function getDailyBonusGame(): { slug: string; bonusAmount: number } {
  const games = allGames;
  if (!games || games.length === 0) return { slug: '', bonusAmount: 0.5 };
  
  // Create a date-based seed using UTC date
  const today = new Date();
  const dateString = `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`;
  
  // Simple hash function to get a deterministic index
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % games.length;
  const game = games[index];
  
  // Deterministic bonus amount between 1.00 and 6.00 (two decimal places)
  const bonusAmount = 1.0 + (Math.abs(hash * 31) % 501) / 100;
  
  return {
    slug: game.slug,
    bonusAmount: parseFloat(bonusAmount.toFixed(2))
  };
}

export type DailyMission = {
  slug: string;
  title: string;
  reward: number;
};

export function getDailyMissions(): DailyMission[] {
  const games = allGames;
  if (!games || games.length < 3) return [];
  
  const today = new Date();
  const dateString = `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`;
  
  const missions: DailyMission[] = [];
  const usedIndices = new Set<number>();
  
  for (let m = 0; m < 3; m++) {
    let hash = 0;
    const seedString = `${dateString}-mission-${m}`;
    for (let i = 0; i < seedString.length; i++) {
      hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    let index = Math.abs(hash) % games.length;
    while (usedIndices.has(index)) {
      index = (index + 1) % games.length;
    }
    usedIndices.add(index);
    
    const game = games[index];
    const reward = 1 + (Math.abs(hash * 17) % 10); // 1 to 10 coins
    
    missions.push({
      slug: game.slug,
      title: game.title,
      reward
    });
  }
  return missions;
}

async function updatePetOnGamePlay(firestore: Firestore | null, userId: string, event?: AnalyticsEventData) {
  const today = new Date();
  const todayUTC = `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`;

  if (userId === 'guest') {
    return;
  }

  if (event?.details?.isMilestone) {
    return;
  }

  if (!firestore) return;

  // Real user: update in Firestore
  try {
    const petRef = doc(firestore, 'user_pets', userId);
    const docSnap = await getDoc(petRef);
    
    const { slug: bonusSlug, bonusAmount } = getDailyBonusGame();
    const isDailyBonus = event?.details?.slug === bonusSlug;

    if (docSnap.exists()) {
      const pet = docSnap.data();
      const isBonusAvailable = isDailyBonus && pet.lastDailyBonusClaimedDate !== todayUTC;
      const extraCoins = isBonusAvailable ? bonusAmount : 0;

      // Handle Daily Drop Missions
      const dailyMissions = getDailyMissions();
      const matchedMission = dailyMissions.find(m => m.slug === event?.details?.slug);
      
      let completedMissions = pet.completedDailyMissions || [];
      const isMissionsDateCurrent = pet.lastDailyMissionsDate === todayUTC;
      if (!isMissionsDateCurrent) {
        completedMissions = [];
      }
      
      let missionReward = 0;
      let missionCompletedText = '';
      if (matchedMission && !completedMissions.includes(matchedMission.slug)) {
        completedMissions.push(matchedMission.slug);
        missionReward = matchedMission.reward;
        missionCompletedText = matchedMission.title;
      }

      let xp = (pet.xp || 0) + 100;
      let level = pet.level || 1;
      let xpNeeded = level * 500;
      if (xp >= xpNeeded) {
        xp -= xpNeeded;
        level += 1;
      }

      const updateData: any = {
        coins: parseFloat(((pet.coins || 0) + extraCoins + missionReward).toFixed(2)),
        xp,
        level,
        energy: Math.min(100, (pet.energy || 100) + 10),
        intelligence: Math.min(100, (pet.intelligence || 50) + 15),
        lastActive: new Date().toISOString(),
        updatedAt: serverTimestamp(),
        completedDailyMissions: completedMissions,
        lastDailyMissionsDate: todayUTC,
      };

      if (isBonusAvailable) {
        updateData.lastDailyBonusClaimedDate = todayUTC;
      }

      await setDoc(petRef, updateData, { merge: true });

      if (typeof window !== 'undefined' && missionReward > 0) {
        window.dispatchEvent(new CustomEvent('lingoland_daily_mission_completed', {
          detail: { title: missionCompletedText, reward: missionReward }
        }));
      }
    } else {
      // Initialize default pet for the user
      const extraCoins = isDailyBonus ? bonusAmount : 0;
      
      const dailyMissions = getDailyMissions();
      const matchedMission = dailyMissions.find(m => m.slug === event?.details?.slug);
      const completedMissions = matchedMission ? [matchedMission.slug] : [];
      const missionReward = matchedMission ? matchedMission.reward : 0;

      const initData: any = {
        userId,
        petType: 'owl',
        petName: 'Lingo',
        level: 1,
        xp: 100,
        energy: 100,
        intelligence: 65,
        mood: 60,
        coins: parseFloat((extraCoins + missionReward).toFixed(2)),
        unlockedCosmetics: [],
        equippedCosmetics: {},
        currentBackground: 'cozy-room',
        lastActive: new Date().toISOString(),
        updatedAt: serverTimestamp(),
        completedDailyMissions: completedMissions,
        lastDailyMissionsDate: todayUTC,
      };

      if (isDailyBonus) {
        initData.lastDailyBonusClaimedDate = todayUTC;
      }

      await setDoc(petRef, initData);

      if (typeof window !== 'undefined' && missionReward > 0) {
        window.dispatchEvent(new CustomEvent('lingoland_daily_mission_completed', {
          detail: { title: matchedMission?.title, reward: missionReward }
        }));
      }
    }
  } catch (err) {
    console.error("Error updating user pet on game play in firestore:", err);
  }
}

export const logAnalyticsEvent = (firestore: Firestore | null, userId: string | 'guest', event: AnalyticsEventData) => {
  if (firestore) {
    const analyticsCollection = collection(firestore, 'analytics');
    addDocumentNonBlocking(analyticsCollection, {
      userId,
      ...event,
      createdAt: serverTimestamp(),
    });
  }

  // Reward pet on game completion
  if (event.type === 'game_played') {
    updatePetOnGamePlay(firestore, userId, event);
    if (typeof window !== 'undefined') {
      try {
        const target = sessionStorage.getItem('lingoland_donation_games_target');
        if (!target) {
          const randomTarget = Math.floor(Math.random() * 4) + 2; // 2, 3, 4, 5
          sessionStorage.setItem('lingoland_donation_games_target', randomTarget.toString());
        }
        const currentCountStr = sessionStorage.getItem('lingoland_classroom_games_played') || '0';
        const currentCount = parseInt(currentCountStr, 10) + 1;
        sessionStorage.setItem('lingoland_classroom_games_played', currentCount.toString());
        window.dispatchEvent(new CustomEvent('lingoland_game_played', { detail: { count: currentCount } }));
      } catch (err) {
        console.error("Error managing game played sessionStorage count:", err);
      }
    }
  }
};



    