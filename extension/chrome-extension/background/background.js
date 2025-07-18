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
          sendResponse({ success: true, count: qrCodes.length });
        });
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

 