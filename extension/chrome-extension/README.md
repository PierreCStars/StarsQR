# QR Code Generator Chrome Extension

A Chrome extension for generating QR codes with UTM tracking and analytics.

## Features

- Generate QR codes from current page URL
- Add UTM parameters for campaign tracking
- Auto-shorten URLs
- Multiple output formats (PNG, SVG)
- Campaign dropdown with HubSpot integration
- Automatic filename generation
- Settings persistence

## Installation

### Development Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `chrome-extension` folder

### Production Installation

1. Download the `qr-code-generator-chrome.zip` file
2. Extract the contents
3. Follow the development installation steps above

## Usage

1. Click the extension icon in your browser toolbar
2. The current page URL will be automatically filled
3. Select a campaign from the dropdown (optional)
4. Add UTM source and medium (optional)
5. Choose output format and size
6. Click "Generate QR Code"
7. The QR code will be downloaded automatically

## Configuration

The extension saves your preferences automatically:
- Default format (PNG/SVG)
- Default size
- Auto-shorten URLs
- Track analytics

## Development

To modify the extension:

1. Edit the source files in the `extension/` directory
2. Run `./build-chrome.sh` to rebuild
3. Reload the extension in Chrome

## Permissions

- `activeTab`: Access current tab URL and title
- `storage`: Save settings and QR code history
- `tabs`: Open analytics in new tab
- `host_permissions`: Access web pages for URL shortening

## Troubleshooting

- If the extension doesn't work, try reloading it in `chrome://extensions/`
- Check the browser console for error messages
- Ensure all required permissions are granted

## Support

For issues or questions, please check the main project documentation.
