# QR Code Generator with UTM Tracking

A React-based web application for generating QR codes with UTM tracking parameters and analytics. Built with TypeScript, Tailwind CSS, and Firebase for data persistence.

## Features

- **QR Code Generation**: Create QR codes in PNG and SVG formats
- **UTM Parameter Management**: Built-in dropdowns for Source, Medium, Campaign, Term, and Content
- **URL Auto-shortening**: Automatic URL shortening for cleaner QR codes
- **Analytics & Tracking**: Track scan counts and view detailed analytics
- **Firebase Integration**: Cloud database for data persistence and real-time updates
- **Responsive Design**: Modern UI that works on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **QR Code Generation**: qrcode library
- **Database**: Firebase Firestore
- **Build Tool**: Vite
- **Icons**: Lucide React

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Firestore Database in your project

### 2. Configure Firestore Security Rules

In your Firebase Console, go to Firestore Database > Rules and update the rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to qrCodes collection
    match /qrCodes/{document} {
      allow read, write: if true;
    }
    
    // Allow read/write access to qrCodeScans collection
    match /qrCodeScans/{document} {
      allow read, write: if true;
    }
  }
}
```

### 3. Get Firebase Configuration

1. In Firebase Console, go to Project Settings
2. Scroll down to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Register your app and copy the configuration

### 4. Set Environment Variables

1. Copy `env.example` to `.env`
2. Fill in your Firebase configuration values:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd QR-generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see Firebase Setup above)

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Usage

### Generating QR Codes

1. Navigate to the "Generate QR Code" tab
2. Enter your target URL
3. Select UTM parameters from the dropdowns:
   - **Source**: Showroom, Le_Pneu, Midi_Pneu, Agency, Event
   - **Medium**: Displays, Stickers, Brochure
   - **Campaign**: Car Sales, Yachting Charter, Yachting Sales, Real Estate, Events
4. Optionally add UTM Term and Content
5. Click "Generate QR Code"
6. Download in PNG or SVG format

### Viewing Analytics

1. Navigate to the "Analytics & Tracking" tab
2. View overview statistics:
   - Total QR codes generated
   - Total scans across all codes
   - Average scans per code
3. Browse individual QR codes with:
   - Scan counts
   - Creation dates
   - UTM parameters
   - Download options

### URL Shortening

- URLs are automatically shortened when you finish typing (on blur)
- Shortened URLs are stored in Firebase
- Redirect functionality tracks scans and analytics

## Project Structure

```
src/
├── components/          # React components
│   ├── QRCodeGenerator.tsx
│   ├── QRCodeTracker.tsx
│   └── URLRedirect.tsx
├── config/             # Firebase configuration
│   └── firebase.ts
├── services/           # Firebase service functions
│   └── firebaseService.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── utm.ts
│   └── urlShortener.ts
└── App.tsx             # Main application component
```

## Database Schema

### QR Codes Collection
```typescript
{
  id: string;
  originalUrl: string;
  shortUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm?: string;
  utmContent?: string;
  fullUrl: string;
  scanCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### QR Code Scans Collection
```typescript
{
  id: string;
  qrCodeId: string;
  timestamp: Timestamp;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
}
```

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up
3. Import your GitHub repository
4. Add your Firebase environment variables in Vercel's dashboard
5. Deploy!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Deploy to Firebase Hosting (Alternative)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase:
```bash
firebase init hosting
```

3. Deploy:
```bash
firebase deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository. 