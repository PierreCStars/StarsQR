#!/bin/bash

# Chrome Extension Build Script
# Builds the Chrome extension from the source files

set -e

echo "🚀 Building Chrome Extension..."

# Create build directory
BUILD_DIR="chrome-extension"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Copy and rename manifest
echo "📄 Creating Chrome manifest..."
cp manifest-chrome.json "$BUILD_DIR/manifest.json"

# Copy background script
echo "🔧 Copying background script..."
cp background-chrome.js "$BUILD_DIR/background.js"

# Copy popup files
echo "📱 Copying popup files..."
mkdir -p "$BUILD_DIR/popup"
cp popup/popup.html "$BUILD_DIR/popup/"
cp popup/popup-chrome.js "$BUILD_DIR/popup/popup.js"
cp popup/popup.css "$BUILD_DIR/popup/"

# Copy content script
echo "📜 Copying content script..."
mkdir -p "$BUILD_DIR/content"
cp content/content-chrome.js "$BUILD_DIR/content/content.js"

# Copy icons
echo "🎨 Copying icons..."
mkdir -p "$BUILD_DIR/icons"
cp icons/*.png "$BUILD_DIR/icons/"

# Create package.json for Chrome extension
echo "📦 Creating package.json..."
cat > "$BUILD_DIR/package.json" << EOF
{
  "name": "qr-code-generator-chrome",
  "version": "1.0.0",
  "description": "Chrome extension for generating QR codes with UTM tracking",
  "main": "background.js",
  "scripts": {
    "build": "echo 'Extension built successfully'",
    "package": "zip -r qr-code-generator-chrome.zip ."
  },
  "keywords": ["chrome-extension", "qr-code", "utm-tracking"],
  "author": "Your Name",
  "license": "MIT"
}
EOF

# Create README for Chrome extension
echo "📖 Creating README..."
cat > "$BUILD_DIR/README.md" << EOF
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

1. Open Chrome and go to \`chrome://extensions/\`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the \`chrome-extension\` folder

### Production Installation

1. Download the \`qr-code-generator-chrome.zip\` file
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

1. Edit the source files in the \`extension/\` directory
2. Run \`./build-chrome.sh\` to rebuild
3. Reload the extension in Chrome

## Permissions

- \`activeTab\`: Access current tab URL and title
- \`storage\`: Save settings and QR code history
- \`tabs\`: Open analytics in new tab
- \`host_permissions\`: Access web pages for URL shortening

## Troubleshooting

- If the extension doesn't work, try reloading it in \`chrome://extensions/\`
- Check the browser console for error messages
- Ensure all required permissions are granted

## Support

For issues or questions, please check the main project documentation.
EOF

# Create .gitignore for Chrome extension
echo "🚫 Creating .gitignore..."
cat > "$BUILD_DIR/.gitignore" << EOF
# Chrome Extension specific ignores
*.zip
*.crx
*.pem
node_modules/
.DS_Store
Thumbs.db
EOF

echo "✅ Chrome extension built successfully!"
echo "📁 Build directory: $BUILD_DIR"
echo ""
echo "To install in Chrome:"
echo "1. Open chrome://extensions/"
echo "2. Enable Developer mode"
echo "3. Click 'Load unpacked'"
echo "4. Select the '$BUILD_DIR' folder"
echo ""
echo "To create a zip file for distribution:"
echo "cd $BUILD_DIR && zip -r ../qr-code-generator-chrome.zip ." 