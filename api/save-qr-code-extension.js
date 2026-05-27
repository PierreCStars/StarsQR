// Chrome Extension API endpoint for saving QR codes
// Simplified version specifically for the extension

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let app;
try {
  app = admin.app();
} catch (error) {
  // Initialize if not already initialized
  const serviceAccount = {
    type: "service_account",
    project_id: "stars-qr-code",
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  };

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "stars-qr-code"
  });
}

const db = admin.firestore(app);

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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'chrome_extension' // Mark as coming from extension
    };

    console.log('📊 Prepared QR data for Firebase:', qrData);

    // Add to Firebase using Admin SDK
    const docRef = await db.collection('qrCodes').add(qrData);
    
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