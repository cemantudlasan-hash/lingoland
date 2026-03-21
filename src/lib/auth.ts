
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type AuthError,
} from "firebase/auth";
import { initializeFirebase } from "@/firebase";
import { createUserProfile } from "./user";

function getFirebaseAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'The email address is not valid.';
        case 'auth/user-disabled':
            return 'This user account has been disabled.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Invalid email or password. Please try again.';
        case 'auth/email-already-in-use':
            return 'An account already exists with this email address.';
        case 'auth/weak-password':
            return 'The password is too weak. It must be at least 6 characters long.';
        default:
            return 'An unknown authentication error occurred. Please try again.';
    }
}


export async function signUpWithEmail(email: string, password: string) {
  try {
    const { auth } = initializeFirebase();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(userCredential.user);
    return { user: userCredential.user, error: null };
  } catch (e) {
    const error = e as AuthError;
    return { user: null, error: getFirebaseAuthErrorMessage(error.code) };
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const { auth } = initializeFirebase();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (e) {
     const error = e as AuthError;
    return { user: null, error: getFirebaseAuthErrorMessage(error.code) };
  }
}

export async function signOut() {
  try {
    const { auth } = initializeFirebase();
    await firebaseSignOut(auth);
    return { error: null };
  } catch (e) {
    const error = e as AuthError;
    return { error: getFirebaseAuthErrorMessage(error.code) };
  }
}

export async function sendPasswordResetEmail(email: string) {
    try {
        const { auth } = initializeFirebase();
        await firebaseSendPasswordResetEmail(auth, email);
        return { error: null };
    } catch (e) {
        const error = e as AuthError;
        return { error: getFirebaseAuthErrorMessage(error.code) };
    }
}
