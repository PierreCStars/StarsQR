# Chrome Extension for QR Code Generator

## Overview
This Chrome extension allows you to quickly generate QR codes from any webpage you're visiting. It integrates with the main QR Code Generator app but saves QR codes locally due to authentication restrictions.

## Features
- **Quick QR Generation**: Generate QR codes from any webpage with one click
- **UTM Tracking**: Add UTM parameters for campaign tracking
- **Multiple Formats**: Generate QR codes in PNG or SVG format
- **Custom Sizing**: Adjust QR code size from 128px to 512px
- **Local Storage**: QR codes are saved locally in Chrome storage
- **Auto-filename**: Automatically generates descriptive filenames

## Installation

### Method 1: Load Unpacked Extension
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `extension/chrome-extension` folder
6. The extension should now appear in your extensions list

### Method 2: From Source
1. Navigate to the extension directory: `cd extension/chrome-extension`
2. Install dependencies: `npm install`
3. Build the extension: `npm run build`
4. Follow Method 1 to load the extension

## Usage

### Basic Usage
1. Navigate to any webpage
2. Click the QR Code Generator extension icon in your toolbar
3. The popup will show the current page URL
4. Click "Use Current Page" to populate the URL field
5. Customize UTM parameters if needed
6. Click "Download QR Code" to generate and download

### Advanced Features
- **UTM Parameters**: Add campaign tracking parameters
- **Format Selection**: Choose between PNG and SVG formats
- **Size Adjustment**: Modify QR code size for different use cases
- **Custom Filename**: Edit the filename before downloading

## Current Limitations

### Firebase Integration
Due to Vercel authentication restrictions, the Chrome extension cannot directly save QR codes to the main app's Firebase database. Instead:

1. **Local Storage**: QR codes are saved locally in Chrome storage
2. **Manual Import**: To sync with the main app, manually add QR codes through the web interface
3. **Export Option**: You can export QR code data from Chrome storage for manual import

### Workaround for Database Sync
If you need to sync QR codes with the main app:

1. Generate QR codes using the extension
2. Note the URL and UTM parameters used
3. Go to the main QR Code Generator app
4. Manually recreate the QR code with the same parameters
5. This ensures the QR code appears in your analytics and tracking

## Technical Details

### Architecture
- **Popup**: User interface for QR code generation
- **Background Script**: Handles Chrome storage and messaging
- **Content Script**: Can access current page information
- **Local Storage**: Chrome's local storage for saving QR codes

### Data Structure
QR codes are stored locally with the following structure:
```json
{
  "id": "timestamp",
  "url": "original_url",
  "filename": "generated_filename",
  "format": "png|svg",
  "timestamp": "ISO_date_string",
  "utmParams": {
    "utm_source": "chrome_extension",
    "utm_medium": "qr_code",
    "utm_campaign": "campaign_name",
    "utm_term": "keyword",
    "utm_content": "content_variant"
  }
}
```

## Development

### Building
```bash
cd extension/chrome-extension
npm install
npm run build
```

### Testing
1. Load the extension in Chrome
2. Navigate to different websites
3. Test QR code generation with various UTM parameters
4. Verify local storage functionality

### Debugging
- Open Chrome DevTools for the popup: Right-click extension icon → Inspect popup
- Check background script logs: Go to `chrome://extensions/` → Find extension → Click "service worker"
- View local storage: DevTools → Application → Storage → Local Storage

## Future Enhancements
- [ ] Direct Firebase integration (requires authentication solution)
- [ ] Bulk export/import functionality
- [ ] QR code history viewer
- [ ] Custom UTM templates
- [ ] Integration with other URL shorteners

## Troubleshooting

### Extension Not Loading
- Ensure Developer mode is enabled
- Check that all files are present in the extension directory
- Verify the manifest.json file is valid

### QR Codes Not Generating
- Check internet connection (QR generation requires external API)
- Verify the URL is valid
- Check browser console for error messages

### Local Storage Issues
- Clear Chrome storage if data becomes corrupted
- Check available storage space
- Verify extension permissions

## Support
For issues or questions:
1. Check the troubleshooting section above
2. Review the main app documentation
3. Check browser console for error messages
4. Verify extension permissions in Chrome settings
