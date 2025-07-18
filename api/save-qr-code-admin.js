// Secure API endpoint for Chrome extension using Firebase Admin SDK
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let app;
try {
  app = admin.app();
} catch (error) {
  // Initialize if not already initialized
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
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
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore(app);

export default async function handler(req, res) {
  // Enable CORS for Chrome extension
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log('Saving QR code from extension via Admin SDK:', qrData);

    // Add to Firebase using Admin SDK
    const docRef = await db.collection('qrCodes').add(qrData);
    
    console.log('QR code saved successfully with ID:', docRef.id);

    res.status(200).json({
      success: true,
      firebaseId: docRef.id,
      message: 'QR code saved to database via Admin SDK'
    });

  } catch (error) {
    console.error('Error saving QR code via Admin SDK:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
} 