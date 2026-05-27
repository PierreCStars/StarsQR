import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as QRCode from 'qrcode';
import { QRCodeFormData, QRCodeData } from '../../types';
import { buildUrlWithUTM } from '../../utils/utm';
import {
  createShortUrl,
  validateUrl,
  extractPageTitle,
  generateQRCodeName,
} from '../../utils/urlShortener';
import { createQRCode } from '../../services/firebaseService';
import { hubspotService } from '../../services/hubspotService';
import { StarIcon } from '../StarIcon';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { UrlForm } from './UrlForm';
import { QrPreview } from './QrPreview';

interface GeneratorPageProps {
  onQRCodeGenerated: (qrData: QRCodeData) => void;
  onGoToAnalytics?: () => void;
}

export default function GeneratorPage({ onQRCodeGenerated, onGoToAnalytics }: GeneratorPageProps) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<QRCodeFormData>({
    url: '',
    utm_source: 'Showroom',
    utm_medium: 'Displays',
    utm_campaign: '',
    utm_term: '',
    utm_content: '',
  });

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
  const [finalUrl, setFinalUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Partial<QRCodeFormData>>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [hubspotCampaigns, setHubspotCampaigns] = useState<string[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [pageTitle, setPageTitle] = useState<string>('');
  const [qrCodeName, setQrCodeName] = useState<string>('');
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [isFromExtension, setIsFromExtension] = useState<boolean>(false);

  const isValidUrl = (url: string): boolean => validateUrl(url);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof QRCodeFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleUrlBlur = async () => {
    // No auto-shortening on blur - we'll shorten when generating QR code
    // Just validate the URL format
    if (formData.url.trim() && !isValidUrl(formData.url)) {
      setErrors((prev) => ({ ...prev, url: t('generator.invalidUrl') }));
    } else if (formData.url.trim() && isValidUrl(formData.url)) {
      setErrors((prev) => ({ ...prev, url: undefined }));

      // Extract page title for better QR code naming
      try {
        const title = await extractPageTitle(formData.url);
        setPageTitle(title);

        // Generate QR code name
        const name = generateQRCodeName(formData.url, title);
        setQrCodeName(name);
      } catch (error) {
        console.error('❌ Error extracting page title:', error);
        // Fallback to URL-based naming
        const name = generateQRCodeName(formData.url);
        setQrCodeName(name);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<QRCodeFormData> = {};

    if (!formData.url.trim()) {
      newErrors.url = t('generator.urlRequired');
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = t('generator.invalidUrl');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loadHubSpotCampaigns = async () => {
    setIsLoadingCampaigns(true);
    try {
      const campaigns = await hubspotService.getCampaignNames();
      setHubspotCampaigns(campaigns);
    } catch (error) {
      console.error('❌ Error loading HubSpot campaigns:', error);
      // Set empty array if loading fails - no fallback campaigns
      setHubspotCampaigns([]);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  // Load HubSpot campaigns when component mounts
  useEffect(() => {
    loadHubSpotCampaigns();
  }, []);

  // Handle URL parameters from Chrome extension
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromExtension = urlParams.get('from_extension');

    if (fromExtension === 'true') {
      // Set extension flag
      setIsFromExtension(true);

      // Extract QR code data from URL parameters
      const url = urlParams.get('url');
      const utm_source = urlParams.get('utm_source');
      const utm_medium = urlParams.get('utm_medium');
      const utm_campaign = urlParams.get('utm_campaign');
      const utm_term = urlParams.get('utm_term');
      const utm_content = urlParams.get('utm_content');

      if (url) {
        // Pre-fill the form with extension data
        setFormData((prev) => ({
          ...prev,
          url,
          utm_source: utm_source || prev.utm_source,
          utm_medium: utm_medium || prev.utm_medium,
          utm_campaign: utm_campaign || prev.utm_campaign,
          utm_term: utm_term || prev.utm_term,
          utm_content: utm_content || prev.utm_content,
        }));

        // Clear the URL parameters to avoid re-processing
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  // Auto-generate QR code when form is pre-filled from extension
  useEffect(() => {
    if (isFromExtension && formData.url) {
      // Auto-generate QR code after a short delay to ensure form is updated
      const timer = setTimeout(() => {
        generateQRCode();
        // Reset the extension flag after auto-generation
        setIsFromExtension(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.url, isFromExtension]);

  const generateQRCode = async () => {
    if (!validateForm()) {
      return;
    }

    setIsGenerating(true);

    try {
      // Use default UTM parameters if not set
      const utmParams = {
        utm_source: formData.utm_source || 'Showroom',
        utm_medium: formData.utm_medium || 'Displays',
        utm_campaign: formData.utm_campaign || '',
        utm_term: formData.utm_term || '',
        utm_content: formData.utm_content || '',
      };

      // First, create the URL with UTM parameters
      const urlWithUTM = buildUrlWithUTM(formData.url, utmParams);

      // Create a short URL for tracking purposes; the QR code encodes the short URL.
      const { shortCode, shortUrl } = createShortUrl(urlWithUTM);

      // Use the short URL for the QR code to enable tracking
      const qrCodeTargetUrl = shortUrl;

      setFinalUrl(qrCodeTargetUrl);

      const qrDataUrl = await QRCode.toDataURL(qrCodeTargetUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      setQrCodeUrl(qrDataUrl);

      // Generate SVG version
      try {
        const qrSvg = await QRCode.toString(qrCodeTargetUrl, {
          type: 'svg',
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeSvg(qrSvg);
      } catch (svgError) {
        console.error('SVG generation failed:', svgError);
      }

      // Create QR code data for Firebase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const qrData: any = {
        originalUrl: formData.url,
        shortCode, // Persisted for the serverless redirect lookup
        shortUrl, // Use the short URL for tracking
        utmSource: formData.utm_source,
        utmMedium: formData.utm_medium,
        utmCampaign: formData.utm_campaign,
        fullUrl: urlWithUTM, // Keep the full URL with UTM for reference
        scanCount: 0,
      };

      // Only add optional fields if they have values
      if (formData.utm_term && formData.utm_term.trim()) {
        qrData.utmTerm = formData.utm_term;
      }
      if (formData.utm_content && formData.utm_content.trim()) {
        qrData.utmContent = formData.utm_content;
      }

      // Save to Firebase
      const firebaseId = await createQRCode(qrData);

      // Create QR code data for local state
      const qrDataForState: QRCodeData = {
        id: firebaseId,
        originalUrl: formData.url,
        shortCode,
        shortUrl, // Use the short URL for tracking
        utmSource: formData.utm_source,
        utmMedium: formData.utm_medium,
        utmCampaign: formData.utm_campaign,
        utmTerm: formData.utm_term,
        utmContent: formData.utm_content,
        fullUrl: urlWithUTM, // Keep the full URL with UTM for reference
        scanCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      onQRCodeGenerated(qrDataForState);

      // Show success message
      setShowSuccessMessage(true);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const showDownloadPopup = () => {
    setShowPopup(true);
  };

  const downloadQRCodePNG = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    const fileName = qrCodeName || `qr-code-${Date.now()}`;
    link.download = `${fileName}.png`;
    link.href = qrCodeUrl;
    link.click();

    // Show popup after download
    setTimeout(() => {
      showDownloadPopup();
    }, 500);
  };

  const downloadQRCodeSVG = () => {
    if (!qrCodeSvg) return;

    const blob = new Blob([qrCodeSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = qrCodeName || `qr-code-${Date.now()}`;
    link.download = `${fileName}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    // Show popup after download
    setTimeout(() => {
      showDownloadPopup();
    }, 500);
  };

  const copyUrl = async () => {
    if (!finalUrl) return;

    try {
      await navigator.clipboard.writeText(finalUrl);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleGenerateAnother = () => {
    // Clear the form
    setFormData({
      url: '',
      utm_source: 'Showroom',
      utm_medium: 'Displays',
      utm_campaign: '',
      utm_term: '',
      utm_content: '',
    });

    // Clear QR code data
    setQrCodeUrl('');
    setQrCodeSvg('');
    setFinalUrl('');
    setPageTitle('');
    setQrCodeName('');
    setErrors({});
    setShowSuccessMessage(false);

    // Hide popup
    setShowPopup(false);
  };

  const handleGoToAnalytics = () => {
    onGoToAnalytics?.();
    setShowPopup(false);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span className="filet-gold mr-3" />
        <span className="eyebrow">{t('common.group')}</span>
        <h1 className="mt-3 text-3xl">{t('generator.title')}</h1>
      </div>

      <div className="grid gap-7 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <UrlForm
            formData={formData}
            errors={errors}
            isGenerating={isGenerating}
            isLoadingCampaigns={isLoadingCampaigns}
            hubspotCampaigns={hubspotCampaigns}
            pageTitle={pageTitle}
            qrCodeName={qrCodeName}
            onInputChange={handleInputChange}
            onUrlBlur={handleUrlBlur}
            onGenerate={generateQRCode}
          />
        </Card>
        <Card>
          <QrPreview
            qrCodeUrl={qrCodeUrl}
            finalUrl={finalUrl}
            showSuccessMessage={showSuccessMessage}
            hasSvg={!!qrCodeSvg}
            onCopyUrl={copyUrl}
            onDownloadPng={downloadQRCodePNG}
            onDownloadSvg={downloadQRCodeSVG}
          />
        </Card>
      </div>

      {/* Download popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[color:var(--slg-line)] bg-white p-7 shadow-card-lg">
            <div className="text-center">
              <StarIcon className="mx-auto mb-4 h-10 w-10" />
              <h2 className="mb-2 text-lg">{t('generator.downloadedTitle')}</h2>
              <p className="mb-6 text-sm text-slate-ardoise">{t('generator.downloadedQuestion')}</p>

              <div className="flex gap-3">
                <Button onClick={handleGenerateAnother} className="flex-1">
                  {t('generator.generateAnother')}
                </Button>
                <Button variant="secondary" onClick={handleGoToAnalytics} className="flex-1">
                  {t('generator.goToAnalytics')}
                </Button>
              </div>

              <Button variant="ghost" onClick={closePopup} className="mt-4">
                {t('generator.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
