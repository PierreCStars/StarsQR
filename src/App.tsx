import { useState, useEffect } from 'react';
import QRCodeGenerator from './components/QRCodeGenerator';
import QRCodeTracker from './components/QRCodeTracker';
import URLRedirect from './components/URLRedirect';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { QRCodeData } from './types';
import { getAllQRCodes, deleteQRCode, incrementScanCount, clearAllQRCodes } from './services/firebaseService';

type TabType = 'generator' | 'tracker';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('generator');
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);

  // Check if we're on a redirect route
  const path = window.location.pathname;
  const redirectMatch = path.match(/^\/r\/([a-zA-Z0-9]+)$/);

  // Load QR codes from Firebase on component mount (skipped on redirect routes)
  useEffect(() => {
    if (redirectMatch) return;

    const loadQRCodes = async () => {
      try {
        console.log('🔄 Loading QR codes from Firebase...');

        // Add a small delay to ensure Firebase is fully initialized
        await new Promise(resolve => setTimeout(resolve, 1000));

        const qrCodesData = await getAllQRCodes();
        console.log('📊 Raw QR codes data from Firebase:', qrCodesData);

        // Convert Firestore timestamps to Date objects
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const qrCodesWithDates = qrCodesData.map((qr: any) => ({
          ...qr,
          createdAt: qr.createdAt?.toDate() || new Date(),
          updatedAt: qr.updatedAt?.toDate() || new Date(),
          lastScanned: qr.lastScanned?.toDate() || undefined
        }));

        console.log('📊 Processed QR codes data:', qrCodesWithDates);
        setQrCodes(qrCodesWithDates);
        console.log('✅ QR codes loaded successfully. Count:', qrCodesWithDates.length);
      } catch (error) {
        console.error('❌ Error loading QR codes from Firebase:', error);
        // Set empty array to avoid infinite loading state
        setQrCodes([]);
      }
    };

    loadQRCodes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (redirectMatch) {
    const shortCode = redirectMatch[1];
    return <URLRedirect shortCode={shortCode} />;
  }

  const handleQRCodeGenerated = (qrData: QRCodeData) => {
    console.log('App: Received QR code data:', qrData);
    setQrCodes(prev => {
      const newQrCodes = [qrData, ...prev];
      console.log('App: Updated QR codes array:', newQrCodes);
      return newQrCodes;
    });
    // Don't automatically switch tabs - let user see their generated QR code
  };

  const handleDeleteQRCode = async (id: string) => {
    try {
      await deleteQRCode(id);
      setQrCodes(prev => prev.filter(qr => qr.id !== id));
    } catch (error) {
      console.error('Error deleting QR code:', error);
    }
  };

  const handleIncrementScan = async (id: string) => {
    try {
      await incrementScanCount(id);
      setQrCodes(prev => prev.map(qr => 
        qr.id === id 
          ? { 
              ...qr, 
              scanCount: qr.scanCount + 1, 
              lastScanned: new Date() 
            }
          : qr
      ));
    } catch (error) {
      console.error('Error incrementing scan count:', error);
    }
  };

  const handleClearAllQRCodes = async () => {
    try {
      await clearAllQRCodes();
      setQrCodes([]);
    } catch (error) {
      console.error('Error clearing all QR codes:', error);
    }
  };

  return (
    <div className="min-h-screen bg-cream-paper">
      <Header
        active={activeTab}
        onChange={setActiveTab}
        labels={{ appName: 'QR Studio', generator: 'Générateur', tracker: 'Analytics' }}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'generator' ? (
          <QRCodeGenerator
            onQRCodeGenerated={handleQRCodeGenerated}
            onGoToAnalytics={() => setActiveTab('tracker')}
          />
        ) : (
          <QRCodeTracker
            qrCodes={qrCodes}
            onDeleteQRCode={handleDeleteQRCode}
            onIncrementScan={handleIncrementScan}
            onClearAllQRCodes={handleClearAllQRCodes}
          />
        )}
      </main>

      <Footer />
    </div>
  );
} 