# Stars QR Code Generator - Safari Extension

A Safari extension that generates QR codes with UTM tracking parameters from any webpage.

## Features

- 🎯 **One-click QR generation** from any webpage
- 📊 **UTM tracking integration** with HubSpot campaigns
- 🔗 **URL auto-shortening** for better tracking
- 📱 **PNG & SVG download** options
- ⚡ **Fast and lightweight** popup interface
- 🎨 **Stars branding** with golden star theme

## Installation

### For Development/Testing

1. **Open Safari** and go to `Safari > Settings > Advanced`
2. **Enable "Show Develop menu in menu bar"**
3. **Go to `Develop > Show Extension Builder`**
4. **Click the "+" button** and select "Add Extension..."
5. **Navigate to this extension folder** and select it
6. **Click "Run"** to load the extension

### For Distribution

1. **Package the extension** using Xcode or Safari Extension Builder
2. **Create a `.safariextz` file** for distribution
3. **Share with users** who can install via Safari Extension Builder

## Usage

### Basic Usage

1. **Click the extension icon** in Safari's toolbar
2. **Enter a URL** or click "Use Current Page"
3. **Select UTM parameters** (Source, Medium, Campaign, etc.)
4. **Click "Generate QR Code"**
5. **Download or copy** the generated QR code

### Advanced Features

- **Keyboard Shortcut**: Press `Ctrl/Cmd + Shift + Q` to inject QR generator on any page
- **Right-click Menu**: Right-click on any page or link to generate QR code
- **Auto-injection**: QR generator automatically appears on Stars.mc websites

## Configuration

### UTM Parameters

- **Source**: Defaults to "safari_extension"
- **Medium**: Defaults to "qr_code"
- **Campaign**: Loaded from your HubSpot campaigns
- **Term**: Optional keywords
- **Content**: Optional content description

### API Integration

The extension connects to your existing Vercel deployment:
- **URL Shortening**: `https://qr-generator-*.vercel.app/api/shorten`
- **Campaigns**: `https://qr-generator-*.vercel.app/api/hubspot-campaigns`

## File Structure

```
extension/
├── manifest.json          # Extension configuration
├── popup/
│   ├── popup.html        # Popup interface
│   ├── popup.css         # Popup styling
│   └── popup.js          # Popup functionality
├── background/
│   └── background.js     # Service worker
├── content/
│   └── content.js        # Content script
├── icons/                # Extension icons
└── README.md            # This file
```

## Development

### Building

1. **Make changes** to the extension files
2. **Reload in Safari Extension Builder** (Develop > Show Extension Builder)
3. **Test functionality** in Safari

### Debugging

- **Console logs** appear in Safari's Web Inspector
- **Background script logs** appear in Extension Builder console
- **Content script logs** appear in page console

## Browser Compatibility

- ✅ **Safari 15+** (macOS)
- ✅ **Chrome 88+** (with minor modifications)
- ✅ **Firefox 109+** (with minor modifications)

## Troubleshooting

### Common Issues

1. **Extension not loading**: Check manifest.json syntax
2. **API calls failing**: Verify CORS settings on your Vercel deployment
3. **Icons not showing**: Ensure icon files exist in icons/ directory

### Permissions

The extension requires:
- `activeTab`: To access current page URL
- `storage`: To save user preferences
- `tabs`: To interact with browser tabs

## Support

For issues or questions:
1. Check the console for error messages
2. Verify your Vercel deployment is running
3. Ensure all API endpoints are accessible

## License

This extension is part of the Stars QR Code Generator project. 