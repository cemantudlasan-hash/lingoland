
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, writeBatch, collectionGroup } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";
import type { UserProfile } from "./types";
import type { User } from "firebase/auth";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

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
    if(currentUserProfile && currentUserProfile.displayName !== data.displayName) {
        const batch = writeBatch(firestore);

        // 1. Sync name in lounge messages (suggestions)
        const loungeQuery = query(collection(firestore, 'suggestions'), where('authorId', '==', uid));
        const loungeDocs = await getDocs(loungeQuery);
        loungeDocs.forEach(doc => {
            batch.update(doc.ref, { authorName: data.displayName });
        });

        // 2. Sync name in all dailyPostComments using a collection group query
        const commentsQuery = query(collectionGroup(firestore, 'dailyPostComments'), where('authorId', '==', uid));
        const commentsDocs = await getDocs(commentsQuery);
        commentsDocs.forEach(doc => {
            batch.update(doc.ref, { authorName: data.displayName });
        });

        await batch.commit();
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

  setDocumentNonBlocking(userRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
