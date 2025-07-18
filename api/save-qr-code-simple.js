// Simple API endpoint for Chrome extension using existing Firebase config
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Use the same Firebase config as the main app
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  // Enable CORS for Chrome extension
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
    const { url, filename, format, utmParams } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Prepare data for Firebase (matching main app structure)
    const qrData = {
      originalUrl: url,
      shortUrl: url, // Extension doesn't shorten URLs by default
      utmSource: utmParams?.utm_source || 'chrome_extension',
      utmMedium: utmParams?.utm_medium || 'qr_code',
      utmCampaign: utmParams?.utm_campaign || '',
      utmTerm: utmParams?.utm_term || '',
      utmContent: utmParams?.utm_content || '',
      fullUrl: url,
      scanCount: 0,
      filename: filename || 'qr-code.png',
      format: format || 'png',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log('Saving QR code from extension (simple):', qrData);

    // Add to Firebase using client SDK
    const docRef = await addDoc(collection(db, 'qrCodes'), qrData);
    
    console.log('QR code saved successfully with ID:', docRef.id);

    res.status(200).json({
      success: true,
      firebaseId: docRef.id,
      message: 'QR code saved to database (simple method)'
    });

  } catch (error) {
    console.error('Error saving QR code (simple):', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
} 