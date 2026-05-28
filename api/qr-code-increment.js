import { db, FieldValue } from './_lib/firebase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id is required' });

    await db.collection('qrCodes').doc(id).update({
      scanCount: FieldValue.increment(1),
      lastScanned: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('qr-code-increment error', err);
    return res.status(500).json({ error: err.message });
  }
}
