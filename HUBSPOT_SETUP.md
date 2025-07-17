# HubSpot Integration Setup

This guide explains how to set up HubSpot integration to fetch campaigns dynamically in your QR Code Generator.

## Prerequisites

1. **HubSpot Account**: You need a HubSpot account with campaigns set up
2. **HubSpot API Access**: You need API access to fetch campaigns

## Step 1: Get Your HubSpot API Key

### Option A: Private App (Recommended)

1. **Go to HubSpot Settings**:
   - Log into your HubSpot account
   - Go to Settings → Account Setup → Integrations → Private Apps

2. **Create a Private App**:
   - Click "Create private app"
   - Give it a name like "QR Code Generator"
   - Add a description: "Fetches campaigns for QR code UTM tracking"

3. **Configure Scopes**:
   - Add the following scopes:
     - `crm.objects.campaigns.read` - Read campaign data
     - `crm.objects.contacts.read` - Read contact data (optional, for future features)

4. **Create the App**:
   - Click "Create app"
   - Copy the API key (starts with `pat-`)

### Option B: OAuth App (For production)

1. **Go to HubSpot Developer Portal**:
   - Visit [developers.hubspot.com](https://developers.hubspot.com)
   - Create a new app

2. **Configure OAuth**:
   - Set up OAuth scopes for campaign access
   - Get client ID and client secret

## Step 2: Add API Key to Environment Variables

### Local Development

1. **Create `.env.local` file** (if it doesn't exist):
   ```bash
   cp env.example .env.local
   ```

2. **Add your HubSpot API key**:
   ```env
   VITE_HUBSPOT_API_KEY=pat-your-api-key-here
   ```

### Vercel Deployment

1. **Go to Vercel Dashboard**:
   - Navigate to your project settings
   - Go to "Environment Variables"

2. **Add HubSpot API Key**:
   - **Name**: `VITE_HUBSPOT_API_KEY`
   - **Value**: `pat-your-api-key-here`
   - **Environment**: Select both "Production" and "Preview"

3. **Redeploy**:
   - After adding the environment variable, redeploy your app

## Step 3: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Check the browser console**:
   - Open Developer Tools (F12)
   - Look for HubSpot API logs:
     - `🔗 Fetching HubSpot campaigns...`
     - `✅ HubSpot campaigns loaded: [...]`

3. **Verify the dropdown**:
   - The "UTM Campaign" dropdown should show "Loading campaigns..."
   - Then populate with your HubSpot campaigns

## Troubleshooting

### Common Issues

1. **"HubSpot API key not configured"**
   - Check that `VITE_HUBSPOT_API_KEY` is set in your environment variables
   - Restart your development server after adding the variable

2. **"HubSpot API error: 401"**
   - Your API key is invalid or expired
   - Generate a new API key in HubSpot

3. **"HubSpot API error: 403"**
   - Your API key doesn't have the required scopes
   - Add `crm.objects.campaigns.read` scope to your private app

4. **No campaigns showing**
   - Check that you have active campaigns in HubSpot
   - The API only fetches campaigns with status "ACTIVE" or "DRAFT"

### Debug Commands

```bash
# Check environment variables
echo $VITE_HUBSPOT_API_KEY

# Test API key manually
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.hubapi.com/crm/v3/objects/campaigns?limit=10
```

## Fallback Behavior

If the HubSpot API fails or no API key is configured, the app will:
- Show default campaigns: "Car Sales", "Yachting Charter", etc.
- Log the error in the console
- Continue to function normally

## Security Notes

- **Never commit API keys** to version control
- **Use environment variables** for all API keys
- **Rotate API keys** regularly
- **Use private apps** for internal tools
- **Limit scopes** to only what's needed

## Future Enhancements

This integration can be extended to:
- Create contacts in HubSpot when QR codes are scanned
- Track QR code analytics in HubSpot
- Sync UTM parameters with HubSpot contact properties
- Trigger HubSpot workflows on QR code scans 