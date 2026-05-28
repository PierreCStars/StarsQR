import { db } from './_lib/firebase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const snap = await db.collection('qrCodes').get();
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    return res.status(200).json({ success: true, deleted: snap.size });
  } catch (err) {
    console.error('qr-codes-clear error', err);
    return res.status(500).json({ error: err.message });
  }
}
