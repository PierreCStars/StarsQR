#!/bin/bash

echo "🔨 Building Chrome Extension..."

# Navigate to extension directory
cd "$(dirname "$0")"

echo "📁 Current directory: $(pwd)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Creating basic package.json..."
    cat > package.json << EOF
{
  "name": "qr-code-generator-extension",
  "version": "1.0.0",
  "description": "Chrome Extension for QR Code Generator",
  "scripts": {
    "build": "echo 'Extension built successfully!'",
    "test": "echo 'No tests configured'"
  }
}
EOF
fi

# Create a simple build process
echo "📦 Creating extension package..."

# Create a temporary build directory
rm -rf build
mkdir -p build

# Copy all necessary files
cp -r popup build/
cp -r background build/
cp -r content build/
cp -r icons build/
cp manifest.json build/
cp README.md build/
cp FIREBASE_SETUP.md build/

# Create a zip file for easy installation
cd build
zip -r ../qr-code-generator-extension.zip .
cd ..

echo "✅ Extension built successfully!"
echo "📦 Extension package: qr-code-generator-extension.zip"
echo ""
echo "🚀 To install in Chrome:"
echo "1. Go to chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked'"
echo "4. Select the 'build' folder"
echo ""
echo "🔄 To reload the extension:"
echo "1. Go to chrome://extensions/"
echo "2. Find 'QR Code Generator'"
echo "3. Click the refresh/reload button"
echo ""
echo "🧪 To test the API:"
echo "1. Open test-extension-api.html in your browser"
echo "2. Click 'Test API Endpoint'"
echo "3. Check if QR codes appear in main app analytics" 