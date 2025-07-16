#!/bin/bash

echo "🚀 Deploying to Vercel Production Environment..."

# Check if Vercel CLI is available
if ! command -v npx vercel &> /dev/null; then
    echo "❌ Vercel CLI is not available. Using npx..."
fi

# Set environment variables for production
export VITE_APP_ENV=production

echo "📋 Creating production deployment..."
echo "This will deploy to your main production URL"

# Deploy to production environment
npx vercel --prod=true

echo "✅ Production deployment completed!"
echo "🌐 Your production URL will be shown above" 