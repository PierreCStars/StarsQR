export interface UTMParams {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term?: string;
  utm_content?: string;
}

export interface QRCodeData {
  id: string;
  originalUrl: string;
  shortUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm?: string;
  utmContent?: string;
  fullUrl: string;
  scanCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastScanned?: Date;
}

export interface QRCodeFormData {
  url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term?: string;
  utm_content?: string;
}

export interface QRCodeScan {
  id?: string;
  qrCodeId: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
} 