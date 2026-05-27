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
      console.log('🔥 saveToDatabase requested with:', request);
      saveToDatabase(request.originalUrl, request.shortUrl, request.filename, request.format, request.utmParams, request.fullUrl)
        .then((result) => {
          console.log('✅ Database save result:', result);
          try {
            if (result.success === false) {
              // Handle structured error response
              console.warn('⚠️ Database save failed, using fallback:', result.fallback);
              sendResponse(result);
            } else {
              // Handle success response
              sendResponse({ success: true, firebaseId: result });
            }
          } catch (e) {
            console.log('Response already sent or popup closed');
          }
        })
        .catch((error) => {
          console.error('❌ Unexpected error in saveToDatabase:', error);
          try {
            sendResponse({ 
              success: false, 
              error: error.message,
              fallback: 'chrome_storage',
              timestamp: new Date().toISOString()
            });
          } catch (e) {
            console.log('Response already sent or popup closed');
          }
        });
      return true;
      
    case 'getQRHistory':
      chrome.storage.local.get(['qrCodes'], (result) => {
        sendResponse({ qrCodes: result.qrCodes || [] });
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
async function saveToDatabase(originalUrl, shortUrl, filename, format, utmParams, fullUrl) {
  try {
    console.log('🔥 Saving QR code to database:', { originalUrl, shortUrl, filename, format, utmParams, fullUrl });

    // Prepare the QR code data for the consolidated /api/save-qr-code endpoint,
    // which expects { url, filename, format, utmParams }.
    const qrData = {
      url: fullUrl || originalUrl,
      filename: filename,
      format: format,
      utmParams: utmParams || {}
    };

    // Call the consolidated API endpoint on the stable production domain
    // (not a per-deploy preview URL, which would expire).
    const response = await fetch('https://qr-generator.vercel.app/api/save-qr-code', {
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
    
    return result.firebaseId || 'saved';
    
  } catch (error) {
    console.error('❌ Error saving to database:', error);
    
    // Provide more detailed error information
    const errorDetails = {
      message: error.message,
      type: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      data: { originalUrl, shortUrl, filename, format }
    };
    
    console.error('📋 Detailed error information:', errorDetails);
    
    // Don't throw the error, return a structured error response instead
    return {
      success: false,
      error: error.message,
      details: errorDetails,
      fallback: 'chrome_storage'
    };
  }
}