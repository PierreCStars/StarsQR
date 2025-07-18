// Background service worker for Safari Extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Stars QR Code Generator extension installed');
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'shortenURL') {
    shortenURL(request.url)
      .then(shortUrl => sendResponse({ success: true, shortUrl }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'getCampaigns') {
    getCampaigns()
      .then(campaigns => sendResponse({ success: true, campaigns }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// URL shortening function
async function shortenURL(longUrl) {
  try {
    const response = await fetch('https://qr-generator-8rxt1o5br-pierres-projects-bba7ee64.vercel.app/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: longUrl })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.shortUrl || longUrl;
  } catch (error) {
    console.error('Error shortening URL:', error);
    throw error;
  }
}

// Get campaigns from HubSpot
async function getCampaigns() {
  try {
    const response = await fetch('https://qr-generator-8rxt1o5br-pierres-projects-bba7ee64.vercel.app/api/hubspot-campaigns');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.campaigns || [];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    // Return fallback campaigns
    return [
      'Stars Social',
      'Robb Report',
      'Stars Yachting',
      'Real Estate',
      'Stars Events'
    ];
  }
}

// Context menu for right-click QR generation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'generateQR',
    title: 'Generate QR Code for this page',
    contexts: ['page', 'link']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'generateQR') {
    const url = info.linkUrl || tab.url;
    // Open popup with pre-filled URL
    chrome.action.openPopup();
  }
}); 