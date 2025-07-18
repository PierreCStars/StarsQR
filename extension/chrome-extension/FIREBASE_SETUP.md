# Firebase Integration Setup for Chrome Extension

## Overview
The Chrome extension now integrates with the main app's Firebase database, so all QR codes generated from the extension will be saved to the same database as the web app.

## Setup Instructions

### 1. Get Your Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (the same one used by the main web app)
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. Find your web app or create a new one
7. Copy the configuration values

### 2. Update Firebase Configuration
Edit `extension/chrome-extension/popup/firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};
```

### 3. Configure Firebase Security Rules
Make sure your Firestore security rules allow the extension to write data. In Firebase Console > Firestore Database > Rules, ensure you have:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /qrCodes/{document} {
      allow read, write: if true; // For testing - make more restrictive for production
    }
  }
}
```

### 4. Rebuild and Test
1. Run the build script: `npm run build`
2. Reload the extension in Chrome
3. Generate a QR code
4. Check Firebase Console to see the new document

## Features

### ✅ What's Integrated
- **Unified Database**: All QR codes go to the same Firebase collection
- **Analytics Tracking**: Scan data is tracked in the same system
- **UTM Parameters**: Full UTM tracking support
- **Fallback Storage**: Still saves to Chrome storage as backup

### 📊 Data Structure
The extension saves QR codes with the same structure as the main app:
- `originalUrl`: The original URL
- `shortUrl`: Shortened URL (if applicable)
- `utmSource`: UTM source parameter
- `utmMedium`: UTM medium parameter
- `utmCampaign`: UTM campaign parameter
- `utmTerm`: UTM term parameter (optional)
- `utmContent`: UTM content parameter (optional)
- `fullUrl`: Final URL with UTM parameters
- `scanCount`: Number of scans (starts at 0)
- `filename`: Generated filename
- `format`: QR code format (PNG/SVG)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### 🔄 Sync Benefits
- **Unified Analytics**: View all QR codes in one place
- **Cross-Platform**: Generate on extension, view on web app
- **Consistent Tracking**: Same analytics across all platforms
- **Backup Storage**: Chrome storage as fallback

## Troubleshooting

### Common Issues
1. **CORS Errors**: Make sure Firebase is properly configured
2. **Permission Denied**: Check Firestore security rules
3. **Module Loading**: Ensure Firebase SDK is loading correctly

### Debug Steps
1. Check browser console for errors
2. Verify Firebase configuration values
3. Test with a simple QR code generation
4. Check Firebase Console for new documents

## Security Notes
- The extension uses the same Firebase project as the web app
- Consider implementing authentication for production use
- Review and restrict Firestore security rules as needed 