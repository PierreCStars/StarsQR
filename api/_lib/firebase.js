import admin from 'firebase-admin';

// Service-account credentials. Accept the canonical `FIREBASE_*` names AND the
// shorter `PROJECT_ID`/`CLIENT_EMAIL`/`PRIVATE_KEY` aliases as currently set on
// Vercel, plus the VITE_FIREBASE_PROJECT_ID public fallback for projectId.
const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.PROJECT_ID ||
  process.env.VITE_FIREBASE_PROJECT_ID;
const clientEmail =
  process.env.FIREBASE_CLIENT_EMAIL || process.env.CLIENT_EMAIL;
const rawPrivateKey =
  process.env.FIREBASE_PRIVATE_KEY || process.env.PRIVATE_KEY;
// When the key is pasted with literal "\n" sequences, normalize to real newlines.
const privateKey = rawPrivateKey?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

export const db = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;
