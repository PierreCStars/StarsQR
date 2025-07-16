// Test Firebase Configuration
// Run this locally to test your Firebase setup

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test function
async function testFirebase() {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test write
    const docRef = await addDoc(collection(db, "test"), {
      message: "Hello Firebase!",
      timestamp: new Date()
    });
    console.log('✅ Write test passed. Document ID:', docRef.id);
    
    // Test read
    const querySnapshot = await getDocs(collection(db, "test"));
    console.log('✅ Read test passed. Found', querySnapshot.size, 'documents');
    
    console.log('🎉 All Firebase tests passed!');
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
  }
}

// Run test
testFirebase(); 