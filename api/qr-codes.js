import { db, FieldValue } from './_lib/firebase.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const snap = await db.collection('qrCodes').orderBy('createdAt', 'desc').get();
      const qrCodes = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toMillis?.() ?? null,
          updatedAt: data.updatedAt?.toMillis?.() ?? null,
          lastScanned: data.lastScanned?.toMillis?.() ?? null,
        };
      });
      return res.status(200).json(qrCodes);
    }

    if (req.method === 'POST') {
      const {
        originalUrl,
        shortUrl,
        shortCode,
        fullUrl,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
      } = req.body || {};

      const record = {
        originalUrl,
        shortUrl,
        shortCode,
        fullUrl,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
      };
      const clean = Object.fromEntries(
        Object.entries(record).filter(([, value]) => value !== undefined)
      );

      const ref = await db.collection('qrCodes').add({
        ...clean,
        scanCount: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return res.status(200).json({ id: ref.id });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('qr-codes error', err);
    return res.status(500).json({ error: err.message });
  }
}
