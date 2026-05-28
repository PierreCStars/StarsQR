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
      // Get basic tab info from background script
      const response = await chrome.runtime.sendMessage({ action: 'getCurrentTab' });
      if (response.url) {
        this.currentUrl = response.url;
        this.currentTitle = response.title || '';
        
        // Try to get more detailed page info from content script
        try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab && tab.id) {
            const pageInfo = await chrome.tabs.sendMessage(tab.id, { action: 'getPageInfo' });
            if (pageInfo && pageInfo.title) {
              this.currentTitle = pageInfo.title;
              console.log('Got detailed page title from content script:', this.currentTitle);
            }
          }
        } catch (contentError) {
          console.log('Content script not available, using basic tab info:', contentError.message);
        }
        
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
        
        // Try to get more detailed page info from content script
        try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab && tab.id) {
            const pageInfo = await chrome.tabs.sendMessage(tab.id, { action: 'getPageInfo' });
            if (pageInfo && pageInfo.title) {
              this.currentTitle = pageInfo.title;
              console.log('Got detailed page title from content script:', this.currentTitle);
            }
          }
        } catch (contentError) {
          console.log('Content script not available, using basic tab info:', contentError.message);
        }
        
        console.log('Setting URL to:', this.currentUrl);
        console.log('Setting title to:', this.currentTitle);
        
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
        
        this.showMessage('Current page URL and title loaded!', 'success');
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
      
      // Use page title if available, otherwise fall back to URL path
      if (this.currentTitle && this.currentTitle.trim()) {
        // Clean the page title for filename use
        filename = this.currentTitle
          .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
          .toLowerCase()
          .substring(0, 50); // Limit length to 50 characters
        
        // If title is too short or empty after cleaning, fall back to URL path
        if (filename.length < 3) {
          filename = '';
        }
      }
      
      // Fall back to URL path-based naming if no title or title too short
      if (!filename) {
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
      }
      
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
        
        // Add visual indicator if title was used
        const titleStatus = document.getElementById('title-status');
        if (this.currentTitle && this.currentTitle.trim()) {
          filenameInput.placeholder = `Auto-generated from: "${this.currentTitle}"`;
          filenameInput.title = `Generated from page title: "${this.currentTitle}"`;
          
          // Show title status indicator
          if (titleStatus) {
            titleStatus.style.display = 'flex';
            const statusText = titleStatus.querySelector('.status-text');
            if (statusText) {
              statusText.textContent = `Page title loaded: "${this.currentTitle}"`;
            }
          }
        } else {
          filenameInput.placeholder = 'Auto-generated from URL path';
          filenameInput.title = 'Generated from URL path';
          
          // Hide title status indicator
          if (titleStatus) {
            titleStatus.style.display = 'none';
          }
        }
      }
      
      console.log('Generated filename from title:', this.currentTitle, '→', filename);
    } catch (error) {
      console.error('Error generating filename:', error);
    }
  }

  async generateQRCode() {
    const urlInput = document.getElementById('url');
    const campaignSelect = document.getElementById('campaign');
    const sourceInput = document.getElementById('utm-source');
    const mediumInput = document.getElementById('utm-medium');
    const termInput = document.getElementById('utm-term');
    const contentInput = document.getElementById('utm-content');
    const formatSelect = document.getElementById('format');
    const sizeInput = document.getElementById('size');
    const filenameInput = document.getElementById('filename');
    
    if (!urlInput || !urlInput.value) {
      this.showMessage('Please enter a URL', 'error');
      return;
    }
    
    // Validate URL
    if (!this.isValidUrl(urlInput.value)) {
      this.showMessage('Please enter a valid URL', 'error');
      return;
    }
    
    let originalUrl = urlInput.value;
    
    // Build UTM parameters (same as main app)
    const utmParams = {
      utm_source: sourceInput?.value || 'chrome_extension',
      utm_medium: mediumInput?.value || 'qr_code',
      utm_campaign: campaignSelect?.value || '',
      utm_term: termInput?.value || '',
      utm_content: contentInput?.value || ''
    };
    
    // Build URL with UTM parameters (same as main app)
    let urlWithUTM = originalUrl;
    if (utmParams.utm_campaign || utmParams.utm_source || utmParams.utm_medium || utmParams.utm_term || utmParams.utm_content) {
      const url = new URL(originalUrl);
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value && value.trim()) {
          url.searchParams.set(key, value.trim());
        }
      });
      urlWithUTM = url.toString();
    }
    
    console.log('🔗 Original URL:', originalUrl);
    console.log('🔗 URL with UTM parameters:', urlWithUTM);
    
    const format = formatSelect?.value || 'png';
    const size = 300; // Fixed size to match main app
    
    try {
      // Create a short URL for tracking (same as main app)
      console.log('🔗 Creating short URL for tracking...');
      const { shortCode, shortUrl } = this.createShortUrl(urlWithUTM);
      console.log('🔗 Generated short URL for tracking:', shortUrl, 'shortCode:', shortCode);

      // Generate QR code using the short URL for tracking
      const qrCodeDataUrl = await this.generateQRCodeDataUrl(shortUrl, format, size);

      // Create download link
      const link = document.createElement('a');
      link.href = qrCodeDataUrl;
      link.download = filenameInput?.value || `qr-code.${format}`;
      link.click();

      // Save to database with proper data structure (same as main app).
      // shortCode is required so the serverless redirect can resolve the QR.
      await this.saveQRCode(originalUrl, shortCode, shortUrl, filenameInput?.value || `qr-code.${format}`, format, utmParams, urlWithUTM);
      
      this.showMessage('QR Code generated and saved to database!', 'success');
    } catch (error) {
      console.error('Error generating QR code:', error);
      this.showMessage('Error generating QR code', 'error');
    }
  }

  async generateQRCodeDataUrl(url, format, size) {
    // Use the same QR code library as the main app for consistency
    try {
      // Check if QRCode library is available globally
      if (typeof QRCode !== 'undefined') {
        console.log('📱 Using QRCode library for consistent styling...');
        
        if (format === 'svg') {
          // Generate SVG with same settings as main app
          const qrSvg = await QRCode.toString(url, {
            type: 'svg',
            width: 300, // Fixed size to match main app
            margin: 2, // Same margin as main app
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          
          // Convert SVG to data URL
          const svgBlob = new Blob([qrSvg], { type: 'image/svg+xml' });
          return URL.createObjectURL(svgBlob);
        } else {
          // Generate PNG with same settings as main app
          const qrDataUrl = await QRCode.toDataURL(url, {
            width: 300, // Fixed size to match main app
            margin: 2, // Same margin as main app
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          
          return qrDataUrl;
        }
      } else {
        throw new Error('QRCode library not available');
      }
    } catch (error) {
      console.error('Error generating QR code with library:', error);
      
      // Fallback to QR Server API if library fails
      console.log('🔄 Falling back to QR Server API with margin...');
      const qrServerUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&format=${format}&margin=2`;
      
      const response = await fetch(qrServerUrl);
      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }
      
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
  }

  // URL validation (same as main app)
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Create short URL (same logic as main app)
  // Returns { shortCode, shortUrl } so callers can persist the code server-side
  // (the server uses shortCode for the redirect lookup).
  createShortUrl(_originalUrl) {
    const shortCode = this.generateShortCode();
    const baseUrl = 'https://qr-generator-pierres-projects-bba7ee64.vercel.app';
    return { shortCode, shortUrl: `${baseUrl}/r/${shortCode}` };
  }

  // Save short URL mapping (same as main app)
  saveShortUrl(shortCode, originalUrl) {
    const shortUrls = JSON.parse(localStorage.getItem('shortUrls') || '{}');
    shortUrls[shortCode] = originalUrl;
    localStorage.setItem('shortUrls', JSON.stringify(shortUrls));
    console.log('🔗 Saved short URL mapping:', shortCode, '→', originalUrl);
  }

  // Generate short code (same logic as main app)
  generateShortCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async shortenUrl(url) {
    // Use TinyURL API for URL shortening
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    if (response.ok) {
      return await response.text();
    }
    return url; // Return original URL if shortening fails
  }

  async saveQRCode(originalUrl, shortCode, shortUrl, filename, format, utmParams, fullUrl) {
    console.log('🔍 saveQRCode called with:', { originalUrl, shortCode, shortUrl, filename, format, utmParams, fullUrl });

    try {
      // Save to database in background without opening main app
      console.log('🔄 Saving to database in background...');

      try {
        const response = await chrome.runtime.sendMessage({
          action: 'saveToDatabase',
          originalUrl,
          shortCode,
          shortUrl,
          filename,
          format,
          utmParams,
          fullUrl
        });
        
        console.log('📡 Database save response:', response);
        
        if (response && response.success) {
          console.log('✅ QR code saved to database successfully');
          this.showMessage('QR code saved to database!', 'success');
        } else {
          console.error('❌ Failed to save to database:', response?.error || 'No response');
          
          // Provide more specific error messages based on the error type
          let errorMessage = 'QR code downloaded but database save failed';
          if (response?.fallback === 'chrome_storage') {
            errorMessage = 'QR code saved locally (database connection failed)';
          } else if (response?.error) {
            errorMessage = `Database error: ${response.error}`;
          }
          
          this.showMessage(errorMessage, 'warning');
          
          // Log detailed error information for debugging
          if (response?.details) {
            console.error('📋 Error details:', response.details);
          }
        }
      } catch (dbError) {
        console.error('❌ Database save failed:', dbError);
        this.showMessage('QR code downloaded but database save failed', 'warning');
      }
      
      // Also save to Chrome storage for local history
      console.log('💾 Saving to Chrome storage...');
      try {
        await chrome.runtime.sendMessage({
          action: 'saveQRCode',
          url: shortUrl, // Save the short URL for consistency
          filename,
          format,
          utmParams
        });
        console.log('✅ QR code saved to Chrome storage');
      } catch (chromeError) {
        console.error('❌ Failed to save to Chrome storage:', chromeError);
        this.showMessage('Warning: Could not save to local storage', 'warning');
      }
      
      console.log('🎉 QR code save process completed');
    } catch (error) {
      console.error('❌ Error in saveQRCode:', error);
      
      // Still save to Chrome storage as fallback
      try {
        console.log('🔄 Attempting Chrome storage fallback...');
        await chrome.runtime.sendMessage({
          action: 'saveQRCode',
          url: shortUrl,
          filename,
          format,
          utmParams
        });
        this.showMessage('QR code saved locally due to connection error', 'warning');
      } catch (chromeError) {
        console.error('❌ Error saving to Chrome storage:', chromeError);
        this.showMessage('Error: Could not save QR code data', 'error');
        
        // Log additional debugging information
        console.error('📋 Chrome storage error details:', {
          error: chromeError.message,
          type: chromeError.name,
          timestamp: new Date().toISOString(),
          data: { shortUrl, filename, format }
        });
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