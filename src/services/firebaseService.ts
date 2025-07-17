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
  // Add retry logic with exponential backoff
  let retries = 3;
  let delay = 1000; // Start with 1 second delay
  
  while (retries > 0) {
    try {
      console.log(`🔥 Firebase: Attempt ${4 - retries}/3 to create QR code...`);
      console.log('🔥 Firebase: Received data:', JSON.stringify(qrData, null, 2));
      
      // Filter out undefined values
      const cleanData = Object.fromEntries(
        Object.entries(qrData).filter(([key, value]) => {
          console.log(`🔥 Firebase: Checking field ${key}:`, value, typeof value);
          return value !== undefined;
        })
      );
      
      console.log('🔥 Firebase: Clean data for Firebase:', JSON.stringify(cleanData, null, 2));
      
      console.log('🔥 Firebase: Creating document in qrCodes collection...');
      const docRef = await addDoc(collection(db, 'qrCodes'), {
        ...cleanData,
        scanCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('🔥 Firebase: Document created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      retries--;
      console.error(`❌ Firebase: Retry ${3 - retries}/3 due to error:`, error);
      console.error('❌ Firebase: Error details:', {
        code: (error as any).code,
        message: (error as any).message,
        stack: (error as any).stack
      });
      
      if (retries === 0) {
        console.error('❌ Firebase: All retries exhausted, throwing error');
        throw error;
      }
      
      console.log(`🔥 Firebase: Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw new Error('Failed to create QR code after all retries');
};

export const getAllQRCodes = async (): Promise<QRCodeData[]> => {
  try {
    console.log('🔥 Firebase: Getting all QR codes...');
    
    // Add retry logic with exponential backoff
    let retries = 3;
    let delay = 1000; // Start with 1 second delay
    
    while (retries > 0) {
      try {
        console.log(`🔥 Firebase: Attempt ${4 - retries}/3 to fetch QR codes...`);
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
        retries--;
        console.log(`🔥 Firebase: Retry ${3 - retries}/3 due to error:`, error);
        console.log(`🔥 Firebase: Waiting ${delay}ms before retry...`);
        
        if (retries === 0) {
          console.error('❌ Firebase: All retries exhausted, returning empty array');
          return [];
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
    
    // This should never be reached, but TypeScript requires it
    return [];
  } catch (error) {
    console.error('❌ Error fetching QR codes:', error);
    // Return empty array instead of throwing
    return [];
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

export const clearAllQRCodes = async (): Promise<void> => {
  try {
    console.log('🔥 Firebase: Clearing all QR codes...');
    
    // Get all QR code documents
    const querySnapshot = await getDocs(collection(db, 'qrCodes'));
    console.log(`🔥 Firebase: Found ${querySnapshot.size} QR codes to delete`);
    
    // Delete each document
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log('🔥 Firebase: All QR codes deleted successfully');
  } catch (error) {
    console.error('Error clearing all QR codes:', error);
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