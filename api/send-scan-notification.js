import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

// Create transporter
const transporter = nodemailer.createTransporter(emailConfig);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { qrCodeData, scanData } = req.body;

    if (!qrCodeData || !scanData) {
      return res.status(400).json({ error: 'QR code data and scan data are required' });
    }

    console.log('📧 Sending scan notification email:', { qrCodeData, scanData });

    // Prepare email content
    const emailSubject = `🔍 QR Code Scanned: ${qrCodeData.originalUrl}`;
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🔍 QR Code Scan Notification</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📊 Scan Details</h3>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</p>
          <p><strong>QR Code ID:</strong> ${qrCodeData.id}</p>
          <p><strong>Scan Count:</strong> ${(qrCodeData.scanCount || 0) + 1}</p>
        </div>

        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">🔗 URL Information</h3>
          <p><strong>Original URL:</strong> <a href="${qrCodeData.originalUrl}">${qrCodeData.originalUrl}</a></p>
          <p><strong>Short URL:</strong> <a href="${qrCodeData.shortUrl}">${qrCodeData.shortUrl}</a></p>
          <p><strong>Full URL with UTM:</strong> <a href="${qrCodeData.fullUrl}">${qrCodeData.fullUrl}</a></p>
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📈 UTM Parameters</h3>
          <p><strong>Source:</strong> ${qrCodeData.utmSource || 'Not set'}</p>
          <p><strong>Medium:</strong> ${qrCodeData.utmMedium || 'Not set'}</p>
          <p><strong>Campaign:</strong> ${qrCodeData.utmCampaign || 'Not set'}</p>
          ${qrCodeData.utmTerm ? `<p><strong>Term:</strong> ${qrCodeData.utmTerm}</p>` : ''}
          ${qrCodeData.utmContent ? `<p><strong>Content:</strong> ${qrCodeData.utmContent}</p>` : ''}
        </div>

        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📱 Device Information</h3>
          <p><strong>User Agent:</strong> ${scanData.userAgent || 'Unknown'}</p>
          <p><strong>Referrer:</strong> ${scanData.referrer || 'Direct access'}</p>
          <p><strong>IP Address:</strong> ${scanData.ipAddress || 'Not available'}</p>
        </div>

        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📊 Analytics</h3>
          <p><strong>Created:</strong> ${qrCodeData.createdAt?.toDate?.()?.toLocaleString('fr-FR') || 'Unknown'}</p>
          <p><strong>Total Scans:</strong> ${(qrCodeData.scanCount || 0) + 1}</p>
          <p><a href="https://qr-generator-koxf19uh8-pierres-projects-bba7ee64.vercel.app" style="color: #2563eb;">View Analytics Dashboard</a></p>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          This email was sent automatically by the Stars QR Code Generator system.<br>
          Generated on ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
        </p>
      </div>
    `;

    // Send email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'pierre@stars.mc',
      subject: emailSubject,
      html: emailBody
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Scan notification email sent successfully:', info.messageId);

    res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: 'Scan notification email sent successfully'
    });

  } catch (error) {
    console.error('❌ Error sending scan notification email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
} 