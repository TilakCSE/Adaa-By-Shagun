import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Paste YOUR exact config object from the Firebase Console here:
const firebaseConfig = {
  apiKey: "AIzaSyBYK35PtLrs2W1uwl26k_8lv3zO15NHmfo",
  authDomain: "adaa-by-shagun.firebaseapp.com",
  projectId: "adaa-by-shagun",
  storageBucket: "adaa-by-shagun.firebasestorage.app",
  messagingSenderId: "742655853262",
  appId: "1:742655853262:web:4f5aedbe04448893ef069f"
};

// Initialize Firebase (prevents re-initializing if it's already running)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore Database and Authentication
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
