import { db, FieldValue } from '../_lib/firebase.js';

// Branded "QR code not found" page (Stars charte). Returned when no Firestore
// record matches the scanned code. Keeps the user oriented rather than dumping
// them on a blank text response.
const notFoundPage = (code) => `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>QR code introuvable · Stars</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;500;600&display=swap" rel="stylesheet">
<style>
  :root{--gold:#D8B11B;--ink:#0A0A0A;--paper:#FBFAF7;--slate:#273341;--line:rgba(10,10,10,.08)}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{min-height:100%;font-family:'Montserrat',ui-sans-serif,system-ui,sans-serif;background:var(--paper);color:var(--ink);-webkit-font-smoothing:antialiased}
  main{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 24px}
  .card{max-width:520px;width:100%;background:#fff;border:1px solid var(--line);border-radius:18px;padding:40px 32px;box-shadow:0 1px 2px rgba(10,10,10,.04),0 16px 40px -18px rgba(10,10,10,.18);text-align:center}
  .filet{display:inline-block;width:48px;height:1px;background:var(--gold);margin-right:14px;vertical-align:middle}
  .eyebrow{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.28em;color:var(--slate);vertical-align:middle}
  h1{font-weight:300;font-size:30px;letter-spacing:-.01em;margin:18px 0 10px}
  p{color:#2A2A2A;font-weight:400;font-size:15px;line-height:1.5;margin-bottom:8px}
  .code{display:inline-block;margin-top:12px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--slate)}
  .actions{margin-top:28px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
  a.btn{display:inline-flex;align-items:center;justify-content:center;padding:14px 28px;border-radius:8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;text-decoration:none;transition:background .2s,color .2s,box-shadow .2s}
  .btn-primary{background:var(--gold);color:var(--ink);border:1px solid var(--gold)}
  .btn-primary:hover{background:#C49E15;box-shadow:0 0 0 4px rgba(216,177,27,.18)}
  .btn-secondary{background:transparent;color:var(--ink);border:1px solid var(--ink);font-weight:500}
  .btn-secondary:hover{background:var(--ink);color:#fff}
</style></head>
<body><main><div class="card">
  <div><span class="filet"></span><span class="eyebrow">Star Luxury Group</span></div>
  <h1>QR code introuvable</h1>
  <p>Ce code n'est plus reconnu — il a peut-être été supprimé ou pointe vers un déploiement obsolète.</p>
  <p>Reviens sur le site Stars pour retrouver l'offre que tu cherchais.</p>
  <div class="code">Référence&nbsp;: ${String(code).replace(/[^A-Za-z0-9_-]/g,'').slice(0,32)}</div>
  <div class="actions">
    <a class="btn btn-primary" href="https://stars.mc">stars.mc</a>
    <a class="btn btn-secondary" href="https://www.stars.mc/voitures/">Voir les voitures</a>
  </div>
</div></main></body></html>`;

const sendNotFound = (res, code) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(404).send(notFoundPage(code));
};

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
    if (snap.empty) return sendNotFound(res, code);

    const docSnap = snap.docs[0];
    const data = docSnap.data();
    const target = data.fullUrl || data.originalUrl;
    if (!target) return sendNotFound(res, code);

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
