
'use client';
import { collection, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Firestore } from 'firebase/firestore';

type AnalyticsEventData = {
  type: 'game_played' | 'article_read' | 'exercise_generated';
  details: Record<string, any>;
};

async function updatePetOnGamePlay(firestore: Firestore, userId: string) {
  if (userId === 'guest') {
    if (typeof window !== 'undefined') {
      const petKey = 'lingoland_guest_pet';
      const petRaw = localStorage.getItem(petKey);
      if (petRaw) {
        try {
          const pet = JSON.parse(petRaw);
          pet.coins = (pet.coins || 0) + 20;
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
        coins: (pet.coins || 0) + 20,
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
        coins: 20,
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
    updatePetOnGamePlay(firestore, userId);
  }
};


    