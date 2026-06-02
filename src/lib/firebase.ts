// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "lingoland-kpvxp",
  "appId": "1:596969092114:web:146d136d31db1ec35a54cb",
  "storageBucket": "lingoland-kpvxp.firebasestorage.app",
  "apiKey": "AIzaSyCpwdk8psfEfSVsxDpoXvsNinq-0kjPtP0",
  "authDomain": "lingoland-kpvxp.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "596969092114"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence
if (typeof window !== 'undefined') {
  try {
    enableIndexedDbPersistence(db)
      .catch((err) => {
        if (err.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a time.
          console.warn('Firestore persistence failed: multiple tabs open.');
        } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
           console.warn('Firestore persistence not available in this browser.');
        }
      });
  } catch (err) {
    console.error("Firebase persistence error", err);
  }
}


export { app, auth, db, storage };
