# Vercel Environments Setup Guide

## 🎯 Understanding Vercel Environments

Vercel has **3 types of deployments**, not traditional "environments":

### 1. Production Environment
- **Trigger**: Deploys from your `main` branch
- **URL**: Your main domain (e.g., `your-app.vercel.app`)
- **Purpose**: Live production app
- **Command**: `npx vercel --prod=true`

### 2. Preview Environment (Your "Development")
- **Trigger**: Deploys from any branch other than `main`
- **URL**: Unique preview URL (e.g., `your-app-git-feature-username.vercel.app`)
- **Purpose**: Testing and development
- **Command**: `npx vercel --prod=false`

### 3. Development Environment
- **Trigger**: Local development server
- **URL**: `localhost:3000` (or similar)
- **Purpose**: Local development
- **Command**: `npx vercel dev`

## 🚀 Setting Up Your Environments

### Step 1: Initial Setup

```bash
# Login to Vercel (first time only)
npx vercel login

# Link your project (first time only)
npx vercel link
```

### Step 2: Configure Environment Variables

In your Vercel dashboard:

1. Go to your project settings
2. Click "Environment Variables"
3. Add variables for each environment:

**Production Environment:**
```
VITE_APP_ENV=production
VITE_FIREBASE_API_KEY=your_prod_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_prod_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_prod_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_prod_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_prod_sender_id
VITE_FIREBASE_APP_ID=your_prod_app_id
```

**Preview Environment:**
```
VITE_APP_ENV=development
VITE_FIREBASE_API_KEY=your_dev_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_dev_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_dev_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_dev_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_dev_sender_id
VITE_FIREBASE_APP_ID=your_dev_app_id
```

### Step 3: Deploy to Production

```bash
# Deploy to production (main branch)
./deploy-prod.sh

# Or manually:
npx vercel --prod=true
```

### Step 4: Create Development/Preview Environment

```bash
# Create a development branch
git checkout -b develop

# Deploy to preview environment
./deploy-dev.sh

# Or manually:
npx vercel --prod=false
```

## 🔄 Workflow

### Development Workflow:
1. **Create feature branch**: `git checkout -b feature/new-feature`
2. **Make changes** and commit
3. **Deploy to preview**: `npx vercel --prod=false`
4. **Test** on the preview URL
5. **Merge to develop**: `git checkout develop && git merge feature/new-feature`
6. **Deploy develop**: `npx vercel --prod=false` (from develop branch)

### Production Workflow:
1. **Merge to main**: `git checkout main && git merge develop`
2. **Deploy to production**: `npx vercel --prod=true`
3. **Test** on production URL

## 📋 Branch Strategy

```
main (production)
├── develop (preview/development)
│   ├── feature/new-feature (preview)
│   ├── feature/bug-fix (preview)
│   └── hotfix/urgent-fix (preview)
```

## 🛠️ Commands Reference

### Deployment Commands:
```bash
# Production deployment
npx vercel --prod=true

# Preview deployment (development)
npx vercel --prod=false

# Local development
npx vercel dev

# List deployments
npx vercel ls

# Remove deployment
npx vercel remove
```

### Environment Variable Commands:
```bash
# Add environment variable
npx vercel env add VITE_APP_ENV

# List environment variables
npx vercel env ls

# Pull environment variables
npx vercel env pull .env.local
```

## 🎯 Best Practices

1. **Use Preview for Development**: Always test in preview before production
2. **Separate Firebase Projects**: Use different Firebase projects for dev/prod
3. **Environment Variables**: Set different values for Production vs Preview
4. **Branch Protection**: Protect your main branch
5. **Testing**: Always test preview deployments before merging to main

## 🔧 Troubleshooting

### Common Issues:

1. **Environment Variables Not Loading**
   - Check Vercel dashboard → Environment Variables
   - Ensure variables are prefixed with `VITE_`
   - Redeploy after adding variables

2. **Preview Not Working**
   - Make sure you're not on main branch
   - Use `npx vercel --prod=false`
   - Check deployment logs in Vercel dashboard

3. **Production Deployment Issues**
   - Ensure you're on main branch
   - Use `npx vercel --prod=true`
   - Check build logs for errors

### Debug Commands:
```bash
# Check current deployment status
npx vercel ls

# View deployment logs
npx vercel logs

# Check environment variables
npx vercel env ls
```

## 📞 Support

- **Vercel Documentation**: https://vercel.com/docs
- **Environment Variables**: https://vercel.com/docs/projects/environment-variables
- **Deployment**: https://vercel.com/docs/deployments 