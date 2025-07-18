#!/bin/bash

# Build script for Stars QR Code Generator Safari Extension

echo "🚀 Building Stars QR Code Generator Safari Extension..."

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found. Please run this script from the extension directory."
    exit 1
fi

# Create icons directory if it doesn't exist
mkdir -p icons

# Create placeholder icons (you should replace these with actual icons)
echo "📱 Creating placeholder icons..."

# Create a simple SVG icon for testing
cat > icons/icon.svg << 'EOF'
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="20" fill="#1e293b"/>
  <path d="M64 32L78.5 52.5L102 56L85.5 72.5L89.5 96L64 84.5L38.5 96L42.5 72.5L26 56L49.5 52.5L64 32Z" fill="#FFD700"/>
</svg>
EOF

# Convert SVG to different sizes (requires ImageMagick or similar)
if command -v convert &> /dev/null; then
    echo "🔄 Converting icons to different sizes..."
    convert icons/icon.svg -resize 16x16 icons/icon16.png
    convert icons/icon.svg -resize 32x32 icons/icon32.png
    convert icons/icon.svg -resize 48x48 icons/icon48.png
    convert icons/icon.svg -resize 128x128 icons/icon128.png
else
    echo "⚠️  ImageMagick not found. Please manually create PNG icons in the icons/ directory."
    echo "   Required sizes: 16x16, 32x32, 48x48, 128x128"
fi

# Validate manifest.json
echo "✅ Validating manifest.json..."
if ! python3 -m json.tool manifest.json > /dev/null 2>&1; then
    echo "❌ Error: manifest.json is not valid JSON"
    exit 1
fi

# Create distribution directory
echo "📦 Creating distribution package..."
mkdir -p ../dist
cp -r * ../dist/
cd ../dist

# Create zip file for distribution
echo "🗜️  Creating zip package..."
zip -r "stars-qr-generator-safari-extension.zip" . -x "*.DS_Store" "*.git*" "build.sh"

echo "✅ Extension built successfully!"
echo "📁 Distribution package: dist/stars-qr-generator-safari-extension.zip"
echo ""
echo "📋 Next steps:"
echo "1. Open Safari > Develop > Show Extension Builder"
echo "2. Click '+' and select 'Add Extension...'"
echo "3. Navigate to the extension directory and select it"
echo "4. Click 'Run' to test the extension"
echo ""
echo "🎯 For production distribution:"
echo "- Replace placeholder icons with actual PNG files"
echo "- Package using Safari Extension Builder or Xcode"
echo "- Create .safariextz file for distribution" 