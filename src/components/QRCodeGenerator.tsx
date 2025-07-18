import React, { useState } from 'react';
import * as QRCode from 'qrcode';
import { Download, Copy, Scissors } from 'lucide-react';
import { StarIcon } from './StarIcon';
import { QRCodeFormData, QRCodeData } from '../types';
import { buildUrlWithUTM } from '../utils/utm';
import { createShortUrl, saveShortUrl, validateUrl, extractPageTitle, generateQRCodeName } from '../utils/urlShortener';
import { createQRCode } from '../services/firebaseService';
import { hubspotService } from '../services/hubspotService';

interface QRCodeGeneratorProps {
  onQRCodeGenerated: (qrData: QRCodeData) => void;
  onGoToAnalytics?: () => void;
}

export default function QRCodeGenerator({ onQRCodeGenerated, onGoToAnalytics }: QRCodeGeneratorProps) {
  const [formData, setFormData] = useState<QRCodeFormData>({
    url: '',
    utm_source: 'Showroom',
    utm_medium: 'Displays',
    utm_campaign: '',
    utm_term: '',
    utm_content: ''
  });
  
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
  const [finalUrl, setFinalUrl] = useState<string>('');
  // Removed shortenedUrl state as it's not being used
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Partial<QRCodeFormData>>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [hubspotCampaigns, setHubspotCampaigns] = useState<string[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [pageTitle, setPageTitle] = useState<string>('');
  const [qrCodeName, setQrCodeName] = useState<string>('');
  const [showPopup, setShowPopup] = useState<boolean>(false);





  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof QRCodeFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleUrlBlur = async () => {
    // No auto-shortening on blur - we'll shorten when generating QR code
    // Just validate the URL format
    if (formData.url.trim() && !isValidUrl(formData.url)) {
      setErrors(prev => ({ ...prev, url: 'Please enter a valid URL' }));
    } else if (formData.url.trim() && isValidUrl(formData.url)) {
      setErrors(prev => ({ ...prev, url: undefined }));
      
      // Extract page title for better QR code naming
      try {
        console.log('🔗 Extracting page title...');
        const title = await extractPageTitle(formData.url);
        setPageTitle(title);
        
        // Generate QR code name
        const name = generateQRCodeName(formData.url, title);
        setQrCodeName(name);
        
        if (title) {
          console.log('✅ Page title extracted:', title);
          console.log('✅ QR code name generated:', name);
        } else {
          console.log('⚠️ No page title found, using URL-based naming');
        }
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
      newErrors.url = 'URL is required';
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    return validateUrl(url);
  };

  const loadHubSpotCampaigns = async () => {
    setIsLoadingCampaigns(true);
    try {
      const campaigns = await hubspotService.getCampaignNames();
      setHubspotCampaigns(campaigns);
      console.log('✅ HubSpot campaigns loaded:', campaigns);
    } catch (error) {
      console.error('❌ Error loading HubSpot campaigns:', error);
      // Set empty array if loading fails - no fallback campaigns
      setHubspotCampaigns([]);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  // Load HubSpot campaigns when component mounts
  React.useEffect(() => {
    loadHubSpotCampaigns();
  }, []);

  // Handle URL parameters from Chrome extension
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromExtension = urlParams.get('from_extension');
    
    if (fromExtension === 'true') {
      console.log('🔗 Extension data detected in URL parameters');
      
      // Extract QR code data from URL parameters
      const url = urlParams.get('url');
      const utm_source = urlParams.get('utm_source');
      const utm_medium = urlParams.get('utm_medium');
      const utm_campaign = urlParams.get('utm_campaign');
      const utm_term = urlParams.get('utm_term');
      const utm_content = urlParams.get('utm_content');
      
      if (url) {
        console.log('🔗 Pre-filling form with extension data:', {
          url,
          utm_source,
          utm_medium,
          utm_campaign,
          utm_term,
          utm_content
        });
        
        // Pre-fill the form with extension data
        setFormData(prev => ({
          ...prev,
          url: url,
          utm_source: utm_source || prev.utm_source,
          utm_medium: utm_medium || prev.utm_medium,
          utm_campaign: utm_campaign || prev.utm_campaign,
          utm_term: utm_term || prev.utm_term,
          utm_content: utm_content || prev.utm_content
        }));
        
        // Clear the URL parameters to avoid re-processing
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  // Auto-generate QR code when form is pre-filled from extension
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromExtension = urlParams.get('from_extension');
    
    if (fromExtension === 'true' && formData.url) {
      // Auto-generate QR code after a short delay to ensure form is updated
      const timer = setTimeout(() => {
        console.log('🔗 Auto-generating QR code from extension data');
        generateQRCode();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [formData.url]);




  const generateQRCode = async () => {
    console.log('Starting QR code generation...');
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Form data:', formData);
      
      // Use default UTM parameters if not set
      const utmParams = {
        utm_source: formData.utm_source || 'Showroom',
        utm_medium: formData.utm_medium || 'Displays',
        utm_campaign: formData.utm_campaign || '',
        utm_term: formData.utm_term || '',
        utm_content: formData.utm_content || ''
      };

      // First, create the URL with UTM parameters
      const urlWithUTM = buildUrlWithUTM(formData.url, utmParams);
      console.log('🔗 URL with UTM parameters:', urlWithUTM);
      
      // Create a short URL for tracking purposes, but use the original URL for the QR code
      console.log('🔗 Creating short URL for tracking...');
      const shortUrl = createShortUrl(urlWithUTM);
      console.log('🔗 Generated short URL for tracking:', shortUrl);
      
      const shortCode = shortUrl.split('/').pop() || '';
      console.log('🔗 Short code:', shortCode);
      
      // Save the shortened URL mapping for tracking
      saveShortUrl(shortCode, urlWithUTM);
      
      // Use the original URL with UTM parameters for the QR code (no redirect needed)
      const qrCodeUrl = urlWithUTM;
      console.log('🔗 Using original URL with UTM for QR code:', qrCodeUrl);
      
      setFinalUrl(qrCodeUrl);

      // Generate QR code using the shortened URL (if available) or the URL with UTM
      // const qrCodeUrl = finalShortUrl; // This line is no longer needed
      console.log('🔗 Generating QR code for URL:', qrCodeUrl);
      
      const qrDataUrl = await QRCode.toDataURL(qrCodeUrl, {
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
        const qrSvg = await QRCode.toString(qrCodeUrl, {
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
        shortUrl: urlWithUTM, // Use the original URL with UTM parameters
        utmSource: formData.utm_source,
        utmMedium: formData.utm_medium,
        utmCampaign: formData.utm_campaign,
        fullUrl: urlWithUTM, // Keep the full URL with UTM for reference
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
        shortUrl: urlWithUTM, // Use the original URL with UTM parameters
        utmSource: formData.utm_source,
        utmMedium: formData.utm_medium,
        utmCampaign: formData.utm_campaign,
        utmTerm: formData.utm_term,
        utmContent: formData.utm_content,
        fullUrl: urlWithUTM, // Keep the full URL with UTM for reference
        scanCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Calling onQRCodeGenerated with:', qrDataForState);
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

  const showDownloadPopup = () => {
    setShowPopup(true);
  };

  const handleGenerateAnother = () => {
    // Clear the form
    setFormData({
      url: '',
      utm_source: 'Showroom',
      utm_medium: 'Displays',
      utm_campaign: '',
      utm_term: '',
      utm_content: ''
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
    // Navigate to analytics page (you can implement this based on your routing)
    onGoToAnalytics?.();
    setShowPopup(false);
  };

  const closePopup = () => {
    setShowPopup(false);
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
                <Scissors className="w-4 h-4" />
                <span>Will add UTM tracking</span>
              </div>
            </div>
            {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
            <p className="text-blue-600 text-sm mt-1">
              ℹ️ URL will be enhanced with UTM parameters when you generate the QR code. Default UTM parameters will be used if not specified.
            </p>
            {pageTitle && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-green-800 text-sm font-medium">Page title detected:</p>
                    <p className="text-green-700 text-sm mt-1">{pageTitle}</p>
                    <p className="text-green-600 text-xs mt-1">QR code will be named: <span className="font-mono">{qrCodeName}</span></p>
                  </div>
                </div>
              </div>
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
                <option value="Meta">Meta</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
              {errors.utm_medium && <p className="text-red-500 text-sm mt-1">{errors.utm_medium}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="utm_campaign" className="block text-sm font-medium text-gray-700 mb-2">
              UTM Campaign * (from HubSpot)
            </label>
            <select
              id="utm_campaign"
              name="utm_campaign"
              value={formData.utm_campaign}
              onChange={handleInputChange}
              disabled={isLoadingCampaigns}
              className={`input-field ${errors.utm_campaign ? 'border-red-500' : ''} ${isLoadingCampaigns ? 'opacity-50' : ''}`}
            >
              {isLoadingCampaigns ? (
                <option value="">Loading campaigns...</option>
              ) : hubspotCampaigns.length > 0 ? (
                <>
                  <option value="">Select a campaign</option>
                  {hubspotCampaigns.map((campaign) => (
                    <option key={campaign} value={campaign}>
                      {campaign}
                    </option>
                  ))}
                </>
              ) : (
                <option value="">No campaigns found in HubSpot</option>
              )}
            </select>
            {errors.utm_campaign && <p className="text-red-500 text-sm mt-1">{errors.utm_campaign}</p>}
            {isLoadingCampaigns && (
              <p className="text-blue-600 text-sm mt-1">
                🔄 Loading campaigns from HubSpot...
              </p>
            )}
            {!isLoadingCampaigns && hubspotCampaigns.length === 0 && (
              <p className="text-orange-600 text-sm mt-1">
                ⚠️ No campaigns found in HubSpot. Please create campaigns in your HubSpot account or check your API permissions.
              </p>
            )}
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
              {showSuccessMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <p className="text-green-800 font-medium">
                      ✓ URL with UTM parameters generated! The QR code will link directly to your target URL with tracking parameters.
                    </p>
                  </div>
                </div>
              )}
              
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

      {/* Download Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                QR Code Downloaded!
              </h3>
              <p className="text-gray-600 mb-6">
                Do you want to generate another QR Code?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleGenerateAnother}
                  className="btn-primary flex-1"
                >
                  Yes, Generate Another
                </button>
                <button
                  onClick={handleGoToAnalytics}
                  className="btn-secondary flex-1"
                >
                  No, Go to Analytics
                </button>
              </div>
              
              <button
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700 text-sm mt-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 