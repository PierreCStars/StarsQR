// Chrome Extension Popup Script
// QR Code Generator Popup

class QRCodeGeneratorPopup {
  constructor() {
    this.currentUrl = '';
    this.currentTitle = '';
    this.campaigns = [];
    this.init();
  }

  async init() {
    console.log('Initializing Chrome QR Code Generator popup');
    
    // Set up event listeners first
    this.setupEventListeners();
    console.log('Event listeners set up');
    
    // Get current tab info
    await this.getCurrentTab();
    console.log('Current tab info loaded');
    
    // Load campaigns
    await this.loadCampaigns();
    console.log('Campaigns loaded');
    
    // Load saved settings
    await this.loadSettings();
    console.log('Settings loaded');
    
    console.log('Popup initialization complete');
  }

  async getCurrentTab() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getCurrentTab' });
      if (response.url) {
        this.currentUrl = response.url;
        this.currentTitle = response.title || '';
        
        // Update URL input
        const urlInput = document.getElementById('url');
        if (urlInput) {
          urlInput.value = this.currentUrl;
        }
        
        // Auto-generate filename from title
        this.generateFilename();
      }
    } catch (error) {
      console.error('Error getting current tab:', error);
    }
  }

  async useCurrentPage() {
    console.log('useCurrentPage called');
    try {
      console.log('Sending getCurrentTab message to background');
      const response = await chrome.runtime.sendMessage({ action: 'getCurrentTab' });
      console.log('Background response:', response);
      
      if (response && response.url) {
        this.currentUrl = response.url;
        this.currentTitle = response.title || '';
        
        console.log('Setting URL to:', this.currentUrl);
        
        // Update URL input
        const urlInput = document.getElementById('url');
        if (urlInput) {
          urlInput.value = this.currentUrl;
          console.log('URL input updated');
        } else {
          console.error('URL input element not found');
        }
        
        // Auto-generate filename from title
        this.generateFilename();
        
        this.showMessage('Current page URL loaded!', 'success');
      } else {
        console.error('No URL in response:', response);
        this.showMessage('Could not get current page URL', 'error');
      }
    } catch (error) {
      console.error('Error getting current tab:', error);
      this.showMessage('Error getting current page URL: ' + error.message, 'error');
    }
  }

  async loadCampaigns() {
    try {
      // For Chrome extension, we'll use a simplified campaign list
      // In production, you could fetch from your API
      this.campaigns = [
        'Stars Social',
        'Stars HR',
        'Robb Report',
        'Stars Events',
        'Midi Pneu',
        'Yachting General',
        'Stars Yachting - Ice',
        'Dallara Test Drive - Prospects',
        'Stars Yachting charter - Ultimate Lady',
        'Stars Yachting sales - Azul V',
        'Real Estate - L\'Exotique',
        'Stars Yachting Sales - Pershing',
        'StarsMC-Offers',
        'Stars Yachting Anvera',
        'Stars Yachting Charter',
        'Dallara Stradale',
        'Stars Yachting - Yacht Shows 2023',
        'Stars Yachting - Belassi',
        'Stars Aviation',
        'Stars Remarketing Global',
        'Stars MC remarketing',
        'Group Newsletter',
        'Real Estate Newsletters',
        'Stars Yachting',
        'Le Pneu-Generique',
        'Top Marques',
        'Réparation de jantes',
        'Open Track 27 mars',
        'XPEL Test Pierre',
        'Rim Repair',
        'Xpel window tint',
        'LEADS INSTAGRAM',
        'Events',
        'Dark Ads',
        'flyers',
        'carte de visite',
        'Totem',
        'Véhicules Small',
        'Vehicules Prestiges',
        'Social Media',
        'trackdays',
        're-engage',
        'Porsche et Ferrari Fevrier 2021',
        'Concours Top Marques'
      ];
      
      this.populateCampaignDropdown();
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  }

  populateCampaignDropdown() {
    const campaignSelect = document.getElementById('campaign');
    if (!campaignSelect) return;
    
    campaignSelect.innerHTML = '<option value="">Select Campaign</option>';
    
    this.campaigns.forEach(campaign => {
      const option = document.createElement('option');
      option.value = campaign;
      option.textContent = campaign;
      campaignSelect.appendChild(option);
    });
  }

  setupEventListeners() {
    // URL input change
    const urlInput = document.getElementById('url');
    if (urlInput) {
      urlInput.addEventListener('input', () => {
        this.currentUrl = urlInput.value;
        this.generateFilename();
      });
    }

    // Use Current Page button
    const useCurrentPageBtn = document.getElementById('useCurrentPage');
    console.log('Looking for useCurrentPage button:', useCurrentPageBtn);
    if (useCurrentPageBtn) {
      useCurrentPageBtn.addEventListener('click', () => {
        console.log('Use Current Page button clicked');
        this.useCurrentPage();
      });
      console.log('Use Current Page event listener added');
    } else {
      console.error('useCurrentPage button not found!');
    }

    // Generate QR button
    const generateBtn = document.getElementById('generateQR');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generateQRCode());
    }

    // Format change
    const formatSelect = document.getElementById('format');
    if (formatSelect) {
      formatSelect.addEventListener('change', () => {
        this.generateFilename();
      });
    }

    // Auto-shorten toggle
    const autoShortenToggle = document.getElementById('autoShorten');
    if (autoShortenToggle) {
      autoShortenToggle.addEventListener('change', () => {
        this.saveSettings();
      });
    }

    // Analytics toggle
    const analyticsToggle = document.getElementById('trackAnalytics');
    if (analyticsToggle) {
      analyticsToggle.addEventListener('change', () => {
        this.saveSettings();
      });
    }
  }

  generateFilename() {
    if (!this.currentUrl) return;
    
    try {
      const url = new URL(this.currentUrl);
      const pathParts = url.pathname.split('/').filter(part => part.length > 0);
      
      let filename = '';
      
      if (url.hostname.includes('stars.mc')) {
        // Special handling for Stars.mc URLs
        const filteredParts = pathParts.filter(part => 
          !['voitures', 'occasion', 'monaco', 'autre'].includes(part.toLowerCase())
        );
        filename = filteredParts.join('-');
      } else {
        // Normal breadcrumb-based naming
        filename = pathParts.join('-');
      }
      
      // Clean up filename
      filename = filename
        .replace(/[^a-zA-Z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
      
      if (!filename) {
        filename = 'qr-code';
      }
      
      // Add format extension
      const format = document.getElementById('format')?.value || 'png';
      filename += `.${format}`;
      
      // Update filename input
      const filenameInput = document.getElementById('filename');
      if (filenameInput) {
        filenameInput.value = filename;
      }
    } catch (error) {
      console.error('Error generating filename:', error);
    }
  }

  async generateQRCode() {
    const urlInput = document.getElementById('url');
    const campaignSelect = document.getElementById('campaign');
    const sourceInput = document.getElementById('source');
    const mediumInput = document.getElementById('medium');
    const formatSelect = document.getElementById('format');
    const sizeInput = document.getElementById('size');
    const filenameInput = document.getElementById('filename');
    const autoShortenToggle = document.getElementById('autoShorten');
    const analyticsToggle = document.getElementById('trackAnalytics');
    
    if (!urlInput || !urlInput.value) {
      this.showMessage('Please enter a URL', 'error');
      return;
    }
    
    let finalUrl = urlInput.value;
    
    // Add UTM parameters
    const utmParams = {};
    if (campaignSelect && campaignSelect.value) {
      utmParams.utm_campaign = campaignSelect.value;
    }
    if (sourceInput && sourceInput.value) {
      utmParams.utm_source = sourceInput.value;
    }
    if (mediumInput && mediumInput.value) {
      utmParams.utm_medium = mediumInput.value;
    }
    
    if (Object.keys(utmParams).length > 0) {
      const url = new URL(finalUrl);
      Object.keys(utmParams).forEach(key => {
        url.searchParams.set(key, utmParams[key]);
      });
      finalUrl = url.toString();
    }
    
    // Auto-shorten if enabled
    if (autoShortenToggle && autoShortenToggle.checked) {
      try {
        finalUrl = await this.shortenUrl(finalUrl);
      } catch (error) {
        console.error('Error shortening URL:', error);
      }
    }
    
    // Generate QR code
    const format = formatSelect?.value || 'png';
    const size = parseInt(sizeInput?.value) || 256;
    
    try {
      const qrCodeDataUrl = await this.generateQRCodeDataUrl(finalUrl, format, size);
      
      // Create download link
      const link = document.createElement('a');
      link.href = qrCodeDataUrl;
      link.download = filenameInput?.value || `qr-code.${format}`;
      link.click();
      
      // Save to history
      await this.saveQRCode(finalUrl, filenameInput?.value || `qr-code.${format}`, format, utmParams);
      
      this.showMessage('QR Code generated and saved to database!', 'success');
    } catch (error) {
      console.error('Error generating QR code:', error);
      this.showMessage('Error generating QR code', 'error');
    }
  }

  async generateQRCodeDataUrl(url, format, size) {
    // Use QR Server API for simplicity
    const qrServerUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&format=${format}`;
    
    const response = await fetch(qrServerUrl);
    if (!response.ok) {
      throw new Error('Failed to generate QR code');
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  async shortenUrl(url) {
    // Use TinyURL API for URL shortening
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    if (response.ok) {
      return await response.text();
    }
    return url; // Return original URL if shortening fails
  }

  async saveQRCode(url, filename, format, utmParams) {
    console.log('🔍 saveQRCode called with:', { url, filename, format, utmParams });
    
    try {
      // Try direct Firebase save first using the existing config
      let firebaseSuccess = false;
      try {
        console.log('🔥 Attempting direct Firebase save...');
        
        // Use the existing Firebase config file
        const { saveQRCodeToFirebase } = await import('./firebase-config.js');
        console.log('✅ Firebase config imported successfully');

        // Prepare data for Firebase (matching main app structure)
        const qrData = {
          originalUrl: url,
          shortUrl: url, // Extension doesn't shorten URLs by default
          utmSource: utmParams?.utm_source || 'chrome_extension',
          utmMedium: utmParams?.utm_medium || 'qr_code',
          utmCampaign: utmParams?.utm_campaign || '',
          utmTerm: utmParams?.utm_term || '',
          utmContent: utmParams?.utm_content || '',
          fullUrl: url,
          scanCount: 0,
          filename: filename || 'qr-code.png',
          format: format || 'png'
        };

        console.log('📊 Prepared QR data for Firebase:', qrData);

        // Add to Firebase using convenience function
        const docId = await saveQRCodeToFirebase(qrData);
        
        console.log('✅ QR code saved successfully with ID:', docId);
        firebaseSuccess = true;
        this.showMessage('QR code saved to database!', 'success');
      } catch (firebaseError) {
        console.error('❌ Direct Firebase save failed:', firebaseError);
        console.error('❌ Error details:', {
          name: firebaseError.name,
          message: firebaseError.message,
          stack: firebaseError.stack
        });
        firebaseSuccess = false;
      }

      // Fallback to API endpoint if direct save failed
      if (!firebaseSuccess) {
        console.log('🔄 Trying API endpoint as fallback...');
        try {
          const response = await chrome.runtime.sendMessage({
            action: 'saveToFirebase',
            url,
            filename,
            format,
            utmParams
          });
          
          console.log('📡 API response:', response);
          
          if (response && response.success) {
            console.log('✅ QR code saved to Firebase via API with ID:', response.firebaseId);
            this.showMessage('QR code saved to database!', 'success');
          } else {
            console.error('❌ Failed to save to Firebase via API:', response?.error || 'No response');
            this.showMessage('Failed to save to database, saved locally instead', 'warning');
          }
        } catch (apiError) {
          console.error('❌ API endpoint call failed:', apiError);
          this.showMessage('Failed to save to database, saved locally instead', 'warning');
        }
      }
      
      // Also save to Chrome storage for local history
      console.log('💾 Saving to Chrome storage...');
      try {
        await chrome.runtime.sendMessage({
          action: 'saveQRCode',
          url,
          filename,
          format,
          utmParams
        });
        console.log('✅ QR code saved to Chrome storage');
      } catch (chromeError) {
        console.error('❌ Failed to save to Chrome storage:', chromeError);
      }
      
      console.log('🎉 QR code save process completed');
    } catch (error) {
      console.error('❌ Error in saveQRCode:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Still save to Chrome storage as fallback
      try {
        console.log('🔄 Attempting Chrome storage fallback...');
        await chrome.runtime.sendMessage({
          action: 'saveQRCode',
          url,
          filename,
          format,
          utmParams
        });
        this.showMessage('QR code saved locally due to connection error', 'warning');
      } catch (chromeError) {
        console.error('❌ Error saving to Chrome storage:', chromeError);
        this.showMessage('Error saving QR code', 'error');
      }
    }
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['settings']);
      const settings = result.settings || {};
      
      // Apply settings to UI
      const autoShortenToggle = document.getElementById('autoShorten');
      if (autoShortenToggle) {
        autoShortenToggle.checked = settings.autoShorten !== false;
      }
      
      const analyticsToggle = document.getElementById('trackAnalytics');
      if (analyticsToggle) {
        analyticsToggle.checked = settings.trackAnalytics !== false;
      }
      
      const formatSelect = document.getElementById('format');
      if (formatSelect && settings.defaultFormat) {
        formatSelect.value = settings.defaultFormat;
      }
      
      const sizeInput = document.getElementById('size');
      if (sizeInput && settings.defaultSize) {
        sizeInput.value = settings.defaultSize;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async saveSettings() {
    try {
      const autoShortenToggle = document.getElementById('autoShorten');
      const analyticsToggle = document.getElementById('trackAnalytics');
      const formatSelect = document.getElementById('format');
      const sizeInput = document.getElementById('size');
      
      const settings = {
        autoShorten: autoShortenToggle?.checked || false,
        trackAnalytics: analyticsToggle?.checked || false,
        defaultFormat: formatSelect?.value || 'png',
        defaultSize: parseInt(sizeInput?.value) || 256
      };
      
      await chrome.storage.local.set({ settings });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
      messageDiv.textContent = message;
      messageDiv.className = `message ${type}`;
      messageDiv.style.display = 'block';
      
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 3000);
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing popup...');
  new QRCodeGeneratorPopup();
});

// Also try immediate execution
console.log('Popup script loaded');
if (document.readyState === 'loading') {
  console.log('Document still loading...');
} else {
  console.log('Document already loaded, initializing immediately...');
  new QRCodeGeneratorPopup();
} 