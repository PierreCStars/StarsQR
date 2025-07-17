import { useState, useEffect } from 'react';
import { QrCode, BarChart3 } from 'lucide-react';
import QRCodeGenerator from './components/QRCodeGenerator';
import QRCodeTracker from './components/QRCodeTracker';
import URLRedirect from './components/URLRedirect';
import { QRCodeData } from './types';
import { getAllQRCodes, deleteQRCode, incrementScanCount } from './services/firebaseService';

type TabType = 'generator' | 'tracker';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('generator');
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);

  // Check if we're on a redirect route
  const path = window.location.pathname;
  const redirectMatch = path.match(/^\/r\/([a-zA-Z0-9]+)$/);
  
  if (redirectMatch) {
    const shortCode = redirectMatch[1];
    return <URLRedirect shortCode={shortCode} />;
  }

  // Load QR codes from Firebase on component mount
  useEffect(() => {
    const loadQRCodes = async () => {
      try {
        console.log('🔄 Loading QR codes from Firebase...');
        
        // Add a small delay to ensure Firebase is fully initialized
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const qrCodesData = await getAllQRCodes();
        console.log('📊 Raw QR codes data from Firebase:', qrCodesData);
        
        // Convert Firestore timestamps to Date objects
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
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <QrCode className="w-8 h-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">Stars QR Code Generator</h1>
            </div>
            <p className="text-sm text-gray-500">with UTM Tracking</p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'generator'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <QrCode className="w-4 h-4" />
              Generate QR Code
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'tracker'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics & Tracking
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'generator' ? (
          <QRCodeGenerator onQRCodeGenerated={handleQRCodeGenerated} />
        ) : (
          <QRCodeTracker
            qrCodes={qrCodes}
            onDeleteQRCode={handleDeleteQRCode}
            onIncrementScan={handleIncrementScan}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Stars QR Code Generator with UTM Tracking • Built with React & TypeScript</p>
            <p className="mt-1">
              Track your QR code performance with detailed analytics and UTM parameters
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 