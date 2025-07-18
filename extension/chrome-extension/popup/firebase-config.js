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

// Initialize Firebase using CDN approach for Chrome extension
let app, db, collection, addDoc, serverTimestamp;

// Load Firebase SDK dynamically
async function initializeFirebase() {
  try {
    console.log('🔥 Initializing Firebase...');
    console.log('📊 Firebase config:', firebaseConfig);
    
    // Load Firebase SDK from CDN
    console.log('📦 Loading Firebase SDK from CDN...');
    const firebaseApp = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const firebaseFirestore = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    console.log('✅ Firebase SDK loaded successfully');
    
    app = firebaseApp.initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized');
    
    db = firebaseFirestore.getFirestore(app);
    console.log('✅ Firestore database initialized');
    
    collection = firebaseFirestore.collection;
    addDoc = firebaseFirestore.addDoc;
    serverTimestamp = firebaseFirestore.serverTimestamp;
    
    console.log('✅ Firebase functions assigned');
    console.log('🔥 Firebase initialized successfully in extension');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return false;
  }
}

// Export functions that will be available after initialization
export { initializeFirebase };

// Export async functions that wait for initialization
export async function getFirebaseFunctions() {
  if (!db) {
    const success = await initializeFirebase();
    if (!success) {
      throw new Error('Failed to initialize Firebase');
    }
  }
  return { db, collection, addDoc, serverTimestamp };
}

// Also export a simple save function for convenience
export async function saveQRCodeToFirebase(qrData) {
  console.log('🔥 saveQRCodeToFirebase called with:', qrData);
  
  try {
    const { db, collection, addDoc, serverTimestamp } = await getFirebaseFunctions();
    console.log('✅ Firebase functions retrieved');
    
    // Add timestamps if not present
    if (!qrData.createdAt) {
      qrData.createdAt = serverTimestamp();
      console.log('📅 Added createdAt timestamp');
    }
    if (!qrData.updatedAt) {
      qrData.updatedAt = serverTimestamp();
      console.log('📅 Added updatedAt timestamp');
    }
    
    console.log('📊 Final QR data for Firebase:', qrData);
    console.log('📝 Adding document to qrCodes collection...');
    
    const docRef = await addDoc(collection(db, 'qrCodes'), qrData);
    console.log('✅ Document added successfully with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error in saveQRCodeToFirebase:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
} 