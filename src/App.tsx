import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GeneratorPage from './components/generator/GeneratorPage';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LanguageSwitcher } from './components/layout/LanguageSwitcher';
import { QRCodeData } from './types';
import { getAllQRCodes, deleteQRCode, incrementScanCount, clearAllQRCodes } from './services/firebaseService';

type TabType = 'generator' | 'tracker';

export default function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('generator');
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);

  // Load QR codes from Firebase on component mount.
  // The /r/:code redirect route is handled entirely server-side (api/r/[code].js).
  useEffect(() => {
    const loadQRCodes = async () => {
      try {
        const qrCodesData = await getAllQRCodes();

        // The API returns timestamps as epoch-millis numbers (or null).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const qrCodesWithDates = qrCodesData.map((qr: any) => ({
          ...qr,
          createdAt: qr.createdAt ? new Date(qr.createdAt) : new Date(),
          updatedAt: qr.updatedAt ? new Date(qr.updatedAt) : new Date(),
          lastScanned: qr.lastScanned ? new Date(qr.lastScanned) : undefined
        }));

        setQrCodes(qrCodesWithDates);
      } catch (error) {
        console.error('❌ Error loading QR codes from Firebase:', error);
        // Set empty array to avoid infinite loading state
        setQrCodes([]);
      }
    };

    loadQRCodes();
  }, []);

  const handleQRCodeGenerated = (qrData: QRCodeData) => {
    setQrCodes(prev => [qrData, ...prev]);
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
        labels={{ appName: t('common.appName'), generator: t('nav.generator'), tracker: t('nav.tracker') }}
        rightSlot={<LanguageSwitcher />}
      />

      {/* Main Content */}
      <main className="min-h-[60vh]">
        {activeTab === 'generator' ? (
          <GeneratorPage
            onQRCodeGenerated={handleQRCodeGenerated}
            onGoToAnalytics={() => setActiveTab('tracker')}
          />
        ) : (
          <AnalyticsPage
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