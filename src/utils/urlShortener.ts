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
  if (domain === 'stars.mc' && breadcrumbs.length >= 7) {
    // Use breadcrumbs at positions 4 and 7 (0-indexed, so positions 3 and 6)
    const breadcrumb4 = breadcrumbs[3] || ''; // 4th breadcrumb (index 3)
    const breadcrumb7 = breadcrumbs[6] || ''; // 7th breadcrumb (index 6)
    
    let finalName = `QR-stars-mc`;
    
    if (breadcrumb4) {
      finalName += `-${breadcrumb4}`;
    }
    
    if (breadcrumb7) {
      finalName += `-${breadcrumb7}`;
    }
    
    return finalName
      .substring(0, 80) // Limit total length
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }
  
  // Normal naming system for other domains
  // Create meaningful breadcrumb path
  let breadcrumbPath = '';
  if (breadcrumbs.length > 0) {
    // Take the most meaningful segments (usually the last 2-3)
    const meaningfulSegments = breadcrumbs.slice(-3);
    breadcrumbPath = meaningfulSegments.join('-');
  }
  
  // Handle query parameters for additional context
  const searchParams = urlObj.searchParams;
  const relevantParams: string[] = [];
  
  // Add relevant query parameters that might be useful for naming
  const relevantParamKeys = ['id', 'product', 'model', 'category', 'type'];
  relevantParamKeys.forEach(key => {
    const value = searchParams.get(key);
    if (value) {
      const cleanValue = value
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 20); // Limit length
      if (cleanValue) {
        relevantParams.push(`${key}-${cleanValue}`);
      }
    }
  });
  
  // Build the final name
  let finalName = `QR-${domain}`;
  
  if (breadcrumbPath) {
    finalName += `-${breadcrumbPath}`;
  }
  
  if (relevantParams.length > 0) {
    finalName += `-${relevantParams.join('-')}`;
  }
  
  // Limit total length and clean up
  return finalName
    .substring(0, 80) // Limit total length
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}; 