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