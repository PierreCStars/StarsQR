// Simple URL shortener using hash-based approach
// In a production environment, you'd want to use a proper URL shortening service

export function generateShortCode(): string {
  // Generate a 6-character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function createShortUrl(_originalUrl: string): string {
  // For demo purposes, we'll create a simple short URL
  // In production, this would typically use a service like Bitly, TinyURL, etc.
  const shortCode = generateShortCode();
  
  // You could replace this with your own domain
  const baseUrl = window.location.origin;
  return `${baseUrl}/r/${shortCode}`;
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Store shortened URLs in localStorage for demo purposes
export function saveShortUrl(shortCode: string, originalUrl: string): void {
  const shortUrls = JSON.parse(localStorage.getItem('shortUrls') || '{}');
  shortUrls[shortCode] = originalUrl;
  localStorage.setItem('shortUrls', JSON.stringify(shortUrls));
}

export function getOriginalUrl(shortCode: string): string | null {
  const shortUrls = JSON.parse(localStorage.getItem('shortUrls') || '{}');
  return shortUrls[shortCode] || null;
} 

export const extractPageTitle = async (url: string): Promise<string> => {
  try {
    // Create a serverless function to fetch page titles (to avoid CORS issues)
    const response = await fetch('/api/extract-title', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.title || '';
    }
  } catch (error) {
    console.error('Error extracting page title:', error);
  }
  
  return '';
};

export const generateQRCodeName = (url: string, title?: string): string => {
  if (title && title.trim()) {
    // Clean the title for use as a filename
    const cleanTitle = title
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .substring(0, 50); // Limit length
    
    return `QR-${cleanTitle}`;
  }
  
  // Fallback to URL-based naming
  const urlObj = new URL(url);
  const domain = urlObj.hostname.replace(/^www\./, '');
  const path = urlObj.pathname.split('/').filter(Boolean).join('-');
  
  return `QR-${domain}${path ? `-${path}` : ''}`;
}; 