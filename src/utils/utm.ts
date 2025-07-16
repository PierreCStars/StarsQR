import { UTMParams } from '../types';

export function buildUrlWithUTM(baseUrl: string, utmParams: UTMParams): string {
  const url = new URL(baseUrl);
  
  // Add UTM parameters
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value && value.trim()) {
      url.searchParams.set(key, value.trim());
    }
  });
  
  return url.toString();
}

export function validateUTMParams(utmParams: Partial<UTMParams>): boolean {
  const required = ['utm_source', 'utm_medium', 'utm_campaign'];
  return required.every(param => utmParams[param as keyof UTMParams]?.trim());
}

export function generateQRId(): string {
  return `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
} 