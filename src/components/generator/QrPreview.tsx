import { useTranslation } from 'react-i18next';
import { Copy, Download } from 'lucide-react';
import { StarIcon } from '../StarIcon';
import { Button } from '../ui/Button';
import { Label } from '../ui/Field';

interface QrPreviewProps {
  qrCodeUrl: string;
  finalUrl: string;
  showSuccessMessage: boolean;
  hasSvg: boolean;
  onCopyUrl: () => void;
  onDownloadPng: () => void;
  onDownloadSvg: () => void;
}

export function QrPreview({
  qrCodeUrl,
  finalUrl,
  showSuccessMessage,
  hasSvg,
  onCopyUrl,
  onDownloadPng,
  onDownloadSvg,
}: QrPreviewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <span className="filet-gold mr-3" />
        <span className="eyebrow">{t('generator.preview')}</span>
      </div>

      {qrCodeUrl ? (
        <>
          {showSuccessMessage && (
            <div className="rounded-lg border border-[color:var(--slg-line)] bg-cream px-4 py-3">
              <p className="text-sm text-success">{t('generator.successMessage')}</p>
            </div>
          )}

          <div className="text-center">
            <h2 className="mb-4 text-lg">{t('generator.generatedTitle')}</h2>
            <div className="inline-block rounded-xl border border-[color:var(--slg-line)] bg-white p-4">
              {/* dynamic data URL — inline src is required */}
              <img src={qrCodeUrl} alt={t('generator.generatedTitle')} className="h-64 w-64" />
            </div>
          </div>

          <div>
            <Label>{t('generator.finalUrl')}</Label>
            <div className="flex gap-2">
              <input type="text" value={finalUrl} readOnly className="input-field text-sm" />
              <Button variant="secondary" onClick={onCopyUrl} title={t('generator.copy')} className="px-3">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Button variant="primary" onClick={onDownloadPng} className="flex-1">
                <Download className="h-4 w-4" />
                {t('generator.downloadPng')}
              </Button>
              <Button variant="secondary" onClick={onDownloadSvg} disabled={!hasSvg} className="flex-1">
                <Download className="h-4 w-4" />
                {t('generator.downloadSvg')}
              </Button>
            </div>
            <p className="text-center text-xs text-slate-ardoise">{t('generator.downloadHint')}</p>
          </div>
        </>
      ) : (
        <div className="py-12 text-center text-slate-ardoise">
          <StarIcon className="mx-auto mb-4 h-16 w-16" />
          <p className="text-sm">{t('generator.previewHint')}</p>
        </div>
      )}
    </div>
  );
}
