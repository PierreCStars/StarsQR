# Chrome Extension for QR Code Generator

This Chrome extension provides the same QR code generation functionality as the Safari extension, but optimized for Chrome browsers using Manifest V3.

## 🚀 Quick Start

### Installation

1. **Build the extension:**
   ```bash
   cd extension
   ./build-chrome.sh
   ```

2. **Install in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked"
   - Select the `chrome-extension` folder

3. **Start using:**
   - Click the extension icon in your browser toolbar
   - The current page URL will be automatically filled
   - Generate QR codes with UTM tracking

## 📁 File Structure

```
extension/
├── manifest-chrome.json          # Chrome manifest (Manifest V3)
├── background-chrome.js          # Chrome background script
├── popup/
│   ├── popup.html               # Popup HTML (shared)
│   ├── popup.css                # Popup styles (shared)
│   └── popup-chrome.js          # Chrome-specific popup logic
├── content/
│   └── content-chrome.js        # Chrome content script
├── icons/                       # Extension icons
├── build-chrome.sh              # Chrome build script
└── chrome-extension/            # Built extension (generated)
    ├── manifest.json
    ├── background.js
    ├── popup/
    ├── content/
    └── icons/
```

## 🔧 Key Differences from Safari Extension

### Manifest Structure
- **Chrome**: Uses Manifest V3 with `service_worker` instead of `background.scripts`
- **Safari**: Uses Manifest V2 with `background.scripts`

### Background Script
- **Chrome**: Service worker with different API patterns
- **Safari**: Background page with traditional APIs

### Permissions
- **Chrome**: Uses `host_permissions` for web access
- **Safari**: Uses `permissions` for all access

### Storage
- **Chrome**: `chrome.storage.local` API
- **Safari**: `browser.storage.local` API

## 🛠️ Development

### Building
```bash
cd extension
./build-chrome.sh
```

### Testing
1. Build the extension
2. Load it in Chrome as described above
3. Make changes to source files
4. Rebuild and reload the extension

### Debugging
- Open Chrome DevTools for the popup: Right-click extension icon → "Inspect popup"
- View background script logs: Go to `chrome://extensions/` → Find your extension → "service worker" link
- Check content script logs: Open DevTools on any webpage

## 📦 Distribution

### Create ZIP Package
```bash
cd extension/chrome-extension
zip -r ../qr-code-generator-chrome.zip .
```

### Chrome Web Store (Optional)
1. Create a developer account at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Upload the ZIP file
3. Fill in store listing details
4. Submit for review

## 🔒 Permissions

The extension requests these permissions:

- **`activeTab`**: Access current tab URL and title
- **`storage`**: Save settings and QR code history  
- **`tabs`**: Open analytics in new tab
- **`host_permissions`**: Access web pages for URL shortening

## 🎯 Features

- ✅ Generate QR codes from current page URL
- ✅ Add UTM parameters for campaign tracking
- ✅ Auto-shorten URLs using TinyURL
- ✅ Multiple output formats (PNG, SVG)
- ✅ Campaign dropdown with Stars.mc campaigns
- ✅ Automatic filename generation
- ✅ Settings persistence
- ✅ QR code history tracking

## 🐛 Troubleshooting

### Extension Not Loading
- Ensure Developer mode is enabled
- Check that all files are present in the `chrome-extension` folder
- Look for errors in the extensions page

### QR Code Generation Fails
- Check browser console for error messages
- Verify internet connection (needed for QR generation API)
- Ensure URL is valid

### Campaign Dropdown Empty
- The extension uses a hardcoded list of campaigns
- For dynamic campaigns, modify `popup-chrome.js` to fetch from your API

### Settings Not Saving
- Check that storage permission is granted
- Look for errors in the background script console

## 🔄 Updates

To update the extension:

1. Make changes to source files
2. Run `./build-chrome.sh`
3. Go to `chrome://extensions/`
4. Click the refresh icon on your extension
5. Test the changes

## 📚 Resources

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/reference/)
- [Chrome Web Store](https://chrome.google.com/webstore/)

## 🤝 Contributing

1. Make changes to source files in the `extension/` directory
2. Test thoroughly in Chrome
3. Update documentation if needed
4. Commit and push changes

## 📄 License

Same license as the main project. 