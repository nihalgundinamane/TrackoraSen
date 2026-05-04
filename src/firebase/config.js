// ─────────────────────────────────────────────
//  Firebase config — TrackoraSen
//  To set up:
//  1. Go to https://console.firebase.google.com
//  2. Create project → "trackorasen"
//  3. Add a Web App → copy the config below
//  4. Enable Authentication → Google sign-in
//  5. Enable Firestore Database → Start in production mode
//     Add rule: allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
//  6. Replace the placeholder values below with your real config
// ─────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY            || "YOUR_API_KEY",
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN        || "YOUR_PROJECT.firebaseapp.com",
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID         || "YOUR_PROJECT_ID",
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET     || "YOUR_PROJECT.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID|| "YOUR_SENDER_ID",
  appId:             process.env.REACT_APP_FIREBASE_APP_ID             || "YOUR_APP_ID",
};

const app      = initializeApp(firebaseConfig);
export const auth     = getAuth(app);
export const db       = getFirestore(app);
export const provider = new GoogleAuthProvider();
