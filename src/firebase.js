import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured = Object.values(firebaseConfig).every(value => typeof value === 'string' && value.length > 0);
let app = null;
let db = null;
let auth = null;
let isFirebaseEnabled = false;

if (isConfigured) {
  try {
    app = getApps()[0] ?? initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    isFirebaseEnabled = true;
  } catch (err) {
    console.warn('Firebase initialization failed. Falling back to local data only.', err);
  }
} else {
  console.warn('Firebase configuration is missing or incomplete. Using local seeded data only.');
}

export { app, db, auth, isFirebaseEnabled };

export const safeOnAuthStateChanged = (callback) => {
  if (!isFirebaseEnabled || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export const signInWithFirebaseEmail = async (email, password) => {
  if (!isFirebaseEnabled || !auth) {
    throw new Error('Firebase Auth is not configured.');
  }
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOutFirebase = async () => {
  if (!isFirebaseEnabled || !auth) {
    return;
  }
  return signOut(auth);
};

export const createPhoneAuthVerifier = (container, options = { size: 'invisible' }) => {
  if (!isFirebaseEnabled || !auth) {
    return null;
  }
  return new RecaptchaVerifier(container, options, auth);
};

export const signInWithFirebasePhone = async (phoneNumber, appVerifier) => {
  if (!isFirebaseEnabled || !auth) {
    throw new Error('Firebase Auth is not configured.');
  }
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};
