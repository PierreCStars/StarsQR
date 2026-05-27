import React from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeFormData } from '../../types';
import { Label, TextInput } from '../ui/Field';
import { Button } from '../ui/Button';

interface UrlFormProps {
  formData: QRCodeFormData;
  errors: Partial<QRCodeFormData>;
  isGenerating: boolean;
  isLoadingCampaigns: boolean;
  hubspotCampaigns: string[];
  pageTitle: string;
  qrCodeName: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onUrlBlur: () => void;
  onGenerate: () => void;
}

const SOURCE_OPTIONS = ['Showroom', 'Le_Pneu', 'Midi_Pneu', 'Agency', 'Event'];
const MEDIUM_OPTIONS = ['Displays', 'Stickers', 'Brochure', 'Meta', 'LinkedIn'];

export function UrlForm({
  formData,
  errors,
  isGenerating,
  isLoadingCampaigns,
  hubspotCampaigns,
  pageTitle,
  qrCodeName,
  onInputChange,
  onUrlBlur,
  onGenerate,
}: UrlFormProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Destination */}
      <div>
        <Label>{t('generator.destination')}</Label>
        <TextInput
          type="url"
          id="url"
          name="url"
          value={formData.url}
          onChange={onInputChange}
          onBlur={onUrlBlur}
          placeholder={t('generator.urlPlaceholder')}
          className={`input-field ${errors.url ? 'border-danger' : ''}`}
        />
        {errors.url && <p className="mt-1.5 text-sm text-danger">{errors.url}</p>}
        <p className="mt-1.5 text-sm text-slate-ardoise">{t('generator.utmHint')}</p>
        {pageTitle && (
          <div className="mt-3 rounded-lg border border-[color:var(--slg-line)] bg-cream px-4 py-3">
            <p className="eyebrow">{t('generator.nameDetected')}</p>
            <p className="mt-1 text-sm text-ink">{pageTitle}</p>
            <p className="mt-1 text-xs text-slate-ardoise">
              {t('generator.nameWillBe')} : <span className="font-mono text-ink">{qrCodeName}</span>
            </p>
          </div>
        )}
      </div>

      {/* HubSpot campaign */}
      <div>
        <Label>{t('generator.campaign')}</Label>
        <select
          id="utm_campaign"
          name="utm_campaign"
          value={formData.utm_campaign}
          onChange={onInputChange}
          disabled={isLoadingCampaigns}
          className={`input-field ${isLoadingCampaigns ? 'opacity-50' : ''}`}
        >
          {isLoadingCampaigns ? (
            <option value="">{t('generator.loadingCampaigns')}</option>
          ) : hubspotCampaigns.length > 0 ? (
            <>
              <option value="">{t('generator.selectCampaign')}</option>
              {hubspotCampaigns.map((campaign) => (
                <option key={campaign} value={campaign}>
                  {campaign}
                </option>
              ))}
            </>
          ) : (
            <option value="">{t('generator.noCampaigns')}</option>
          )}
        </select>
      </div>

      {/* Source / Medium */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>{t('generator.source')}</Label>
          <select
            id="utm_source"
            name="utm_source"
            value={formData.utm_source}
            onChange={onInputChange}
            className="input-field"
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>{t('generator.medium')}</Label>
          <select
            id="utm_medium"
            name="utm_medium"
            value={formData.utm_medium}
            onChange={onInputChange}
            className="input-field"
          >
            {MEDIUM_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Term / Content */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>{t('generator.term')}</Label>
          <TextInput
            type="text"
            id="utm_term"
            name="utm_term"
            value={formData.utm_term ?? ''}
            onChange={onInputChange}
            placeholder={t('generator.termPlaceholder')}
          />
        </div>
        <div>
          <Label>{t('generator.content')}</Label>
          <TextInput
            type="text"
            id="utm_content"
            name="utm_content"
            value={formData.utm_content ?? ''}
            onChange={onInputChange}
            placeholder={t('generator.contentPlaceholder')}
          />
        </div>
      </div>

      <Button onClick={onGenerate} disabled={isGenerating} className="w-full">
        {isGenerating ? t('generator.generating') : t('generator.generate')}
      </Button>
    </div>
  );
}
