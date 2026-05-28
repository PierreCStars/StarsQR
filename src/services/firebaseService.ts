// Client-side QR code service.
// All Firestore access now goes through Vercel serverless functions
// (firebase-admin). The browser no longer touches Firestore directly.

export interface QRCodeData {
  id?: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm?: string;
  utmContent?: string;
  fullUrl: string;
  scanCount: number;
  // Timestamps arrive from the API as epoch-millis numbers (or null).
  createdAt: any;
  updatedAt: any;
}

export interface QRCodeScan {
  id?: string;
  qrCodeId: string;
  timestamp: any;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
}

const postJson = (url: string, body: unknown) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

// QR Code Operations
export const createQRCode = async (
  qrData: Omit<QRCodeData, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const r = await postJson('/api/qr-codes', qrData);
  if (!r.ok) {
    throw new Error(`Failed to create QR code (${r.status})`);
  }
  const { id } = await r.json();
  return id;
};

export const getAllQRCodes = async (): Promise<QRCodeData[]> => {
  try {
    const r = await fetch('/api/qr-codes');
    if (!r.ok) return [];
    return await r.json();
  } catch (error) {
    console.error('❌ Error fetching QR codes:', error);
    return [];
  }
};

export const deleteQRCode = async (id: string): Promise<void> => {
  const r = await postJson('/api/qr-code-delete', { id });
  if (!r.ok) {
    throw new Error(`Failed to delete QR code (${r.status})`);
  }
};

export const clearAllQRCodes = async (): Promise<void> => {
  const r = await postJson('/api/qr-codes-clear', {});
  if (!r.ok) {
    throw new Error(`Failed to clear QR codes (${r.status})`);
  }
};

export const incrementScanCount = async (id: string): Promise<void> => {
  const r = await postJson('/api/qr-code-increment', { id });
  if (!r.ok) {
    throw new Error(`Failed to increment scan count (${r.status})`);
  }
};
