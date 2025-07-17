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
    
    return cleanTitle;
  }
  
  // Enhanced URL-based naming with breadcrumbs
  const urlObj = new URL(url);
  const domain = urlObj.hostname.replace(/^www\./, '');
  
  // Extract breadcrumbs from pathname
  const pathSegments = urlObj.pathname.split('/').filter(Boolean);
  
  // Clean and format breadcrumbs
  const breadcrumbs = pathSegments.map(segment => {
    // Remove file extensions and clean the segment
    return segment
      .replace(/\.[^/.]+$/, '') // Remove file extension
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .toLowerCase(); // Convert to lowercase
  }).filter(segment => segment.length > 0); // Remove empty segments
  
  // Special naming for Stars.mc domain
  if (domain === 'stars.mc' && breadcrumbs.length >= 3) {
    // Filter out generic breadcrumbs that don't add value to the name
    const genericTerms = ['voitures', 'occasion', 'monaco', 'autre', 'd039occasion'];
    const meaningfulBreadcrumbs = breadcrumbs.filter(breadcrumb => 
      !genericTerms.includes(breadcrumb) && breadcrumb.length > 2
    );
    
    if (meaningfulBreadcrumbs.length >= 2) {
      // Take brand (first meaningful) and model/variant (last meaningful)
      const brand = meaningfulBreadcrumbs[0];
      const model = meaningfulBreadcrumbs[meaningfulBreadcrumbs.length - 1];
      
      if (brand && model && brand !== model) {
        return `${brand}-${model}`;
      } else if (brand) {
        return brand;
      } else if (model) {
        return model;
      }
    } else if (meaningfulBreadcrumbs.length === 1) {
      return meaningfulBreadcrumbs[0];
    }
  }
  
  // For other domains, create a more meaningful name
  if (breadcrumbs.length > 0) {
    // Filter out generic terms for all domains
    const genericTerms = ['www', 'index', 'home', 'page', 'product', 'item'];
    const meaningfulBreadcrumbs = breadcrumbs.filter(breadcrumb => 
      !genericTerms.includes(breadcrumb) && breadcrumb.length > 2
    );
    
    if (meaningfulBreadcrumbs.length > 0) {
      // Take the most meaningful segments (last 2-3)
      const meaningfulSegments = meaningfulBreadcrumbs.slice(-2);
      return meaningfulSegments.join('-');
    }
  }
  
  // Fallback: use domain name
  return domain.replace(/\./g, '-');
}; 