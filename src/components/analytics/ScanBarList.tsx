import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Download, ExternalLink, Eye, Trash2 } from 'lucide-react';
import * as QRCode from 'qrcode';
import { QRCodeData } from '../../types';
import { formatDate } from '../../utils/utm';
import { Button } from '../ui/Button';

interface ScanBarListProps {
  qrCodes: QRCodeData[];
  onDeleteQRCode: (id: string) => void;
  onIncrementScan: (id: string) => void;
}

export function ScanBarList({ qrCodes, onDeleteQRCode, onIncrementScan }: ScanBarListProps) {
  const { t } = useTranslation();
  const [qrCodeImages, setQrCodeImages] = useState<Record<string, { png: string; svg: string }>>({});

  const maxScans = qrCodes.reduce((max, qr) => Math.max(max, qr.scanCount), 0);

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  // Generate QR code images for download
  const generateQRCodeImages = async (qrCode: QRCodeData) => {
    if (qrCodeImages[qrCode.id]) {
      return; // Already generated
    }

    try {
      const pngDataUrl = await QRCode.toDataURL(qrCode.fullUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      });

      const svgString = await QRCode.toString(qrCode.fullUrl, {
        type: 'svg',
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      });

      setQrCodeImages((prev) => ({
        ...prev,
        [qrCode.id]: { png: pngDataUrl, svg: svgString },
      }));
    } catch (error) {
      console.error('Error generating QR code images:', error);
    }
  };

  const downloadQRCodePNG = (qrCode: QRCodeData) => {
    const images = qrCodeImages[qrCode.id];
    if (!images) return;

    const link = document.createElement('a');
    link.download = `qr-code-${qrCode.id}-${Date.now()}.png`;
    link.href = images.png;
    link.click();
  };

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

  useEffect(() => {
    qrCodes.forEach((qrCode) => {
      generateQRCodeImages(qrCode);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCodes]);

  return (
    <div className="space-y-4">
      {qrCodes.map((qrCode) => {
        const pct = maxScans > 0 ? Math.round((qrCode.scanCount / maxScans) * 100) : 0;
        const images = qrCodeImages[qrCode.id];

        return (
          <div
            key={qrCode.id}
            className="rounded-xl border border-[color:var(--slg-line)] bg-white p-5 transition hover:shadow-card"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-medium text-ink">{qrCode.originalUrl}</h3>
                <p className="mt-0.5 truncate text-xs text-slate-ardoise">{qrCode.shortUrl}</p>
              </div>
              <span className="shrink-0 text-sm font-medium text-ink">
                {qrCode.scanCount} {t('analytics.scans')}
              </span>
            </div>

            <div className="mt-3 h-2 w-full rounded-full bg-cream-100">
              <div className="h-2 rounded-full bg-gold" style={{ width: `${pct}%` }} />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-ardoise">
                <span>
                  {t('analytics.created')} : {formatDate(qrCode.createdAt)}
                </span>
                {qrCode.lastScanned && (
                  <span>
                    {t('analytics.lastScan')} : {formatDate(qrCode.lastScanned)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  onClick={() => copyUrl(qrCode.fullUrl)}
                  title={t('analytics.copy')}
                  aria-label={t('analytics.copy')}
                  className="px-2 py-1.5"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => openUrl(qrCode.fullUrl)}
                  title={t('analytics.openUrl')}
                  aria-label={t('analytics.openUrl')}
                  className="px-2 py-1.5"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => downloadQRCodePNG(qrCode)}
                  disabled={!images}
                  title={t('analytics.downloadPng')}
                  aria-label={t('analytics.downloadPng')}
                  className="px-2 py-1.5"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {t('generator.downloadPng')}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => downloadQRCodeSVG(qrCode)}
                  disabled={!images}
                  title={t('analytics.downloadSvg')}
                  aria-label={t('analytics.downloadSvg')}
                  className="px-2 py-1.5"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {t('generator.downloadSvg')}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => onIncrementScan(qrCode.id)}
                  title={t('analytics.simulateScan')}
                  aria-label={t('analytics.simulateScan')}
                  className="px-2 py-1.5"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => onDeleteQRCode(qrCode.id)}
                  title={t('analytics.delete')}
                  aria-label={t('analytics.delete')}
                  className="px-2 py-1.5 text-danger hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
