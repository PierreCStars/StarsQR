import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface QRCodeData {
  id?: string;
  originalUrl: string;
  shortUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm?: string;
  utmContent?: string;
  fullUrl: string;
  scanCount: number;
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

// QR Code Operations
export const createQRCode = async (qrData: Omit<QRCodeData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    console.log('Firebase service received:', JSON.stringify(qrData, null, 2));
    
    // Filter out undefined values
    const cleanData = Object.fromEntries(
      Object.entries(qrData).filter(([key, value]) => {
        console.log(`Checking field ${key}:`, value, typeof value);
        return value !== undefined;
      })
    );
    
    console.log('Clean data for Firebase:', JSON.stringify(cleanData, null, 2));
    
    const docRef = await addDoc(collection(db, 'qrCodes'), {
      ...cleanData,
      scanCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating QR code:', error);
    throw error;
  }
};

export const getAllQRCodes = async (): Promise<QRCodeData[]> => {
  try {
    console.log('🔥 Firebase: Getting all QR codes...');
    const q = query(collection(db, 'qrCodes'), orderBy('createdAt', 'desc'));
    console.log('🔥 Firebase: Query created, executing...');
    const querySnapshot = await getDocs(q);
    console.log('🔥 Firebase: Query executed. Found documents:', querySnapshot.size);
    
    const qrCodes = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('🔥 Firebase: Document data:', { id: doc.id, ...data });
      return {
        id: doc.id,
        ...data
      };
    }) as QRCodeData[];
    
    console.log('🔥 Firebase: Returning QR codes:', qrCodes);
    return qrCodes;
  } catch (error) {
    console.error('❌ Error fetching QR codes:', error);
    throw error;
  }
};

export const getQRCodeById = async (id: string): Promise<QRCodeData | null> => {
  try {
    const docSnap = await getDocs(collection(db, 'qrCodes'));
    const qrCode = docSnap.docs.find(doc => doc.id === id);
    return qrCode ? { id: qrCode.id, ...qrCode.data() } as QRCodeData : null;
  } catch (error) {
    console.error('Error fetching QR code:', error);
    throw error;
  }
};

export const updateQRCode = async (id: string, updates: Partial<QRCodeData>): Promise<void> => {
  try {
    const docRef = doc(db, 'qrCodes', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating QR code:', error);
    throw error;
  }
};

export const deleteQRCode = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'qrCodes', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting QR code:', error);
    throw error;
  }
};

export const incrementScanCount = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'qrCodes', id);
    await updateDoc(docRef, {
      scanCount: increment(1),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error incrementing scan count:', error);
    throw error;
  }
};

// Scan Tracking Operations
export const logQRCodeScan = async (scanData: Omit<QRCodeScan, 'id' | 'timestamp'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'qrCodeScans'), {
      ...scanData,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error logging QR code scan:', error);
    throw error;
  }
};

export const getScansByQRCodeId = async (qrCodeId: string): Promise<QRCodeScan[]> => {
  try {
    const q = query(
      collection(db, 'qrCodeScans'), 
      where('qrCodeId', '==', qrCodeId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as QRCodeScan[];
  } catch (error) {
    console.error('Error fetching scans:', error);
    throw error;
  }
};

export const getQRCodeByShortUrl = async (shortUrl: string): Promise<QRCodeData | null> => {
  try {
    const q = query(collection(db, 'qrCodes'), where('shortUrl', '==', shortUrl));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as QRCodeData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching QR code by short URL:', error);
    throw error;
  }
}; 