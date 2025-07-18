// Chrome Extension Content Script
// QR Code Generator Content Script

console.log('QR Code Generator content script loaded');

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  switch (request.action) {
    case 'getPageInfo':
      const pageInfo = {
        url: window.location.href,
        title: document.title,
        description: getMetaDescription(),
        ogImage: getOGImage()
      };
      sendResponse(pageInfo);
      break;
      
    case 'extractBreadcrumbs':
      const breadcrumbs = extractBreadcrumbs();
      sendResponse({ breadcrumbs });
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Get meta description from page
function getMetaDescription() {
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    return metaDesc.getAttribute('content');
  }
  
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) {
    return ogDesc.getAttribute('content');
  }
  
  return '';
}

// Get Open Graph image from page
function getOGImage() {
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) {
    return ogImage.getAttribute('content');
  }
  
  return '';
}

// Extract breadcrumbs from page
function extractBreadcrumbs() {
  const breadcrumbs = [];
  
  // Try to find breadcrumb navigation
  const breadcrumbSelectors = [
    '[class*="breadcrumb"]',
    '[class*="bread-crumb"]',
    '[class*="bread_crumb"]',
    '.breadcrumb',
    '.breadcrumbs',
    'nav[aria-label*="breadcrumb"]',
    'nav[aria-label*="Breadcrumb"]'
  ];
  
  for (const selector of breadcrumbSelectors) {
    const breadcrumbElement = document.querySelector(selector);
    if (breadcrumbElement) {
      const links = breadcrumbElement.querySelectorAll('a');
      links.forEach(link => {
        const text = link.textContent.trim();
        if (text && text.length > 0) {
          breadcrumbs.push(text);
        }
      });
      break;
    }
  }
  
  // If no breadcrumbs found, try to extract from URL path
  if (breadcrumbs.length === 0) {
    const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);
    breadcrumbs.push(...pathParts);
  }
  
  return breadcrumbs;
}

// Add context menu for QR code generation (optional)
document.addEventListener('contextmenu', (event) => {
  // Could add right-click menu for QR generation
  // This would require additional permissions and background script handling
});

// Listen for page title changes
let currentTitle = document.title;
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && document.title !== currentTitle) {
      currentTitle = document.title;
      // Could notify background script of title change
    }
  });
});

observer.observe(document.head, {
  childList: true,
  subtree: true
}); 