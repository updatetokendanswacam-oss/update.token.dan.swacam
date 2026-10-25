import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import bundledConfig from '../firebase-applet-config.json';

// Resolves config consistently for AI Studio, GitHub clone, and Vercel production
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {} as any;

const firebaseConfig = {
  projectId: env.VITE_FIREBASE_PROJECT_ID || bundledConfig.projectId || 'gen-lang-client-0520026727',
  appId: env.VITE_FIREBASE_APP_ID || bundledConfig.appId,
  apiKey: env.VITE_FIREBASE_API_KEY || bundledConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || bundledConfig.authDomain || 'gen-lang-client-0520026727.firebaseapp.com',
  firestoreDatabaseId:
    env.VITE_FIREBASE_DATABASE_ID ||
    bundledConfig.firestoreDatabaseId ||
    'ai-studio-depotelupdatetok-a31e9064-79be-4d13-8e70-f4c66d735c45',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || bundledConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || bundledConfig.messagingSenderId,
};

// Initialize Firebase App instance
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Firestore with persistent local cache for multi-tab stability & instant offline access
export const db = (() => {
  const dbId = firebaseConfig.firestoreDatabaseId;
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    }, dbId);
  } catch {
    return dbId ? getFirestore(app, dbId) : getFirestore(app);
  }
})();

// Initialize Firebase Cloud Storage
export const storage = getStorage(app);
