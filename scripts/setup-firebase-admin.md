# Firebase Admin SDK Setup Guide

## Step 1: Create Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `stars-qr-code`
3. Go to **Project Settings** (gear icon)
4. Click on **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file

## Step 2: Extract Environment Variables

From the downloaded JSON file, extract these values:

```json
{
  "type": "service_account",
  "project_id": "stars-qr-code",
  "private_key_id": "YOUR_PRIVATE_KEY_ID",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@stars-qr-code.iam.gserviceaccount.com",
  "client_id": "YOUR_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40stars-qr-code.iam.gserviceaccount.com"
}
```

## Step 3: Add Environment Variables to Vercel

Go to your Vercel dashboard and add these environment variables:

```
FIREBASE_PROJECT_ID=stars-qr-code
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@stars-qr-code.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40stars-qr-code.iam.gserviceaccount.com
```

## Step 4: Update Chrome Extension

The Chrome extension will now use the new Admin SDK endpoint:

```javascript
// In background.js
const response = await fetch('https://your-domain.vercel.app/api/save-qr-code-admin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url,
    filename,
    format,
    utmParams
  })
});
```

## Step 5: Test the Integration

1. Deploy the updated API endpoint
2. Test QR code generation with the Chrome extension
3. Verify QR codes appear in Firebase console

## Security Notes

- The service account has full access to your Firebase project
- Keep the private key secure and never commit it to version control
- The Admin SDK bypasses Firebase security rules
- Consider implementing additional rate limiting if needed 