import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Function to clean environment variables (remove whitespace and newlines)
const cleanEnvVar = (value: string | undefined): string | undefined => {
  if (!value) return value;
  return value.trim().replace(/[\r\n]/g, '');
};

// Clean environment variables
const cleanedApiKey = cleanEnvVar(import.meta.env.VITE_FIREBASE_API_KEY);
const cleanedAuthDomain = cleanEnvVar(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
const cleanedProjectId = cleanEnvVar(import.meta.env.VITE_FIREBASE_PROJECT_ID);
const cleanedStorageBucket = cleanEnvVar(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
const cleanedMessagingSenderId = cleanEnvVar(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
const cleanedAppId = cleanEnvVar(import.meta.env.VITE_FIREBASE_APP_ID);

// Check if any required environment variables are missing
const missingVars = [];
if (!cleanedApiKey) missingVars.push('VITE_FIREBASE_API_KEY');
if (!cleanedAuthDomain) missingVars.push('VITE_FIREBASE_AUTH_DOMAIN');
if (!cleanedProjectId) missingVars.push('VITE_FIREBASE_PROJECT_ID');
if (!cleanedStorageBucket) missingVars.push('VITE_FIREBASE_STORAGE_BUCKET');
if (!cleanedMessagingSenderId) missingVars.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
if (!cleanedAppId) missingVars.push('VITE_FIREBASE_APP_ID');

if (missingVars.length > 0) {
  console.error('❌ Missing Firebase environment variables:', missingVars);
  throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
}

// Your Firebase configuration with cleaned values
const firebaseConfig = {
  apiKey: cleanedApiKey,
  authDomain: cleanedAuthDomain,
  projectId: cleanedProjectId,
  storageBucket: cleanedStorageBucket,
  messagingSenderId: cleanedMessagingSenderId,
  appId: cleanedAppId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with connection settings
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app; 