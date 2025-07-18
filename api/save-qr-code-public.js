// Public API endpoint for Chrome extension (no authentication required)
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration - using the actual config values
const firebaseConfig = {
  apiKey: "AIzaSyD7sueQsP0m-xhFQ4C3YVUMINEMvyBWI2w",
  authDomain: "stars-qr-code.firebaseapp.com",
  projectId: "stars-qr-code",
  storageBucket: "stars-qr-code.appspot.com",
  messagingSenderId: "893928368865",
  appId: "1:893928368865:web:662c503f2e40c4dfdb65a0"
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

    console.log('📝 Saving QR code from extension:', { url, filename, format, utmParams });

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

    console.log('📊 Prepared QR data:', qrData);

    // Add to Firebase
    const docRef = await addDoc(collection(db, 'qrCodes'), qrData);
    
    console.log('✅ QR code saved successfully with ID:', docRef.id);

    res.status(200).json({
      success: true,
      firebaseId: docRef.id,
      message: 'QR code saved to database'
    });

  } catch (error) {
    console.error('❌ Error saving QR code:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
} 