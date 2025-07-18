// Popup functionality for Safari Extension
class QRCodePopup {
  constructor() {
    this.currentUrl = '';
    this.campaigns = [];
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.loadCampaigns();
    await this.getCurrentTab();
  }

  bindEvents() {
    // Use current page button
    document.getElementById('use-current-page').addEventListener('click', () => {
      this.useCurrentPage();
    });

    // Generate QR code button
    document.getElementById('generate-qr').addEventListener('click', () => {
      this.generateQRCode();
    });

    // Download buttons
    document.getElementById('download-png').addEventListener('click', () => {
      this.downloadQRCode('png');
    });

    document.getElementById('download-svg').addEventListener('click', () => {
      this.downloadQRCode('svg');
    });

    // Copy URL button
    document.getElementById('copy-url').addEventListener('click', () => {
      this.copyURL();
    });
  }

  async getCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentUrl = tab.url;
      document.getElementById('url-input').value = this.currentUrl;
    } catch (error) {
      console.error('Error getting current tab:', error);
    }
  }

  useCurrentPage() {
    if (this.currentUrl) {
      document.getElementById('url-input').value = this.currentUrl;
    }
  }

  async loadCampaigns() {
    try {
      // Load campaigns from your Vercel API
      const response = await fetch('https://qr-generator-8rxt1o5br-pierres-projects-bba7ee64.vercel.app/api/hubspot-campaigns');
      const data = await response.json();
      
      this.campaigns = data.campaigns || [];
      this.populateCampaignDropdown();
    } catch (error) {
      console.error('Error loading campaigns:', error);
      // Fallback to default campaigns
      this.campaigns = [
        'Stars Social',
        'Robb Report',
        'Stars Yachting',
        'Real Estate',
        'Stars Events'
      ];
      this.populateCampaignDropdown();
    }
  }

  populateCampaignDropdown() {
    const select = document.getElementById('utm-campaign');
    select.innerHTML = '<option value="">Select Campaign</option>';
    
    this.campaigns.forEach(campaign => {
      const option = document.createElement('option');
      option.value = campaign;
      option.textContent = campaign;
      select.appendChild(option);
    });
  }

  getUTMParams() {
    return {
      source: document.getElementById('utm-source').value,
      medium: document.getElementById('utm-medium').value,
      campaign: document.getElementById('utm-campaign').value,
      term: document.getElementById('utm-term').value,
      content: document.getElementById('utm-content').value
    };
  }

  buildURLWithUTM(baseUrl) {
    const utm = this.getUTMParams();
    const url = new URL(baseUrl);
    
    if (utm.source) url.searchParams.set('utm_source', utm.source);
    if (utm.medium) url.searchParams.set('utm_medium', utm.medium);
    if (utm.campaign) url.searchParams.set('utm_campaign', utm.campaign);
    if (utm.term) url.searchParams.set('utm_term', utm.term);
    if (utm.content) url.searchParams.set('utm_content', utm.content);
    
    return url.toString();
  }

  async generateQRCode() {
    const urlInput = document.getElementById('url-input').value.trim();
    
    if (!urlInput) {
      this.showError('Please enter a URL');
      return;
    }

    this.showLoading();

    try {
      // Build URL with UTM parameters
      const urlWithUTM = this.buildURLWithUTM(urlInput);
      
      // Shorten the URL using your API
      const shortUrl = await this.shortenURL(urlWithUTM);
      
      // Generate QR code
      const qrCodeData = await this.createQRCode(shortUrl);
      
      this.displayQRCode(qrCodeData, shortUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      this.showError('Failed to generate QR code. Please try again.');
    }
  }

  async shortenURL(longUrl) {
    try {
      const response = await fetch('https://qr-generator-8rxt1o5br-pierres-projects-bba7ee64.vercel.app/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: longUrl })
      });
      
      const data = await response.json();
      return data.shortUrl || longUrl;
    } catch (error) {
      console.error('Error shortening URL:', error);
      return longUrl; // Return original URL if shortening fails
    }
  }

  async createQRCode(url) {
    // Use a QR code generation service or library
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    
    return {
      png: qrCodeUrl,
      svg: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&format=svg`
    };
  }

  displayQRCode(qrCodeData, shortUrl) {
    this.hideLoading();
    
    const container = document.getElementById('qr-image-container');
    container.innerHTML = `<img src="${qrCodeData.png}" alt="QR Code" />`;
    
    document.getElementById('short-url').textContent = `Short URL: ${shortUrl}`;
    document.getElementById('qr-result').style.display = 'block';
    
    // Store QR code data for download
    this.currentQRCodeData = qrCodeData;
    this.currentShortUrl = shortUrl;
  }

  async downloadQRCode(format) {
    if (!this.currentQRCodeData) return;
    
    try {
      const url = format === 'svg' ? this.currentQRCodeData.svg : this.currentQRCodeData.png;
      const response = await fetch(url);
      const blob = await response.blob();
      
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `qr-code-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      this.showError('Failed to download QR code');
    }
  }

  async copyURL() {
    if (!this.currentShortUrl) return;
    
    try {
      await navigator.clipboard.writeText(this.currentShortUrl);
      // Show success feedback
      const button = document.getElementById('copy-url');
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    } catch (error) {
      console.error('Error copying URL:', error);
      this.showError('Failed to copy URL');
    }
  }

  showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('qr-result').style.display = 'none';
    document.getElementById('error').style.display = 'none';
  }

  hideLoading() {
    document.getElementById('loading').style.display = 'none';
  }

  showError(message) {
    this.hideLoading();
    document.getElementById('error-message').textContent = message;
    document.getElementById('error').style.display = 'block';
    document.getElementById('qr-result').style.display = 'none';
  }
}

// Initialize the popup when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new QRCodePopup();
}); 