import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const clean = (v) => (v ? String(v).trim().replace(/[\r\n]/g, '') : v);

const config = {
  apiKey: clean(process.env.VITE_FIREBASE_API_KEY),
  authDomain: clean(process.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: clean(process.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: clean(process.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: clean(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: clean(process.env.VITE_FIREBASE_APP_ID),
};

const app = getApps().length ? getApps()[0] : initializeApp(config);
export const db = getFirestore(app);
