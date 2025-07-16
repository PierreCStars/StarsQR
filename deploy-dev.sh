#!/bin/bash

echo "🚀 Deploying to Vercel Preview Environment (Development)..."

# Check if Vercel CLI is available
if ! command -v npx vercel &> /dev/null; then
    echo "❌ Vercel CLI is not available. Using npx..."
fi

# Set environment variables for development
export VITE_APP_ENV=development

echo "📋 Creating preview deployment..."
echo "This will create a development-like environment for testing"

# Deploy to preview environment (not production)
npx vercel --prod=false

echo "✅ Preview deployment completed!"
echo "🌐 Your preview URL will be shown above"
echo "💡 This is your development environment for testing" 