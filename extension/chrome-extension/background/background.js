// Chrome Extension Background Script (Manifest V3)
// Service Worker for QR Code Generator

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('QR Code Generator extension installed:', details.reason);
  
  // Set default settings
  chrome.storage.local.set({
    settings: {
      defaultFormat: 'png',
      defaultSize: 256,
      autoShorten: true,
      trackAnalytics: true
    }
  });
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  console.log('Request action:', request.action);
  
  switch (request.action) {
    case 'getCurrentTab':
      console.log('getCurrentTab requested');
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log('Tabs found:', tabs);
        if (tabs[0]) {
          console.log('Sending response with URL:', tabs[0].url);
          sendResponse({ url: tabs[0].url, title: tabs[0].title });
        } else {
          console.log('No active tab found');
          sendResponse({ error: 'No active tab found' });
        }
      });
      return true; // Keep message channel open for async response
      
    case 'openAnalytics':
      chrome.tabs.create({ url: 'https://your-analytics-url.com' });
      sendResponse({ success: true });
      break;
      
    case 'saveQRCode':
      chrome.storage.local.get(['qrCodes'], (result) => {
        const qrCodes = result.qrCodes || [];
        qrCodes.push({
          id: Date.now(),
          url: request.url,
          filename: request.filename,
          format: request.format,
          timestamp: new Date().toISOString(),
          utmParams: request.utmParams
        });
        
        chrome.storage.local.set({ qrCodes }, () => {
          try {
            sendResponse({ success: true, count: qrCodes.length });
          } catch (e) {
            console.log('Response already sent or popup closed');
          }
        });
      });
      return true;
      
    case 'saveToDatabase':
      // Handle Firebase saving in background script via API
      saveToDatabase(request.url, request.filename, request.format, request.utmParams)
        .then((firebaseId) => {
          try {
            sendResponse({ success: true, firebaseId: firebaseId });
          } catch (e) {
            console.log('Response already sent or popup closed');
          }
        })
        .catch((error) => {
          console.error('Database save error:', error);
          try {
            sendResponse({ success: false, error: error.message });
          } catch (e) {
            console.log('Response already sent or popup closed');
          }
        });
      return true;
      
    case 'getQRHistory':
      chrome.storage.local.get(['qrCodes'], (result) => {
        try {
          sendResponse({ qrCodes: result.qrCodes || [] });
        } catch (e) {
          console.log('Response already sent or popup closed');
        }
      });
      return true;
      
    default:
      console.log('Unknown action:', request.action);
      sendResponse({ error: 'Unknown action' });
  }
});

// Handle tab updates to track URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tab.url);
    // Could send message to popup to update URL field
  }
});

// Handle extension icon click (optional - for when popup is not used)
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked on tab:', tab.url);
  // Could open popup programmatically or perform other actions
});

// Save QR code to database via API
async function saveToDatabase(url, filename, format, utmParams) {
  try {
    console.log('🔥 Saving QR code to database:', { url, filename, format, utmParams });

    // Prepare the QR code data
    const qrData = {
      originalUrl: url,
      shortUrl: url, // Will be updated by the API
      utmSource: utmParams?.utm_source || 'chrome_extension',
      utmMedium: utmParams?.utm_medium || 'qr_code',
      utmCampaign: utmParams?.utm_campaign || '',
      utmTerm: utmParams?.utm_term || '',
      utmContent: utmParams?.utm_content || '',
      fullUrl: url,
      scanCount: 0
    };

    // Call the API endpoint
    const response = await fetch('https://qr-generator-5vkixxiuz-pierres-projects-bba7ee64.vercel.app/api/save-qr-code.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(qrData)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ QR code saved to database:', result);
    
    return result.id || 'saved';
    
  } catch (error) {
    console.error('❌ Error saving to database:', error);
    throw error;
  }
}