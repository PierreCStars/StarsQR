// Content script for Safari Extension
console.log('Stars QR Code Generator content script loaded');

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageInfo') {
    const pageInfo = {
      url: window.location.href,
      title: document.title,
      description: getMetaDescription(),
      favicon: getFavicon()
    };
    sendResponse(pageInfo);
  }
});

// Get meta description from page
function getMetaDescription() {
  const metaDesc = document.querySelector('meta[name="description"]');
  return metaDesc ? metaDesc.getAttribute('content') : '';
}

// Get favicon from page
function getFavicon() {
  const favicon = document.querySelector('link[rel="icon"]') || 
                 document.querySelector('link[rel="shortcut icon"]');
  return favicon ? favicon.href : '';
}

// Inject QR code generator into page (optional feature)
function injectQRGenerator() {
  if (document.getElementById('stars-qr-generator')) return; // Already injected
  
  const container = document.createElement('div');
  container.id = 'stars-qr-generator';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 300px;
  `;
  
  container.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFD700"/>
      </svg>
      <strong>Quick QR Code</strong>
      <button id="close-qr-generator" style="margin-left: auto; background: none; border: none; cursor: pointer; font-size: 18px;">×</button>
    </div>
    <p style="margin-bottom: 12px; color: #64748b;">Generate QR code for this page</p>
    <button id="generate-page-qr" style="width: 100%; padding: 8px 16px; background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
      Generate QR Code
    </button>
  `;
  
  document.body.appendChild(container);
  
  // Close button
  document.getElementById('close-qr-generator').addEventListener('click', () => {
    container.remove();
  });
  
  // Generate QR button
  document.getElementById('generate-page-qr').addEventListener('click', () => {
    const currentUrl = window.location.href;
    // Open popup with current URL
    chrome.runtime.sendMessage({
      action: 'openPopup',
      url: currentUrl
    });
  });
}

// Keyboard shortcut to inject QR generator (Ctrl/Cmd + Shift + Q)
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'Q') {
    event.preventDefault();
    injectQRGenerator();
  }
});

// Auto-inject on certain conditions (optional)
if (window.location.hostname.includes('stars.mc')) {
  // Auto-inject on Stars.mc websites
  setTimeout(injectQRGenerator, 2000);
} 