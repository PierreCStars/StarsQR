# Stars QR Code Generator - User Documentation

## Overview

The Stars QR Code Generator is a powerful web application that creates QR codes with automatic UTM tracking parameters. It integrates with HubSpot campaigns and provides detailed analytics for tracking QR code performance.

**Production URL:** https://qr-generator-koxf19uh8-pierres-projects-bba7ee64.vercel.app

## Features

### 🎯 Core Features
- **QR Code Generation** in PNG and SVG formats
- **Automatic UTM Tracking** with customizable parameters
- **HubSpot Campaign Integration** - 44 campaigns available
- **URL Auto-shortening** for better tracking
- **Analytics Dashboard** with scan tracking
- **Smart Naming** - QR codes are automatically named based on page content

### 📊 Analytics & Tracking
- Real-time scan count tracking
- Campaign performance analysis
- Individual QR code statistics
- Export capabilities (PNG/SVG)

## How to Use

### Step 1: Generate a QR Code

1. **Enter Target URL**
   - Paste the URL you want to create a QR code for
   - The app will automatically extract the page title for better naming
   - Example: `https://stars.mc/voitures/occasion/mercedes-benz/klassen-300-204ch-long-avantgarde`

2. **Configure UTM Parameters**
   - **UTM Source**: Choose from Showroom, Le_Pneu, Midi_Pneu, Agency, Event
   - **UTM Medium**: Select Displays, Stickers, Brochure, Meta, LinkedIn
   - **UTM Campaign**: Choose from your HubSpot campaigns (44 available)
   - **UTM Term** (Optional): Add keywords like "running+shoes"
   - **UTM Content** (Optional): Specify content type like "textlink, banner"

3. **Generate QR Code**
   - Click "Generate QR Code"
   - The app will:
     - Add UTM parameters to your URL
     - Create a shortened tracking URL
     - Generate the QR code
     - Save to analytics database

### Step 2: Download & Use

1. **Download Options**
   - **PNG Format**: High-quality image for digital use
   - **SVG Format**: Scalable vector for print materials
   - Both formats maintain the same tracking capabilities

2. **QR Code Naming**
   - Files are automatically named based on page content
   - Stars.mc URLs: `mercedes-benz-klassen-300-204ch-long-avantgarde`
   - Other domains: Clean, meaningful names without generic terms

### Step 3: Track Performance

1. **Access Analytics**
   - Click "Analytics & Tracking" tab
   - Or use "Go to analytics" button after generating QR code

2. **View Statistics**
   - Total QR codes generated
   - Total scans across all codes
   - Average scans per code
   - Individual QR code performance

## HubSpot Campaigns Available

The app includes 44 campaigns from your HubSpot account:

**Popular Campaigns:**
- Stars Social
- Robb Report
- Stars Yachting
- Real Estate campaigns
- Stars Events
- Midi Pneu
- Yachting General
- Stars Yachting - Ice
- Dallara Test Drive - Prospects
- Stars Yachting charter - Ultimate Lady
- Stars Yachting sales - Azul V
- Real Estate - L'Exotique
- Stars Yachting Sales - Pershing
- StarsMC-Offers
- Stars Yachting Anvera
- Stars Yachting Charter
- Dallara Stradale
- Stars Yachting - Yacht Shows 2023
- Stars Yachting - Belassi
- Stars Aviation
- Stars Remarketing Global
- Stars MC remarketing
- Group Newsletter
- Real Estate Newsletters
- Stars Yachting
- Le Pneu-Generique
- Top Marques
- Réparation de jantes
- Open Track 27 mars
- XPEL Test Pierre
- Rim Repair
- Xpel window tint
- LEADS INSTAGRAM
- Events
- Dark Ads
- flyers
- carte de visite
- Totem
- Véhicules Small
- Vehicules Prestiges
- Social Media
- trackdays
- re-engage
- Porsche et Ferrari Fevrier 2021
- Concours Top Marques

## URL Shortening & Tracking

### How It Works
1. **Original URL**: `https://stars.mc/voitures/occasion/mercedes-benz/klassen-300-204ch-long-avantgarde`
2. **With UTM**: `https://stars.mc/voitures/occasion/mercedes-benz/klassen-300-204ch-long-avantgarde?utm_source=Showroom&utm_medium=Displays&utm_campaign=Stars%20Social`
3. **Shortened**: `https://qr-generator-koxf19uh8-pierres-projects-bba7ee64.vercel.app/r/AbC123`

### Tracking Benefits
- **Clean URLs**: Short, shareable links
- **Analytics**: Track clicks and scans
- **UTM Data**: Full campaign attribution
- **Redirect Tracking**: Monitor when users scan and visit

## Best Practices

### QR Code Placement
- **Print Materials**: Use PNG format for brochures, business cards
- **Digital Displays**: Use SVG for websites, presentations
- **Size**: Minimum 2x2 inches (5x5 cm) for reliable scanning
- **Contrast**: Ensure good contrast between QR code and background

### UTM Strategy
- **Consistent Naming**: Use the same campaign names across platforms
- **Source Tracking**: Different sources for different locations
- **Medium Specificity**: Be specific about where QR codes are placed
- **Content Variation**: Test different UTM content for A/B testing

### Analytics Review
- **Regular Monitoring**: Check analytics weekly
- **Campaign Performance**: Compare different campaigns
- **Location Analysis**: Track which placements perform best
- **Seasonal Trends**: Monitor performance over time

## Troubleshooting

### Common Issues

**QR Code Not Scanning**
- Ensure minimum size (2x2 inches)
- Check contrast and lighting
- Verify QR code is not damaged or distorted

**Campaigns Not Loading**
- Refresh the page
- Check internet connection
- Contact administrator if issue persists

**Analytics Not Updating**
- Allow 24-48 hours for data to appear
- Check if QR codes are being scanned
- Verify UTM parameters are correct

**Download Issues**
- Try different browser
- Check file permissions
- Ensure sufficient storage space

### Technical Support

For technical issues or questions:
- Check this documentation first
- Review the analytics dashboard for data issues
- Contact your system administrator

## Data & Privacy

### Information Collected
- QR code scan counts
- UTM parameter data
- Page titles and URLs
- Timestamp information

### Data Usage
- Analytics and reporting
- Campaign performance tracking
- No personal information collected
- Data stored securely in Firebase

## Updates & Maintenance

### Recent Updates
- Enhanced QR code naming (removed generic terms)
- Fixed analytics navigation
- Improved HubSpot campaign integration
- Better URL shortening functionality

### Future Features
- Advanced analytics dashboard
- Custom UTM parameter templates
- Bulk QR code generation
- Integration with additional platforms

---

**Last Updated:** July 17, 2025  
**Version:** 1.0.0  
**Support:** Contact your system administrator for technical support 