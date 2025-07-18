// Firebase configuration for Chrome Extension
// IMPORTANT: Replace the placeholder values with your actual Firebase configuration
// You can find these values in your Firebase Console > Project Settings > General > Your apps

const firebaseConfig = {
  apiKey: "AIzaSyD7sueQsP0m-xhFQ4C3YVUMINEMvyBWI2w",
  authDomain: "stars-qr-code.firebaseapp.com",
  projectId: "stars-qr-code",
  storageBucket: "stars-qr-code.appspot.com",
  messagingSenderId: "893928368865",
  appId: "1:893928368865:web:662c503f2e40c4dfdb65a0"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, serverTimestamp }; 