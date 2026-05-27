
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, writeBatch, collectionGroup } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";
import type { UserProfile, UserPet } from "./types";
import type { User } from "firebase/auth";


// Function to create a user profile document in Firestore
export async function createUserProfile(user: User) {
  const { firestore } = initializeFirebase();
  const userRef = doc(firestore, "users", user.uid);
  
  let displayName = user.displayName || user.email?.split('@')[0] || `user${user.uid.substring(0, 6)}`;

  // Ensure initial display name is unique
  const usersRef = collection(firestore, "users");
  let newName = displayName;
  let isUnique = false;
  let attempts = 0;
  while (!isUnique && attempts < 10) {
      const q = query(usersRef, where("displayName", "==", newName));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
          isUnique = true;
          displayName = newName;
      } else {
          newName = `${displayName}${Math.floor(Math.random() * 100)}`;
      }
      attempts++;
  }


  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || "",
    displayName: displayName,
    schoolName: "",
    learningGoals: "",
    avatarSeed: user.uid, // Use UID as the initial seed for a unique avatar
    avatarFrame: "none",
    age: "",
    hobbies: "",
    coverPhotoHint: "abstract space",
  };
  await setDoc(userRef, { ...userProfile, createdAt: serverTimestamp() });
}

// Function to get a user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const { firestore } = initializeFirebase();
  const userRef = doc(firestore, "users", uid);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  } else {
    return null;
  }
}

// Function to update a user profile
export async function updateUserProfile(uid: string, data: Partial<Omit<UserProfile, 'uid' | 'email'>>) {
  const { firestore } = initializeFirebase();
  const userRef = doc(firestore, "users", uid);

  // If displayName is being updated, check for uniqueness and sync with posts/comments
  if (data.displayName) {
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("displayName", "==", data.displayName));
    const querySnapshot = await getDocs(q);

    // Check if the name is taken by another user
    if (!querySnapshot.empty && querySnapshot.docs.some(doc => doc.id !== uid)) {
        throw new Error("Display name is already taken. Please choose another one.");
    }
    
    const currentUserProfile = await getUserProfile(uid);
    if (currentUserProfile && currentUserProfile.displayName !== data.displayName) {
        // Sync name across lounge messages and comments in a best-effort batch.
        // Wrapped in try/catch so a sync failure does NOT block the main profile save.
        try {
            const batch = writeBatch(firestore);

            // 1. Sync name in lounge messages (suggestions)
            const loungeQuery = query(collection(firestore, 'suggestions'), where('authorId', '==', uid));
            const loungeDocs = await getDocs(loungeQuery);
            loungeDocs.forEach(doc => {
                batch.update(doc.ref, { authorName: data.displayName });
            });

            // 2. Sync name in own dailyPostComments subcollection only (avoids cross-user permission issues)
            const ownCommentsRef = collection(firestore, 'users', uid, 'dailyPostComments');
            const ownCommentsDocs = await getDocs(ownCommentsRef);
            ownCommentsDocs.forEach(doc => {
                batch.update(doc.ref, { authorName: data.displayName });
            });

            await batch.commit();
        } catch (syncError) {
            // Sync failed — log but do not throw; we still want the profile save to succeed.
            console.warn("[updateUserProfile] Display name sync failed (non-critical):", syncError);
        }
    }
  }

  // Handle side effect: If dailyPost is updated or removed, delete all comments associated with it
  if (data.hasOwnProperty('dailyPost')) {
      const currentProfile = await getUserProfile(uid);
      if (currentProfile && currentProfile.dailyPost !== data.dailyPost) {
          const commentsRef = collection(firestore, 'users', uid, 'dailyPostComments');
          const commentsSnap = await getDocs(commentsRef);
          if (!commentsSnap.empty) {
              const batch = writeBatch(firestore);
              commentsSnap.docs.forEach(d => batch.delete(d.ref));
              await batch.commit();
          }
      }
  }

  // Use a proper awaited write so permission errors surface to the caller (and show in the UI toast).
  await setDoc(userRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

// Function to get user pet details
export async function getUserPet(uid: string): Promise<UserPet | null> {
  const { firestore } = initializeFirebase();
  const petRef = doc(firestore, "user_pets", uid);
  const docSnap = await getDoc(petRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserPet;
  }
  return null;
}

// Function to save user pet details
export async function saveUserPet(uid: string, pet: Partial<UserPet>) {
  const { firestore } = initializeFirebase();
  const petRef = doc(firestore, "user_pets", uid);
  await setDoc(petRef, { ...pet, userId: uid, updatedAt: serverTimestamp() }, { merge: true });
}
