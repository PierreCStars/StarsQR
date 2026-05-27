// Simple scan tracking API endpoint - using same approach as main app
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, updateDoc, increment, serverTimestamp, getDoc } from 'firebase/firestore';

// Use the same Firebase config as the main app
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Function to clean environment variables (remove whitespace and newlines)
const cleanEnvVar = (value) => {
  if (!value) return value;
  return value.trim().replace(/[\r\n]/g, '');
};

// Clean environment variables
const cleanedApiKey = cleanEnvVar(process.env.VITE_FIREBASE_API_KEY);
const cleanedAuthDomain = cleanEnvVar(process.env.VITE_FIREBASE_AUTH_DOMAIN);
const cleanedProjectId = cleanEnvVar(process.env.VITE_FIREBASE_PROJECT_ID);
const cleanedStorageBucket = cleanEnvVar(process.env.VITE_FIREBASE_STORAGE_BUCKET);
const cleanedMessagingSenderId = cleanEnvVar(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
const cleanedAppId = cleanEnvVar(process.env.VITE_FIREBASE_APP_ID);

// Your Firebase configuration with cleaned values
const config = {
  apiKey: cleanedApiKey,
  authDomain: cleanedAuthDomain,
  projectId: cleanedProjectId,
  storageBucket: cleanedStorageBucket,
  messagingSenderId: cleanedMessagingSenderId,
  appId: cleanedAppId
};

// Initialize Firebase
const app = initializeApp(config);
const db = getFirestore(app);

export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📊 Tracking QR code scan...');
    console.log('📊 Request body:', req.body);

    const { 
      qrCodeId, 
      userAgent, 
      ipAddress, 
      referrer,
      shortUrl 
    } = req.body;

    if (!qrCodeId && !shortUrl) {
      return res.status(400).json({ error: 'QR Code ID or Short URL is required' });
    }

    let actualQrCodeId = qrCodeId;

    // If shortUrl is provided, find the QR code by short URL
    if (shortUrl && !qrCodeId) {
      console.log('🔍 Looking up QR code by short URL:', shortUrl);
      
      // This would require a query, but for simplicity, we'll use the shortUrl as the ID
      // In a real implementation, you'd query the database
      actualQrCodeId = shortUrl.split('/').pop(); // Extract the short code
    }

    console.log('📊 Using QR Code ID:', actualQrCodeId);

    // 1. Log the scan in qrCodeScans collection
    const scanData = {
      qrCodeId: actualQrCodeId,
      userAgent: userAgent || 'Unknown',
      ipAddress: ipAddress || 'Unknown',
      referrer: referrer || 'Direct access',
      timestamp: serverTimestamp()
    };

    console.log('📊 Logging scan data:', scanData);

    const scanDocRef = await addDoc(collection(db, 'qrCodeScans'), scanData);
    console.log('✅ Scan logged successfully with ID:', scanDocRef.id);

    // 2. Increment the scan count on the QR code
    try {
      const qrCodeDocRef = doc(db, 'qrCodes', actualQrCodeId);
      await updateDoc(qrCodeDocRef, {
        scanCount: increment(1),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Scan count incremented for QR code:', actualQrCodeId);
    } catch (error) {
      console.warn('⚠️ Could not increment scan count (QR code might not exist):', error.message);
      // Continue anyway - the scan is still logged
    }

    res.status(200).json({
      success: true,
      scanId: scanDocRef.id,
      qrCodeId: actualQrCodeId,
      message: 'Scan tracked successfully'
    });

  } catch (error) {
    console.error('❌ Error tracking scan:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
} 