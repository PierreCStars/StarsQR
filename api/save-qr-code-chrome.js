// Chrome Extension API endpoint - using same approach as main app
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
}

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
    console.log('📝 Chrome extension saving QR code...');
    console.log('📊 Request body:', req.body);

    const { 
      originalUrl, 
      shortUrl, 
      filename, 
      format, 
      utmParams,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    // Prepare data for Firebase (matching main app structure)
    const qrData = {
      originalUrl: originalUrl,
      shortUrl: shortUrl || originalUrl,
      utmSource: utmSource || utmParams?.utm_source || 'chrome_extension',
      utmMedium: utmMedium || utmParams?.utm_medium || 'qr_code',
      utmCampaign: utmCampaign || utmParams?.utm_campaign || '',
      utmTerm: utmTerm || utmParams?.utm_term || '',
      utmContent: utmContent || utmParams?.utm_content || '',
      fullUrl: originalUrl,
      scanCount: 0,
      filename: filename || 'qr-code.png',
      format: format || 'png',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      source: 'chrome_extension' // Mark as coming from extension
    };

    console.log('📊 Prepared QR data for Firebase:', qrData);

    // Add to Firebase using client SDK
    const docRef = await addDoc(collection(db, 'qrCodes'), qrData);
    
    console.log('✅ QR code saved successfully with ID:', docRef.id);

    res.status(200).json({
      success: true,
      firebaseId: docRef.id,
      message: 'QR code saved to database from Chrome extension'
    });

  } catch (error) {
    console.error('❌ Error saving QR code from extension:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
} 