import nodemailer from 'nodemailer';
import DOMPurify from 'isomorphic-dompurify';

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
const transporter = nodemailer.createTransport(emailConfig);

// Strip CRLF to prevent header/log injection (subject + logs are not HTML).
const oneLine = (v) => String(v ?? '').replace(/[\r\n]+/g, ' ');

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

    console.log('📧 Sending scan notification email for QR code:', oneLine(qrCodeData.id));

    // Scan referrer/userAgent and the stored URLs are attacker-influenceable.
    // Sanitize every user-controlled value with DOMPurify before it reaches the
    // manually-constructed HTML email (defends against HTML/script injection).
    const scanCount = DOMPurify.sanitize(String((Number(qrCodeData.scanCount) || 0) + 1));
    const id = DOMPurify.sanitize(String(qrCodeData.id ?? ''));
    const originalUrl = DOMPurify.sanitize(String(qrCodeData.originalUrl ?? ''));
    const shortUrl = DOMPurify.sanitize(String(qrCodeData.shortUrl ?? ''));
    const fullUrl = DOMPurify.sanitize(String(qrCodeData.fullUrl ?? ''));
    const utmSource = DOMPurify.sanitize(String(qrCodeData.utmSource || 'Not set'));
    const utmMedium = DOMPurify.sanitize(String(qrCodeData.utmMedium || 'Not set'));
    const utmCampaign = DOMPurify.sanitize(String(qrCodeData.utmCampaign || 'Not set'));
    const utmTerm = qrCodeData.utmTerm ? DOMPurify.sanitize(String(qrCodeData.utmTerm)) : '';
    const utmContent = qrCodeData.utmContent ? DOMPurify.sanitize(String(qrCodeData.utmContent)) : '';
    const userAgent = DOMPurify.sanitize(String(scanData.userAgent || 'Unknown'));
    const referrer = DOMPurify.sanitize(String(scanData.referrer || 'Direct access'));
    const ipAddress = DOMPurify.sanitize(String(scanData.ipAddress || 'Not available'));
    const createdAt = DOMPurify.sanitize(String(qrCodeData.createdAt?.toDate?.()?.toLocaleString('fr-FR') || 'Unknown'));
    const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

    // Prepare email content
    const emailSubject = `🔍 QR Code Scanned: ${oneLine(qrCodeData.originalUrl)}`;

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🔍 QR Code Scan Notification</h2>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📊 Scan Details</h3>
          <p><strong>Timestamp:</strong> ${timestamp}</p>
          <p><strong>QR Code ID:</strong> ${id}</p>
          <p><strong>Scan Count:</strong> ${scanCount}</p>
        </div>

        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">🔗 URL Information</h3>
          <p><strong>Original URL:</strong> <a href="${originalUrl}">${originalUrl}</a></p>
          <p><strong>Short URL:</strong> <a href="${shortUrl}">${shortUrl}</a></p>
          <p><strong>Full URL with UTM:</strong> <a href="${fullUrl}">${fullUrl}</a></p>
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📈 UTM Parameters</h3>
          <p><strong>Source:</strong> ${utmSource}</p>
          <p><strong>Medium:</strong> ${utmMedium}</p>
          <p><strong>Campaign:</strong> ${utmCampaign}</p>
          ${utmTerm ? `<p><strong>Term:</strong> ${utmTerm}</p>` : ''}
          ${utmContent ? `<p><strong>Content:</strong> ${utmContent}</p>` : ''}
        </div>

        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📱 Device Information</h3>
          <p><strong>User Agent:</strong> ${userAgent}</p>
          <p><strong>Referrer:</strong> ${referrer}</p>
          <p><strong>IP Address:</strong> ${ipAddress}</p>
        </div>

        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📊 Analytics</h3>
          <p><strong>Created:</strong> ${createdAt}</p>
          <p><strong>Total Scans:</strong> ${scanCount}</p>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          This email was sent automatically by the Stars QR Code Generator system.<br>
          Generated on ${timestamp}
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
