import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Trash2 } from 'lucide-react';
import { QRCodeData } from '../../types';
import { formatDate } from '../../utils/utm';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StarIcon } from '../StarIcon';
import { ScanBarList } from './ScanBarList';

interface AnalyticsPageProps {
  qrCodes: QRCodeData[];
  onDeleteQRCode: (id: string) => void;
  onIncrementScan: (id: string) => void;
  onClearAllQRCodes: () => void;
}

// Machine-readable CSV headers (not shown in the UI, kept stable for downstream tooling)
const CSV_HEADERS = 'name,url,scans,date';

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default function AnalyticsPage({
  qrCodes,
  onDeleteQRCode,
  onIncrementScan,
  onClearAllQRCodes,
}: AnalyticsPageProps) {
  const { t } = useTranslation();
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  const totalScans = qrCodes.reduce((sum, qr) => sum + qr.scanCount, 0);
  const totalCodes = qrCodes.length;

  // Count QR codes active in the last 7 days, using lastScanned when available,
  // otherwise createdAt.
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentCount = qrCodes.filter((qr) => {
    const reference = qr.lastScanned ?? qr.createdAt;
    return reference instanceof Date && reference.getTime() >= sevenDaysAgo;
  }).length;

  const exportCsv = () => {
    const rows = qrCodes.map((qr) => {
      const date = qr.lastScanned ?? qr.createdAt;
      return [
        escapeCsv(qr.originalUrl),
        escapeCsv(qr.fullUrl),
        String(qr.scanCount),
        escapeCsv(formatDate(date)),
      ].join(',');
    });
    const csv = [CSV_HEADERS, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qr-analytics-${Date.now()}.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span className="filet-gold mr-3" />
        <span className="eyebrow">{t('common.group')}</span>
        <h1 className="mt-3 text-3xl">{t('analytics.title')}</h1>
      </div>

      <div className="mb-8 grid gap-5 sm:grid-cols-3">
        <Card>
          <p className="eyebrow">{t('analytics.totalScans')}</p>
          <p className="mt-2 text-3xl font-light tracking-tight text-ink">{totalScans}</p>
        </Card>
        <Card>
          <p className="eyebrow">{t('analytics.totalCodes')}</p>
          <p className="mt-2 text-3xl font-light tracking-tight text-ink">{totalCodes}</p>
        </Card>
        <Card>
          <p className="eyebrow">{t('analytics.recent')}</p>
          <p className="mt-2 text-3xl font-light tracking-tight text-ink">{recentCount}</p>
        </Card>
      </div>

      {qrCodes.length === 0 ? (
        <Card>
          <div className="py-12 text-center text-slate-ardoise">
            <StarIcon className="mx-auto mb-4 h-16 w-16" />
            <p className="text-sm">{t('analytics.empty')}</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-end gap-3">
            <Button variant="secondary" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              {t('analytics.exportCsv')}
            </Button>
            <Button variant="danger" onClick={() => setShowClearConfirmation(true)}>
              <Trash2 className="h-4 w-4" />
              {t('analytics.clearAll')}
            </Button>
          </div>

          <ScanBarList
            qrCodes={qrCodes}
            onDeleteQRCode={onDeleteQRCode}
            onIncrementScan={onIncrementScan}
          />
        </>
      )}

      {showClearConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[color:var(--slg-line)] bg-white p-7 shadow-card-lg">
            <h2 className="mb-2 text-lg">{t('analytics.clearTitle')}</h2>
            <p className="mb-6 text-sm text-slate-ardoise">{t('analytics.clearConfirm')}</p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowClearConfirmation(false)}>
                {t('analytics.cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  onClearAllQRCodes();
                  setShowClearConfirmation(false);
                }}
              >
                {t('analytics.clearAll')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
