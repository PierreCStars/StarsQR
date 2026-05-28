import { db, FieldValue } from '../_lib/firebase.js';

export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');
  try {
    let snap = await db.collection('qrCodes').where('shortCode', '==', code).limit(1).get();
    if (snap.empty) {
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const proto = req.headers['x-forwarded-proto'] || 'https';
      const full = `${proto}://${host}/r/${code}`;
      snap = await db.collection('qrCodes').where('shortUrl', '==', full).limit(1).get();
    }
    if (snap.empty) return res.status(404).send('QR code introuvable');

    const docSnap = snap.docs[0];
    const data = docSnap.data();
    const target = data.fullUrl || data.originalUrl;
    if (!target) return res.status(404).send('QR code introuvable');

    try {
      await docSnap.ref.update({
        scanCount: FieldValue.increment(1),
        lastScanned: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      await db.collection('qrCodeScans').add({
        qrCodeId: docSnap.id,
        userAgent: req.headers['user-agent'] || 'Unknown',
        referrer: req.headers.referer || 'Direct',
        ipAddress: (req.headers['x-forwarded-for'] || '').split(',')[0] || 'Unknown',
        timestamp: FieldValue.serverTimestamp(),
      });
    } catch (e) { console.error('scan tracking failed', e); }

    try {
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const proto = req.headers['x-forwarded-proto'] || 'https';
      await fetch(`${proto}://${host}/api/send-scan-notification`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCodeData: { id: docSnap.id, ...data },
          scanData: {
            userAgent: req.headers['user-agent'],
            referrer: req.headers.referer,
            ipAddress: (req.headers['x-forwarded-for'] || '').split(',')[0] || 'Unknown',
          },
        }),
      });
    } catch (e) { console.error('notify failed', e); }

    res.writeHead(302, { Location: target });
    res.end();
  } catch (err) {
    console.error('redirect error', err);
    res.status(500).send('Erreur de redirection');
  }
}
