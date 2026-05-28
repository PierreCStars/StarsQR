// Vercel serverless function to save QR codes from Chrome extension
import { db, FieldValue } from './_lib/firebase.js';

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
    const { url, filename, format, utmParams, shortCode, shortUrl } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Prepare data for Firebase (matching main app structure)
    const qrData = {
      originalUrl: url,
      shortUrl: shortUrl || url, // Extension may send a pre-shortened URL
      shortCode: shortCode || null,
      fullUrl: url,
      utmSource: utmParams?.utm_source || 'chrome_extension',
      utmMedium: utmParams?.utm_medium || 'qr_code',
      utmCampaign: utmParams?.utm_campaign || '',
      utmTerm: utmParams?.utm_term || '',
      utmContent: utmParams?.utm_content || '',
      filename: filename || 'qr-code.png',
      format: format || 'png',
      scanCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Add to Firebase
    const docRef = await db.collection('qrCodes').add(qrData);

    res.status(200).json({
      success: true,
      firebaseId: docRef.id,
      message: 'QR code saved to database',
    });

  } catch (error) {
    console.error('Error saving QR code:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
