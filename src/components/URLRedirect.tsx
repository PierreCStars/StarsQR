import { useEffect, useState } from 'react';
import { getOriginalUrl } from '../utils/urlShortener';
import { Loader2, ExternalLink } from 'lucide-react';
import { getQRCodeByShortUrl, incrementScanCount, logQRCodeScan } from '../services/firebaseService';

interface URLRedirectProps {
  shortCode: string;
}

export default function URLRedirect({ shortCode }: URLRedirectProps) {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // First try to get the URL from Firebase
        const shortUrl = `${window.location.origin}/r/${shortCode}`;
        const qrCode = await getQRCodeByShortUrl(shortUrl);
        
        if (qrCode) {
          // Increment scan count and log the scan
          await incrementScanCount(qrCode.id!);
          await logQRCodeScan({
            qrCodeId: qrCode.id!,
            userAgent: navigator.userAgent,
            referrer: document.referrer
          });
          
          setOriginalUrl(qrCode.fullUrl);
          // Redirect after a short delay to show the redirect page
          setTimeout(() => {
            window.location.href = qrCode.fullUrl;
          }, 2000);
        } else {
          // Fallback to localStorage for backward compatibility
          const url = getOriginalUrl(shortCode);
          if (url) {
            setOriginalUrl(url);
            setTimeout(() => {
              window.location.href = url;
            }, 2000);
          } else {
            setError('URL not found');
          }
        }
      } catch (error) {
        console.error('Error handling redirect:', error);
        setError('Error processing redirect');
      } finally {
        setIsLoading(false);
      }
    };

    handleRedirect();
  }, [shortCode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading redirect...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">URL Not Found</h1>
            <p className="text-gray-600 mb-6">
              The shortened URL you're looking for doesn't exist or has expired.
            </p>
            <button
              onClick={() => window.history.back()}
              className="btn-primary"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <ExternalLink className="w-12 h-12 mx-auto mb-4 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Redirecting...</h1>
          <p className="text-gray-600 mb-4">
            You're being redirected to:
          </p>
          <p className="text-sm text-primary-600 break-all mb-6">
            {originalUrl}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
            <span className="text-sm text-gray-500">Redirecting in 2 seconds...</span>
          </div>
          <div className="mt-4">
            <a
              href={originalUrl || '#'}
              className="text-primary-600 hover:text-primary-700 text-sm underline"
            >
              Click here if you're not redirected automatically
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 