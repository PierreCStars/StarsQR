import React, { useState } from 'react';
import * as QRCode from 'qrcode';
import { Download, Copy, Scissors } from 'lucide-react';
import { StarIcon } from './StarIcon';
import { QRCodeFormData, QRCodeData } from '../types';
import { buildUrlWithUTM } from '../utils/utm';
import { createShortUrl, saveShortUrl, validateUrl } from '../utils/urlShortener';
import { createQRCode } from '../services/firebaseService';

interface QRCodeGeneratorProps {
  onQRCodeGenerated: (qrData: QRCodeData) => void;
}

export default function QRCodeGenerator({ onQRCodeGenerated }: QRCodeGeneratorProps) {
  const [formData, setFormData] = useState<QRCodeFormData>({
    url: '',
    utm_source: 'Showroom',
    utm_medium: 'Displays',
    utm_campaign: 'Car Sales',
    utm_term: '',
    utm_content: ''
  });
  
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
  const [finalUrl, setFinalUrl] = useState<string>('');
  const [shortenedUrl, setShortenedUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isShortening, setIsShortening] = useState(false);
  const [errors, setErrors] = useState<Partial<QRCodeFormData>>({});





  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof QRCodeFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleUrlBlur = async () => {
    // Auto-shorten URL when user finishes typing (on blur)
    if (formData.url.trim() && isValidUrl(formData.url) && !shortenedUrl) {
      await shortenUrl();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<QRCodeFormData> = {};

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    if (!formData.utm_source.trim()) {
      newErrors.utm_source = 'UTM Source is required';
    }

    if (!formData.utm_medium.trim()) {
      newErrors.utm_medium = 'UTM Medium is required';
    }

    if (!formData.utm_campaign.trim()) {
      newErrors.utm_campaign = 'UTM Campaign is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    return validateUrl(url);
  };

  const shortenUrl = async () => {
    if (!formData.url.trim()) {
      return;
    }

    if (!isValidUrl(formData.url)) {
      return;
    }

    // Don't shorten if already shortened
    if (shortenedUrl) {
      return;
    }

    setIsShortening(true);
    
    try {
      const shortUrl = createShortUrl(formData.url);
      const shortCode = shortUrl.split('/').pop() || '';
      
      // Save the shortened URL mapping
      saveShortUrl(shortCode, formData.url);
      
      setShortenedUrl(shortUrl);
      setFormData(prev => ({ ...prev, url: shortUrl }));
      
      // Clear any URL errors
      setErrors(prev => ({ ...prev, url: undefined }));
    } catch (error) {
      console.error('Error shortening URL:', error);
    } finally {
      setIsShortening(false);
    }
  };

  const generateQRCode = async () => {
    console.log('Starting QR code generation...');
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setIsGenerating(true);
    
    // Auto-shorten URL if not already shortened and all required fields are filled
    if (!shortenedUrl && formData.url && formData.utm_source && formData.utm_medium && formData.utm_campaign) {
      console.log('Auto-shortening URL...');
      await shortenUrl();
    }
    
    try {
      console.log('Form data:', formData);
      const utmParams = {
        utm_source: formData.utm_source,
        utm_medium: formData.utm_medium,
        utm_campaign: formData.utm_campaign,
        utm_term: formData.utm_term,
        utm_content: formData.utm_content
      };

      const urlWithUTM = buildUrlWithUTM(formData.url, utmParams);
      setFinalUrl(urlWithUTM);

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(urlWithUTM, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(qrDataUrl);

      // Generate SVG version
      try {
        const qrSvg = await QRCode.toString(urlWithUTM, {
          type: 'svg',
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeSvg(qrSvg);
      } catch (svgError) {
        console.error('SVG generation failed:', svgError);
      }

      // Create QR code data for Firebase
      const qrData: any = {
        originalUrl: formData.url,
        shortUrl: shortenedUrl || formData.url,
        utmSource: formData.utm_source,
        utmMedium: formData.utm_medium,
        utmCampaign: formData.utm_campaign,
        fullUrl: urlWithUTM,
        scanCount: 0
      };

      // Only add optional fields if they have values
      if (formData.utm_term && formData.utm_term.trim()) {
        qrData.utmTerm = formData.utm_term;
      }
      if (formData.utm_content && formData.utm_content.trim()) {
        qrData.utmContent = formData.utm_content;
      }

      console.log('QR code generated, saving to Firebase...');
      console.log('QR data to save:', JSON.stringify(qrData, null, 2));
      
      // Save to Firebase
      const firebaseId = await createQRCode(qrData);
      console.log('Firebase ID:', firebaseId);
      
      // Create QR code data for local state
      const qrDataForState: QRCodeData = {
        id: firebaseId,
        originalUrl: formData.url,
        shortUrl: shortenedUrl || formData.url,
        utmSource: formData.utm_source,
        utmMedium: formData.utm_medium,
        utmCampaign: formData.utm_campaign,
        utmTerm: formData.utm_term,
        utmContent: formData.utm_content,
        fullUrl: urlWithUTM,
        scanCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Calling onQRCodeGenerated with:', qrDataForState);
      onQRCodeGenerated(qrDataForState);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCodePNG = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const downloadQRCodeSVG = () => {
    if (!qrCodeSvg) return;
    
    const blob = new Blob([qrCodeSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
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



  return (
    <div className="card max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-6">
          <StarIcon className="w-6 h-6" />
          <h1 className="text-2xl font-bold text-gray-900">Stars QR Code Generator</h1>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Target URL *
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                onBlur={handleUrlBlur}
                placeholder="https://example.com"
                className={`input-field flex-1 ${errors.url ? 'border-red-500' : ''}`}
              />
              <div className="flex items-center gap-2 px-4 text-sm text-gray-500">
                {isShortening ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Shortening...</span>
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4" />
                    <span>Auto-shorten</span>
                  </>
                )}
              </div>
            </div>
            {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
            {shortenedUrl && (
              <p className="text-green-600 text-sm mt-1">
                ✓ URL automatically shortened! The shortened URL will be used for the QR code.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
              <label htmlFor="utm_source" className="block text-sm font-medium text-gray-700 mb-2">
                UTM Source *
              </label>
              <select
                id="utm_source"
                name="utm_source"
                value={formData.utm_source}
                onChange={handleInputChange}
                className={`input-field ${errors.utm_source ? 'border-red-500' : ''}`}
              >
                <option value="Showroom">Showroom</option>
                <option value="Le_Pneu">Le_Pneu</option>
                <option value="Midi_Pneu">Midi_Pneu</option>
                <option value="Agency">Agency</option>
                <option value="Event">Event</option>
              </select>
              {errors.utm_source && <p className="text-red-500 text-sm mt-1">{errors.utm_source}</p>}
            </div>

            <div>
              <label htmlFor="utm_medium" className="block text-sm font-medium text-gray-700 mb-2">
                UTM Medium *
              </label>
              <select
                id="utm_medium"
                name="utm_medium"
                value={formData.utm_medium}
                onChange={handleInputChange}
                className={`input-field ${errors.utm_medium ? 'border-red-500' : ''}`}
              >
                <option value="Displays">Displays</option>
                <option value="Stickers">Stickers</option>
                <option value="Brochure">Brochure</option>
              </select>
              {errors.utm_medium && <p className="text-red-500 text-sm mt-1">{errors.utm_medium}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="utm_campaign" className="block text-sm font-medium text-gray-700 mb-2">
              UTM Campaign *
            </label>
            <select
              id="utm_campaign"
              name="utm_campaign"
              value={formData.utm_campaign}
              onChange={handleInputChange}
              className={`input-field ${errors.utm_campaign ? 'border-red-500' : ''}`}
            >
              <option value="Car Sales">Car Sales</option>
              <option value="Yachting Charter">Yachting Charter</option>
              <option value="Yachting Sales">Yachting Sales</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Events">Events</option>
            </select>
            {errors.utm_campaign && <p className="text-red-500 text-sm mt-1">{errors.utm_campaign}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="utm_term" className="block text-sm font-medium text-gray-700 mb-2">
                UTM Term (Optional)
              </label>
              <input
                type="text"
                id="utm_term"
                name="utm_term"
                value={formData.utm_term}
                onChange={handleInputChange}
                placeholder="running+shoes"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="utm_content" className="block text-sm font-medium text-gray-700 mb-2">
                UTM Content (Optional)
              </label>
              <input
                type="text"
                id="utm_content"
                name="utm_content"
                value={formData.utm_content}
                onChange={handleInputChange}
                placeholder="textlink, banner"
                className="input-field"
              />
            </div>
          </div>

          <button
            onClick={generateQRCode}
            disabled={isGenerating}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <StarIcon className="w-4 h-4" />
                Generate QR Code
              </>
            )}
          </button>
        </div>

        {/* QR Code Display Section */}
        <div className="space-y-6">
          
          
          {qrCodeUrl && (
            <>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated QR Code</h3>
                <div className="bg-white p-4 rounded-lg border inline-block">
                  <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Final URL with UTM Parameters
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={finalUrl}
                      readOnly
                      className="input-field text-sm"
                    />
                    <button
                      onClick={copyUrl}
                      className="btn-secondary flex items-center gap-1 px-3"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={downloadQRCodePNG}
                      className="btn-primary flex items-center gap-2 flex-1"
                    >
                      <Download className="w-4 h-4" />
                      Download PNG
                    </button>
                    <button
                      onClick={downloadQRCodeSVG}
                      className="btn-secondary flex items-center gap-2 flex-1"
                    >
                      <Download className="w-4 h-4" />
                      Download SVG
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    PNG: Best for printing • SVG: Scalable vector format
                  </div>
                </div>
              </div>
            </>
          )}

          {!qrCodeUrl && (
            <div className="text-center text-gray-500 py-12">
              <StarIcon className="w-16 h-16 mx-auto mb-4" />
              <p>Fill in the form and generate your QR code</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 