export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log('🔗 Extracting title from URL:', url);

    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; QR-Generator/1.0)',
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok) {
      console.log('⚠️ Failed to fetch URL:', response.status);
      return res.status(200).json({ title: '' });
    }

    const html = await response.text();
    
    // Extract title using regex
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    
    if (titleMatch && titleMatch[1]) {
      const title = titleMatch[1].trim();
      console.log('✅ Extracted title:', title);
      return res.status(200).json({ title });
    }

    // Try to extract from meta tags if title tag not found
    const metaTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (metaTitleMatch && metaTitleMatch[1]) {
      const title = metaTitleMatch[1].trim();
      console.log('✅ Extracted title from meta tag:', title);
      return res.status(200).json({ title });
    }

    console.log('⚠️ No title found');
    return res.status(200).json({ title: '' });

  } catch (error) {
    console.error('❌ Error extracting title:', error);
    return res.status(200).json({ title: '' });
  }
} 