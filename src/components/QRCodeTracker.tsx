import { useState, useEffect } from 'react';
import { BarChart3, Eye, Calendar, ExternalLink, Trash2, Copy, Download } from 'lucide-react';
import { StarIcon } from './StarIcon';
import * as QRCode from 'qrcode';
import { QRCodeData } from '../types';
import { formatDate } from '../utils/utm';

interface QRCodeTrackerProps {
  qrCodes: QRCodeData[];
  onDeleteQRCode: (id: string) => void;
  onIncrementScan: (id: string) => void;
}

export default function QRCodeTracker({ qrCodes, onDeleteQRCode, onIncrementScan }: QRCodeTrackerProps) {

  const [qrCodeImages, setQrCodeImages] = useState<Record<string, { png: string; svg: string }>>({});

  const totalScans = qrCodes.reduce((sum, qr) => sum + qr.scanCount, 0);
  const totalCodes = qrCodes.length;

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  // Generate QR code images for display and download
  const generateQRCodeImages = async (qrCode: QRCodeData) => {
    if (qrCodeImages[qrCode.id]) {
      return; // Already generated
    }

    try {
      // Generate PNG
      const pngDataUrl = await QRCode.toDataURL(qrCode.fullUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Generate SVG
      const svgString = await QRCode.toString(qrCode.fullUrl, {
        type: 'svg',
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeImages(prev => ({
        ...prev,
        [qrCode.id]: { png: pngDataUrl, svg: svgString }
      }));
    } catch (error) {
      console.error('Error generating QR code images:', error);
    }
  };

  // Download QR code as PNG
  const downloadQRCodePNG = (qrCode: QRCodeData) => {
    const images = qrCodeImages[qrCode.id];
    if (!images) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-${qrCode.id}-${Date.now()}.png`;
    link.href = images.png;
    link.click();
  };

  // Download QR code as SVG
  const downloadQRCodeSVG = (qrCode: QRCodeData) => {
    const images = qrCodeImages[qrCode.id];
    if (!images) return;
    
    const blob = new Blob([images.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qr-code-${qrCode.id}-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate QR codes for all QR codes when component mounts or qrCodes change
  useEffect(() => {
    qrCodes.forEach(qrCode => {
      generateQRCodeImages(qrCode);
    });
  }, [qrCodes]);

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-900">Analytics Overview</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <StarIcon className="w-5 h-5" />
              <span className="text-sm font-medium text-primary-700">Total QR Codes</span>
            </div>
            <p className="text-2xl font-bold text-primary-900 mt-1">{totalCodes}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Total Scans</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">{totalScans}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Avg Scans/Code</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {totalCodes > 0 ? Math.round(totalScans / totalCodes) : 0}
            </p>
          </div>
        </div>
      </div>

      {/* QR Codes List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Generated QR Codes</h2>
          <span className="text-sm text-gray-500">{qrCodes.length} codes</span>
        </div>

        {qrCodes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <StarIcon className="w-16 h-16 mx-auto mb-4" />
            <p>No QR codes generated yet</p>
            <p className="text-sm">Generate your first QR code to see it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {qrCodes.map((qrCode) => (
              <div
                key={qrCode.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* QR Code Thumbnail */}
                  <div className="flex-shrink-0">
                    {qrCodeImages[qrCode.id] ? (
                      <div className="bg-white p-2 rounded border">
                        <img 
                          src={qrCodeImages[qrCode.id].png} 
                          alt="QR Code" 
                          className="w-20 h-20"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* QR Code Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {qrCode.originalUrl}
                      </h3>
                      <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                        {qrCode.scanCount} scans
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 truncate">
                      Campaign: {qrCode.utmCampaign}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                      <span>Source: {qrCode.utmSource}</span>
                      <span>Medium: {qrCode.utmMedium}</span>
                      {qrCode.utmTerm && (
                        <span>Term: {qrCode.utmTerm}</span>
                      )}
                      {qrCode.utmContent && (
                        <span>Content: {qrCode.utmContent}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Created: {formatDate(qrCode.createdAt)}</span>
                      {qrCode.lastScanned && (
                        <span>Last scan: {formatDate(qrCode.lastScanned)}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 ml-4">
                    {/* Download Buttons */}
                    {qrCodeImages[qrCode.id] && (
                      <div className="flex flex-col gap-1 mr-2">
                        <button
                          onClick={() => downloadQRCodePNG(qrCode)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Download PNG"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => downloadQRCodeSVG(qrCode)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Download SVG"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={() => copyUrl(qrCode.fullUrl)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => openUrl(qrCode.fullUrl)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Open URL"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onIncrementScan(qrCode.id)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Simulate scan"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onDeleteQRCode(qrCode.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete QR code"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 