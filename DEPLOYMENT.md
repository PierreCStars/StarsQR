# Deployment Guide

This guide explains how to deploy your QR Generator app to Vercel with separate development and production environments.

## Prerequisites

1. **Vercel CLI**: Install globally
   ```bash
   npm install -g vercel
   ```

2. **Firebase Projects**: Set up separate Firebase projects for development and production
   - Development project: `your-dev-project-id`
   - Production project: `your-prod-project-id`

## Environment Setup

### 1. Development Environment

Create `.env.development` with your development Firebase credentials:

```env
VITE_APP_ENV=development
VITE_FIREBASE_API_KEY=your_dev_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_dev_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_dev_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_dev_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_dev_sender_id
VITE_FIREBASE_APP_ID=your_dev_app_id
```

### 2. Production Environment

Create `.env.production` with your production Firebase credentials:

```env
VITE_APP_ENV=production
VITE_FIREBASE_API_KEY=your_prod_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_prod_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_prod_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_prod_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_prod_sender_id
VITE_FIREBASE_APP_ID=your_prod_app_id
```

## Deployment Commands

### Development Deployment

```bash
# Option 1: Using the deployment script
./deploy-dev.sh

# Option 2: Manual deployment
vercel --prod=false --config vercel.dev.json
```

### Production Deployment

```bash
# Option 1: Using the deployment script
./deploy-prod.sh

# Option 2: Manual deployment
vercel --prod=true --config vercel.prod.json
```

## Vercel Dashboard Configuration

### 1. Environment Variables

Set up environment variables in your Vercel dashboard:

**Development Environment:**
- Go to your project settings in Vercel
- Navigate to "Environment Variables"
- Add all variables from `.env.development`

**Production Environment:**
- Add all variables from `.env.production`
- Make sure to select "Production" environment

### 2. Domain Configuration

**Development:**
- Usually gets a preview URL like: `qr-generator-git-dev-yourusername.vercel.app`

**Production:**
- Configure your custom domain in Vercel dashboard
- Set up DNS records as instructed by Vercel

## Build Scripts

The project includes environment-specific build scripts:

- `npm run build:dev` - Build for development
- `npm run build:prod` - Build for production
- `npm run build` - Default build (production)

## Configuration Files

- `vercel.json` - Default Vercel configuration
- `vercel.dev.json` - Development-specific configuration
- `vercel.prod.json` - Production-specific configuration

## Security Headers

**Development:**
- Basic security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)

**Production:**
- All development headers plus HSTS (Strict-Transport-Security)

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure variables are prefixed with `VITE_`
   - Check Vercel dashboard environment variable settings
   - Verify the correct environment is selected

2. **Build Failures**
   - Check Firebase configuration
   - Ensure all required environment variables are set
   - Review build logs in Vercel dashboard

3. **Deployment Scripts Not Working**
   - Make sure scripts are executable: `chmod +x deploy-*.sh`
   - Verify Vercel CLI is installed globally
   - Check if you're logged into Vercel: `vercel login`

### Debugging

1. **Local Testing**
   ```bash
   # Test development build locally
   npm run build:dev
   npm run preview

   # Test production build locally
   npm run build:prod
   npm run preview
   ```

2. **Environment Variable Debugging**
   - Add console.log in your app to check `import.meta.env.VITE_APP_ENV`
   - Check Vercel deployment logs

## Best Practices

1. **Never commit environment files** - They're already in `.gitignore`
2. **Use different Firebase projects** for dev and prod
3. **Test thoroughly** in development before deploying to production
4. **Monitor deployments** using Vercel dashboard
5. **Set up automatic deployments** from your main branch to production

## Continuous Deployment

To set up automatic deployments:

1. Connect your GitHub repository to Vercel
2. Configure branch deployments:
   - `main` branch → Production
   - `develop` branch → Development
3. Set up environment variables for each environment
4. Enable automatic deployments in Vercel dashboard 