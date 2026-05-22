
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
  
  // Deterministic bonus amount between 0.50 and 2.00 (two decimal places)
  const bonusAmount = 0.5 + (Math.abs(hash * 31) % 151) / 100;
  
  return {
    slug: game.slug,
    bonusAmount: parseFloat(bonusAmount.toFixed(2))
  };
}

async function updatePetOnGamePlay(firestore: Firestore, userId: string, event?: AnalyticsEventData) {
  if (userId === 'guest') {
    if (typeof window !== 'undefined') {
      const petKey = 'lingoland_guest_pet';
      const petRaw = localStorage.getItem(petKey);
      if (petRaw) {
        try {
          const pet = JSON.parse(petRaw);
          
          const { slug: bonusSlug, bonusAmount } = getDailyBonusGame();
          const isDailyBonus = event?.details?.slug === bonusSlug;
          const extraCoins = isDailyBonus ? bonusAmount : 0;

          pet.coins = parseFloat(((pet.coins || 0) + 20 + extraCoins).toFixed(2));
          pet.xp = (pet.xp || 0) + 100;
          pet.energy = Math.min(100, (pet.energy || 100) + 10);
          pet.intelligence = Math.min(100, (pet.intelligence || 50) + 15);
          pet.lastActive = new Date().toISOString();
          
          // Check level-up
          let xpNeeded = pet.level * 500;
          if (pet.xp >= xpNeeded) {
            pet.xp -= xpNeeded;
            pet.level += 1;
          }
          localStorage.setItem(petKey, JSON.stringify(pet));
        } catch (e) {
          console.error("Error updating guest pet on game play:", e);
        }
      }
    }
    return;
  }

  // Real user: update in Firestore
  try {
    const petRef = doc(firestore, 'user_pets', userId);
    const docSnap = await getDoc(petRef);
    
    const { slug: bonusSlug, bonusAmount } = getDailyBonusGame();
    const isDailyBonus = event?.details?.slug === bonusSlug;
    const extraCoins = isDailyBonus ? bonusAmount : 0;

    if (docSnap.exists()) {
      const pet = docSnap.data();
      let xp = (pet.xp || 0) + 100;
      let level = pet.level || 1;
      let xpNeeded = level * 500;
      if (xp >= xpNeeded) {
        xp -= xpNeeded;
        level += 1;
      }
      await setDoc(petRef, {
        coins: parseFloat(((pet.coins || 0) + 20 + extraCoins).toFixed(2)),
        xp,
        level,
        energy: Math.min(100, (pet.energy || 100) + 10),
        intelligence: Math.min(100, (pet.intelligence || 50) + 15),
        lastActive: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } else {
      // Initialize default pet for the user
      await setDoc(petRef, {
        userId,
        petType: 'owl',
        petName: 'Lingo',
        level: 1,
        xp: 100,
        energy: 100,
        intelligence: 65,
        mood: 60,
        coins: parseFloat((20 + extraCoins).toFixed(2)),
        unlockedCosmetics: [],
        equippedCosmetics: {},
        currentBackground: 'cozy-room',
        lastActive: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error("Error updating user pet on game play in firestore:", err);
  }
}

export const logAnalyticsEvent = (firestore: Firestore, userId: string | 'guest', event: AnalyticsEventData) => {
  if (!firestore) return;
  const analyticsCollection = collection(firestore, 'analytics');
  addDocumentNonBlocking(analyticsCollection, {
    userId,
    ...event,
    createdAt: serverTimestamp(),
  });

  // Reward pet on game completion
  if (event.type === 'game_played') {
    updatePetOnGamePlay(firestore, userId, event);
  }
};



    