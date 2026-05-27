# QR Studio — Refonte (charte Stars + i18n + nettoyage)

**Date** : 2026-05-27
**Projet** : QR-generator (`PierreCStars/StarsQR`) — branche `feat/qr-studio`
**Auteur** : Pierre + Claude

## Contexte & objectif

Le générateur de QR codes Stars (Vite + React + TS + Tailwind, API serverless
Vercel, Firebase/Firestore, HubSpot, + extension Chrome) fonctionne et est
déployé (`qr-generator` sur Vercel), mais : interface générique (bleu, polices
système), code accumulé (7 variantes `save-qr-code*.js`, dossiers d'extension
dupliqués, 3 configs Vercel, ~13 `test-*.html` à la racine), pas d'i18n, et un
flux de redirection/scan client fragile.

**But** : nettoyer et fiabiliser le code, et refaire l'interface à la **charte
Star Luxury Group**, au niveau de Stars Vacation Management — **sans changer de
framework** (on reste Vite + React, refonte in-place).

## Décisions cadrées

| Sujet | Décision |
|---|---|
| Framework | **Vite + React** conservé (refonte in-place, pas de migration Next.js) |
| Layout générateur | **Deux colonnes** : formulaire à gauche, aperçu QR live à droite (Option A validée) |
| i18n | **Trilingue FR/EN/IT** via `react-i18next`, **FR primaire**, switcher dans le header |
| Périmètre | **App web + extension Chrome** |
| Scan analytics | **Gardé et finalisé proprement** |
| Redirect/scan | **Côté serverless** (`/api/r/[code]` → 302), abandon du flux client à délai 2 s |
| Fichiers de test HTML | **Archivés dans `sandbox/`** (hors build) |

## Charte Stars (référence : Vacation Management)

- **Police** : Montserrat 300–700 via `@fontsource/montserrat` (pas de CDN bloquant).
- **Tokens** (Tailwind `theme.extend.colors` + CSS vars) repris de Vacation Management :
  - `gold #D8B11B` (+ soft `#F6EEC1`), `ink #0A0A0A`, `cream #F5F2EC` (+ paper `#FBFAF7`), `slate #273341`, `line rgba(10,10,10,.08)`.
  - Sémantiques : succès `#1F6E3A`, attention `#F59B42`, erreur `#C92B12`, neutre `#9CA3AF`.
- **Principes** : beaucoup de blanc, doré en **accent uniquement**, pas de gradient
  générique, pas de camembert, pas d'emoji graphique, pas de motif étoile filante.
- **Typo** : titres 300–500 `tracking-tight` ; eyebrows/labels uppercase `tracking-widest` ; body 400–500.
- **Classes composant** (dans `index.css`, `@layer components`) : `.btn-primary` (doré),
  `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.input-field` (focus doré),
  `.card`, `.eyebrow`, `.filet-gold`.

## Architecture cible

### Frontend (`src/`)
- **Header** : `components/layout/Header.tsx` — wordmark Stars (logo + « STAR LUXURY GROUP » eyebrow + « QR Studio »), nav Générateur/Analytics (indicateur doré), `LanguageSwitcher` (FR/EN/IT) à droite, filet doré sous le header.
- **Footer** : `components/layout/Footer.tsx` — SLG Monaco · 57 Rue Grimaldi.
- **Générateur** (deux colonnes), découpé :
  - `components/generator/GeneratorPage.tsx` (orchestration + état)
  - `components/generator/UrlForm.tsx` (destination, campagne HubSpot, UTM)
  - `components/generator/QrPreview.tsx` (aperçu live + téléchargement PNG/SVG)
- **Analytics** : `components/analytics/AnalyticsPage.tsx` + `ScanBarList.tsx` (barres horizontales, pas de camembert), stats globales en cartes.
- **Commun UI** : `components/ui/` (Button, Card, Input, Select, Badge) alignés charte.
- Constantes nommées (`src/constants.ts` : défauts UTM, longueur du code court, délais), suppression des `console.log`.

### i18n
- `src/i18n/index.ts` (init `react-i18next` + `i18next-browser-languagedetector`).
- `src/i18n/locales/{fr,en,it}.json` — créés **ensemble** à chaque string. FR primaire.
- `LanguageSwitcher` : FR/EN/IT, langue active mise en évidence, choix persisté (localStorage).

### API (`api/`) — consolidation
- **Garder** : `track-scan.js`, `send-scan-notification.js`, `extract-title.js`, `hubspot-campaigns.js`.
- **Fusionner** : les 7 `save-qr-code*.js` → **un seul** `save-qr-code.js` (choix client/admin SDK par env).
- **Nouveau** : `api/r/[code].js` — résout le code court (Firestore), **302** vers l'URL finale + UTM, incrémente le compteur, log le scan (UA, referrer, horodatage), déclenche la notif email.
- **Supprimer** : `save-qr-code-{simple,admin,working,public,chrome,extension}.js`, `hubspot-debug.js`.
- **Factoriser** : init Firebase Admin partagée (`api/_lib/firebaseAdmin.js`).

### Stockage
- Mapping short-URL **100 % Firestore** (abandon de `localStorage` qui est par-appareil).

### Config & rangement
- `vercel.json` / `.dev` / `.prod` → **un seul** `vercel.json`.
- `test-*.html` (racine + extension) → `sandbox/` (hors build).

### Extension Chrome
- **Une seule source** : supprimer les copies redondantes (`build/`, `dist/`, structures dupliquées).
- Popup restylé à la charte (Montserrat, doré accent).
- Pointe vers l'endpoint `save-qr-code` consolidé.

## Flux scan (cible)

1. L'utilisateur scanne → ouvre `https://<domaine>/r/<code>`.
2. `api/r/[code].js` lit le doc Firestore par code court.
3. Incrémente `scanCount`, écrit un doc `scans/` (UA, referrer, ts), déclenche la notif email.
4. Répond **302** vers `originalUrl` + paramètres UTM. Pas de JS client, pas de délai.

## Dashboard Analytics

- Cartes : total scans, total codes, scans 7 j.
- Liste par code : nom, URL, **barre horizontale** de scans, date, actions (copier, télécharger PNG/SVG, supprimer).
- Export **CSV** des scans.

## Vérification (« fini » = prouvé)

- `npm run build` (tsc strict) OK, `npm run lint` **0 warning**.
- Dev server + screenshots : générateur (2 colonnes), analytics, switcher dans les 3 langues.
- `/api/r/<code>` répond bien en **302** vers la bonne URL et incrémente le compteur (test sur un code réel de staging).
- Déploiement **preview Vercel d'abord** (validation Pierre) **puis** prod.

## Hors périmètre

- Migration Next.js.
- Refonte du modèle de données Firestore au-delà du nécessaire pour le scan serverless.
- Nouvelles fonctionnalités produit (au-delà de finaliser le scan analytics existant).
