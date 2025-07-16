// Test Firebase Configuration Locally
// Replace the config below with your actual Firebase config

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

console.log('Testing Firebase Config:');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('API Key (first 10 chars):', firebaseConfig.apiKey.substring(0, 10) + '...');

// Test if the project ID looks valid
if (firebaseConfig.projectId && firebaseConfig.projectId.length > 0) {
  console.log('✅ Project ID looks valid');
} else {
  console.log('❌ Project ID is missing or invalid');
}

// Test if API key looks valid
if (firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith('AIza')) {
  console.log('✅ API Key format looks valid');
} else {
  console.log('❌ API Key format looks invalid');
} 