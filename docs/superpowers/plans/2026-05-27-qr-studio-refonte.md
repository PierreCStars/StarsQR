# QR Studio — Refonte · Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre le générateur QR Stars (Vite + React + TS) à la charte Star Luxury Group, le rendre trilingue FR/EN/IT, fiabiliser le scan via une redirection serverless, et nettoyer le code (API, config, dossiers).

**Architecture:** On reste sur Vite + React (refonte in-place). Phases indépendantes : design system charte → i18n → écrans (générateur 2 colonnes, analytics) → backend serverless (redirect/scan + consolidation API) → rangement → extension Chrome. Le scan passe d'un flux client (délai 2 s) à une fonction Vercel `/api/r/[code]` qui fait un 302 + tracking.

**Tech Stack:** Vite 4, React 18, TypeScript strict, Tailwind 3, Firebase/Firestore (client SDK), `react-i18next`, `@fontsource/montserrat`, `vitest` (utils purs), Vercel serverless functions, Nodemailer.

**Spec :** `docs/superpowers/specs/2026-05-27-qr-studio-refonte-design.md`

**Branche :** `feat/qr-studio` (déjà créée, WIP préservé)

**Stratégie de test :** TDD via `vitest` pour les utilitaires purs (`utm`, `urlShortener`). Les composants UI, l'accès Firestore et les fonctions serverless sont vérifiés via build TS strict + lint + screenshots navigateur + test live du 302 (l'intégration Firestore en CI est hors périmètre). Commits fréquents après chaque tâche.

**Charte (rappel tokens) :** gold `#D8B11B` / gold-soft `#F6EEC1` · ink `#0A0A0A` · cream `#F5F2EC` / paper `#FBFAF7` · slate `#273341` · line `rgba(10,10,10,.08)` · succès `#1F6E3A` · attention `#F59B42` · erreur `#C92B12`. Montserrat 300–700. Doré en accent seulement.

---

## Phase 0 — Dépendances & socle de test

### Task 0.1 : Installer les dépendances

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Installer les libs runtime + dev**

```bash
cd /Users/mktcomm/QR-generator
npm install @fontsource/montserrat react-i18next i18next i18next-browser-languagedetector
npm install -D vitest
```

- [ ] **Step 2: Ajouter le script de test**

Dans `package.json`, dans `"scripts"`, ajouter après la ligne `"lint"` :

```json
    "test": "vitest run",
    "test:watch": "vitest",
```

- [ ] **Step 3: Vérifier l'install**

Run: `npm run build`
Expected: build OK (aucune régression, on n'a encore rien utilisé).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: deps refonte (montserrat, react-i18next, vitest)"
```

---

## Phase 1 — Design system charte (aucune logique modifiée)

### Task 1.1 : Tokens Tailwind + Montserrat

**Files:**
- Modify: `tailwind.config.js`

- [ ] **Step 1: Remplacer le bloc `theme.extend`**

Remplacer tout le contenu de `tailwind.config.js` par :

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#D8B11B', soft: '#F6EEC1',
          50: '#FBF7E6', 100: '#F6EEC1', 200: '#EDDC83', 300: '#E4CA45',
          400: '#D8B11B', 500: '#B89614', 600: '#937711', 700: '#6E590D',
          800: '#4A3C09', 900: '#251E04',
        },
        ink: { DEFAULT: '#0A0A0A', soft: '#2A2A2A', 900: '#0A0A0A', 800: '#1A1A1A', 700: '#2A2A2A' },
        cream: { DEFAULT: '#F5F2EC', paper: '#FBFAF7', 50: '#FBFAF7', 100: '#F5F2EC', 200: '#EDE7DA' },
        slate: { ardoise: '#273341' },
        success: '#1F6E3A',
        warning: '#F59B42',
        danger: '#C92B12',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(10 10 10 / 0.04), 0 8px 24px -12px rgb(10 10 10 / 0.10)',
        'card-lg': '0 2px 4px 0 rgb(10 10 10 / 0.06), 0 16px 40px -16px rgb(10 10 10 / 0.18)',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Commit** (avec Task 1.2, voir ci-dessous — on commit ensemble le design system de base)

### Task 1.2 : `index.css` — charte de base + classes composant

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Remplacer tout `src/index.css`**

```css
@import '@fontsource/montserrat/300.css';
@import '@fontsource/montserrat/400.css';
@import '@fontsource/montserrat/500.css';
@import '@fontsource/montserrat/600.css';
@import '@fontsource/montserrat/700.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --slg-gold: #D8B11B; --slg-gold-soft: #F6EEC1;
  --slg-ink: #0A0A0A; --slg-cream: #F5F2EC; --slg-paper: #FBFAF7;
  --slg-slate: #273341; --slg-line: rgba(10,10,10,.08);
}

@layer base {
  html { font-family: 'Montserrat', ui-sans-serif, system-ui, sans-serif; }
  body { @apply bg-cream-paper text-ink antialiased; }
  h1,h2,h3,h4,h5,h6 { @apply text-ink; line-height: 1.15; }
  h1 { @apply font-light tracking-tight; }
  h2 { @apply font-medium tracking-tight; }
  button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
    outline: 2px solid var(--slg-gold); outline-offset: 2px;
  }
}

@layer components {
  .eyebrow { @apply text-[11px] font-medium uppercase tracking-[0.28em] text-slate-ardoise; }
  .filet-gold { @apply inline-block h-px w-12 bg-gold align-middle; }

  .btn-primary {
    @apply inline-flex items-center justify-center gap-2 rounded-lg border border-gold bg-gold
           px-6 py-3 text-sm font-semibold uppercase tracking-wider text-ink
           transition hover:bg-gold-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed;
  }
  .btn-secondary {
    @apply inline-flex items-center justify-center gap-2 rounded-lg border border-ink bg-transparent
           px-6 py-3 text-sm font-medium uppercase tracking-wider text-ink
           transition hover:bg-ink hover:text-white focus:outline-none;
  }
  .btn-ghost {
    @apply inline-flex items-center justify-center gap-2 rounded-lg border border-transparent
           px-4 py-2 text-sm text-slate-ardoise transition hover:bg-cream hover:text-ink;
  }
  .btn-danger {
    @apply inline-flex items-center justify-center gap-2 rounded-lg border border-danger bg-danger
           px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:opacity-90;
  }
  .input-field {
    @apply block w-full rounded-lg border border-[color:var(--slg-line)] bg-white px-4 py-3 text-[0.95rem] text-ink
           transition placeholder:text-gray-400 focus:border-gold focus:outline-none
           focus:ring-4 focus:ring-gold/20;
  }
  .card {
    @apply rounded-2xl border border-[color:var(--slg-line)] bg-white p-7 shadow-card;
  }
}
```

- [ ] **Step 2: Vérifier le build**

Run: `npm run build`
Expected: PASS (Tailwind compile les classes, @fontsource résolu).

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.js src/index.css
git commit -m "feat(ui): design system charte Stars (tokens + Montserrat + classes)"
```

### Task 1.3 : Composants UI réutilisables

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Field.tsx`

- [ ] **Step 1: `Button.tsx`**

```tsx
import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
const cls: Record<Variant, string> = {
  primary: 'btn-primary', secondary: 'btn-secondary', ghost: 'btn-ghost', danger: 'btn-danger',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; }

export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  return <button className={`${cls[variant]} ${className}`} {...rest} />;
}
```

- [ ] **Step 2: `Card.tsx`**

```tsx
import { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}
```

- [ ] **Step 3: `Field.tsx`** (label eyebrow + input/select stylés)

```tsx
import { InputHTMLAttributes, ReactNode } from 'react';

export function Label({ children }: { children: ReactNode }) {
  return <label className="eyebrow mb-1.5 block">{children}</label>;
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input-field" {...props} />;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/
git commit -m "feat(ui): composants Button/Card/Field charte"
```

### Task 1.4 : Header + Footer charte

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Footer.tsx`
- Modify: `src/App.tsx` (remplacer header/footer/nav inline par les composants ; garder la logique d'onglets)

> Le `LanguageSwitcher` est ajouté en Phase 2 (Task 2.2). Ici, prévoir un emplacement (`{/* LanguageSwitcher */}`) à droite de la nav.

- [ ] **Step 1: `Header.tsx`** — wordmark Stars + nav onglets + filet doré

```tsx
import { ReactNode } from 'react';

type Tab = 'generator' | 'tracker';

interface Props {
  active: Tab;
  onChange: (t: Tab) => void;
  labels: { generator: string; tracker: string; appName: string };
  rightSlot?: ReactNode; // LanguageSwitcher (Phase 2)
}

export function Header({ active, onChange, labels, rightSlot }: Props) {
  const link = (t: Tab, text: string) =>
    <button onClick={() => onChange(t)}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        active === t ? 'border-gold text-ink' : 'border-transparent text-slate-ardoise hover:border-gold/40 hover:text-ink'
      }`}>{text}</button>;

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex shrink-0 items-center gap-3">
          <img src="/star-logo.png" alt="Stars" className="h-9 w-9" />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-slate-ardoise">Star Luxury Group</span>
            <span className="text-sm font-semibold tracking-wide text-ink">{labels.appName}</span>
          </span>
        </a>
        <nav className="flex items-end gap-1">
          {link('generator', labels.generator)}
          {link('tracker', labels.tracker)}
        </nav>
        <div className="ml-auto">{rightSlot}</div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </header>
  );
}
```

- [ ] **Step 2: `Footer.tsx`**

```tsx
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-black/5 bg-white/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <span className="flex flex-col leading-tight">
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-slate-ardoise">Star Luxury Group</span>
          <span className="text-xs text-slate-ardoise/80">Monaco · 57 Rue Grimaldi</span>
        </span>
        <span className="text-[11px] uppercase tracking-[0.2em] text-slate-ardoise/80">© {year} · Outil interne Stars</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Brancher dans `App.tsx`**

Lire `src/App.tsx` d'abord. Remplacer le `<header>`, le bloc `Navigation Tabs` et le `<footer>` inline par `<Header active={activeTab} onChange={setActiveTab} labels={{...}} />` et `<Footer />`. Conserver toute la logique d'état (qrCodes, handlers, redirect check). Le `<main>` reste mais sur fond `bg-cream-paper`. Les labels sont en dur pour l'instant (français), remplacés en Phase 2.

- [ ] **Step 4: Vérifier**

Run: `npm run dev` puis ouvrir l'aperçu. Vérifier header charte + onglets + filet doré.
Run: `npm run build` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/ src/App.tsx
git commit -m "feat(ui): header + footer charte Stars, branchés dans App"
```

**Checkpoint Phase 1 :** screenshot du header + des deux onglets.

---

## Phase 2 — i18n FR/EN/IT

### Task 2.1 : Init i18n + fichiers de langue

**Files:**
- Create: `src/i18n/index.ts`
- Create: `src/i18n/locales/fr.json`
- Create: `src/i18n/locales/en.json`
- Create: `src/i18n/locales/it.json`
- Modify: `src/main.tsx` (importer l'init i18n)

- [ ] **Step 1: `src/i18n/index.ts`**

```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import fr from './locales/fr.json';
import en from './locales/en.json';
import it from './locales/it.json';

export const SUPPORTED_LOCALES = ['fr', 'en', 'it'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { fr: { translation: fr }, en: { translation: en }, it: { translation: it } },
    fallbackLng: 'fr',
    supportedLngs: SUPPORTED_LOCALES,
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'], lookupLocalStorage: 'qr-studio-lang' },
    interpolation: { escapeValue: false },
  });

export default i18n;
```

- [ ] **Step 2: `fr.json`** (FR primaire — toutes les strings visibles actuelles)

```json
{
  "common": { "appName": "QR Studio", "group": "Star Luxury Group" },
  "nav": { "generator": "Générateur", "tracker": "Analytics" },
  "generator": {
    "title": "Générer un QR code",
    "destination": "Lien de destination",
    "campaign": "Campagne HubSpot",
    "selectCampaign": "— Sélectionner —",
    "source": "Source", "medium": "Support", "term": "Terme", "content": "Contenu",
    "generate": "Générer le QR code",
    "preview": "Aperçu",
    "downloadPng": "PNG", "downloadSvg": "SVG",
    "invalidUrl": "URL invalide"
  },
  "analytics": {
    "title": "Analytics & suivi",
    "totalScans": "Scans totaux", "totalCodes": "QR codes", "recent": "7 derniers jours",
    "scans": "scans", "copy": "Copier", "delete": "Supprimer", "clearAll": "Tout effacer",
    "exportCsv": "Exporter CSV", "empty": "Aucun QR code pour l'instant"
  },
  "footer": { "tagline": "Outil interne Stars" }
}
```

- [ ] **Step 3: `en.json`** (mêmes clés)

```json
{
  "common": { "appName": "QR Studio", "group": "Star Luxury Group" },
  "nav": { "generator": "Generator", "tracker": "Analytics" },
  "generator": {
    "title": "Generate a QR code",
    "destination": "Destination link",
    "campaign": "HubSpot campaign",
    "selectCampaign": "— Select —",
    "source": "Source", "medium": "Medium", "term": "Term", "content": "Content",
    "generate": "Generate QR code",
    "preview": "Preview",
    "downloadPng": "PNG", "downloadSvg": "SVG",
    "invalidUrl": "Invalid URL"
  },
  "analytics": {
    "title": "Analytics & tracking",
    "totalScans": "Total scans", "totalCodes": "QR codes", "recent": "Last 7 days",
    "scans": "scans", "copy": "Copy", "delete": "Delete", "clearAll": "Clear all",
    "exportCsv": "Export CSV", "empty": "No QR codes yet"
  },
  "footer": { "tagline": "Stars internal tool" }
}
```

- [ ] **Step 4: `it.json`** (mêmes clés)

```json
{
  "common": { "appName": "QR Studio", "group": "Star Luxury Group" },
  "nav": { "generator": "Generatore", "tracker": "Analytics" },
  "generator": {
    "title": "Genera un QR code",
    "destination": "Link di destinazione",
    "campaign": "Campagna HubSpot",
    "selectCampaign": "— Seleziona —",
    "source": "Origine", "medium": "Mezzo", "term": "Termine", "content": "Contenuto",
    "generate": "Genera QR code",
    "preview": "Anteprima",
    "downloadPng": "PNG", "downloadSvg": "SVG",
    "invalidUrl": "URL non valido"
  },
  "analytics": {
    "title": "Analytics e monitoraggio",
    "totalScans": "Scansioni totali", "totalCodes": "QR code", "recent": "Ultimi 7 giorni",
    "scans": "scansioni", "copy": "Copia", "delete": "Elimina", "clearAll": "Cancella tutto",
    "exportCsv": "Esporta CSV", "empty": "Ancora nessun QR code"
  },
  "footer": { "tagline": "Strumento interno Stars" }
}
```

- [ ] **Step 5: Importer dans `src/main.tsx`**

Ajouter en haut de `src/main.tsx`, avant le render : `import './i18n';`

- [ ] **Step 6: Vérifier**

Run: `npm run build` → PASS (vérifier `resolveJsonModule` dans tsconfig ; si erreur d'import JSON, ajouter `"resolveJsonModule": true` dans `tsconfig.json`).

- [ ] **Step 7: Commit**

```bash
git add src/i18n/ src/main.tsx tsconfig.json
git commit -m "feat(i18n): init react-i18next + locales FR/EN/IT"
```

### Task 2.2 : LanguageSwitcher + branchement

**Files:**
- Create: `src/components/layout/LanguageSwitcher.tsx`
- Modify: `src/App.tsx` (passer `rightSlot={<LanguageSwitcher />}` au Header ; remplacer les labels en dur par `useTranslation`)

- [ ] **Step 1: `LanguageSwitcher.tsx`**

```tsx
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES } from '../../i18n';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = (i18n.resolvedLanguage || 'fr').slice(0, 2);
  return (
    <div className="flex items-center gap-1 text-xs tracking-wide">
      {SUPPORTED_LOCALES.map((lng) => (
        <button key={lng} onClick={() => i18n.changeLanguage(lng)}
          className={`rounded px-2 py-1 uppercase transition ${
            current === lng ? 'font-semibold text-ink' : 'text-slate-ardoise hover:text-ink'
          }`}>{lng}</button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Brancher dans `App.tsx`**

`import { useTranslation } from 'react-i18next';` ; `const { t } = useTranslation();` ; passer `labels={{ appName: t('common.appName'), generator: t('nav.generator'), tracker: t('nav.tracker') }}` et `rightSlot={<LanguageSwitcher />}`.

- [ ] **Step 3: Vérifier** — dev server : cliquer FR/EN/IT, header se traduit, choix persiste après reload. Screenshot des 3 langues.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/LanguageSwitcher.tsx src/App.tsx
git commit -m "feat(i18n): LanguageSwitcher FR/EN/IT dans le header"
```

---

## Phase 3 — Générateur deux colonnes

### Task 3.1 : Tests utilitaires UTM (TDD)

**Files:**
- Create: `src/utils/utm.test.ts`
- Read: `src/utils/utm.ts` (signatures existantes : `buildUrlWithUTM`, `validateUTMParams`, `formatDate`, `generateQRId`)

- [ ] **Step 1: Écrire le test (lire `utm.ts` d'abord pour les signatures exactes)**

```ts
import { describe, it, expect } from 'vitest';
import { buildUrlWithUTM } from './utm';

describe('buildUrlWithUTM', () => {
  it('ajoute les paramètres UTM à une URL', () => {
    const out = buildUrlWithUTM('https://stars.mc', {
      utm_source: 'Showroom', utm_medium: 'Displays', utm_campaign: 'spring',
    });
    expect(out).toContain('utm_source=Showroom');
    expect(out).toContain('utm_medium=Displays');
    expect(out).toContain('utm_campaign=spring');
  });
});
```

- [ ] **Step 2: Lancer** `npx vitest run src/utils/utm.test.ts` → adapter le test si la signature diffère, puis PASS.

- [ ] **Step 3: Commit**

```bash
git add src/utils/utm.test.ts
git commit -m "test(utm): couverture buildUrlWithUTM"
```

### Task 3.2 : Découper le générateur en 2 colonnes + charte + i18n

**Files:**
- Read: `src/components/QRCodeGenerator.tsx` (composant existant ~280 lignes)
- Create: `src/components/generator/GeneratorPage.tsx`
- Create: `src/components/generator/UrlForm.tsx`
- Create: `src/components/generator/QrPreview.tsx`
- Modify: `src/App.tsx` (rendre `<GeneratorPage .../>` au lieu de `<QRCodeGenerator/>`)
- Delete (en fin de tâche) : `src/components/QRCodeGenerator.tsx`

> **Important :** lire intégralement `QRCodeGenerator.tsx` avant de découper. Conserver TOUTE la logique métier (extraction du titre via `extractPageTitle`, dropdown campagnes HubSpot via `hubspotService`, préremplissage depuis l'extension via `?from_extension=true`, génération PNG/SVG via `qrcode`, sauvegarde via `firebaseService.createQRCode`, callback `onQRCodeGenerated`). On ne change que la structure (3 fichiers) et l'habillage (charte + `t()`).

- [ ] **Step 1: `GeneratorPage.tsx`** — conteneur 2 colonnes, détient l'état du formulaire et du QR généré, orchestre `UrlForm` (gauche) et `QrPreview` (droite).

Structure attendue :

```tsx
// Layout : grille 2 colonnes responsive
<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
  <div className="mb-8"><span className="filet-gold mr-3" /><span className="eyebrow">{t('common.group')}</span>
    <h1 className="mt-3 text-3xl">{t('generator.title')}</h1></div>
  <div className="grid gap-7 lg:grid-cols-[1.15fr_0.85fr]">
    <Card><UrlForm .../></Card>
    <Card><QrPreview .../></Card>
  </div>
</div>
```

- [ ] **Step 2: `UrlForm.tsx`** — champs Destination, Campagne (select HubSpot), Source/Support (grille 2 col), Terme/Contenu, bouton `Button` primary `{t('generator.generate')}`. Utiliser `Label`/`TextInput` de `ui/Field`. Reprendre la logique de chargement des campagnes et d'extraction de titre du composant d'origine.

- [ ] **Step 3: `QrPreview.tsx`** — `{t('generator.preview')}`, image QR (PNG data URL), boutons `Button` secondary PNG/SVG. Reprendre la logique de téléchargement d'origine.

- [ ] **Step 4: Brancher dans `App.tsx`**, supprimer l'ancien `QRCodeGenerator.tsx`, retirer son import.

- [ ] **Step 5: Vérifier** — `npm run build` PASS ; dev server : générer un QR avec UTM, voir l'aperçu live à droite, télécharger PNG. Screenshot.

- [ ] **Step 6: Commit**

```bash
git add src/components/generator/ src/App.tsx
git rm src/components/QRCodeGenerator.tsx
git commit -m "feat(generator): écran 2 colonnes charte + i18n (form / aperçu live)"
```

---

## Phase 4 — Analytics

### Task 4.1 : Dashboard analytics charte (barres horizontales) + i18n + export CSV

**Files:**
- Read: `src/components/QRCodeTracker.tsx`
- Create: `src/components/analytics/AnalyticsPage.tsx`
- Create: `src/components/analytics/ScanBarList.tsx`
- Modify: `src/App.tsx`
- Delete (fin de tâche) : `src/components/QRCodeTracker.tsx`

> Conserver la logique : props `qrCodes`, `onDeleteQRCode`, `onIncrementScan`, `onClearAllQRCodes`, download PNG/SVG, copie d'URL. **Pas de camembert** : barres horizontales (largeur ∝ scanCount / maxScans). Palette sémantique.

- [ ] **Step 1: `ScanBarList.tsx`** — pour chaque QR : nom, URL courte, barre horizontale (`<div>` doré, largeur `${(scan/max)*100}%`), compteur, date, actions (copier / PNG / SVG / supprimer via `Button` ghost/danger).

```tsx
// barre :
<div className="h-2 w-full rounded-full bg-cream-100">
  <div className="h-2 rounded-full bg-gold" style={{ width: `${pct}%` }} />
</div>
```

- [ ] **Step 2: `AnalyticsPage.tsx`** — eyebrow + titre `{t('analytics.title')}`, 3 cartes stats (total scans, total codes, 7 derniers jours), `ScanBarList`, bouton `{t('analytics.exportCsv')}` (génère un CSV `nom,url,scans,date` et déclenche un download Blob), bouton `clearAll`. État vide → `{t('analytics.empty')}`.

- [ ] **Step 3: Brancher dans `App.tsx`**, supprimer `QRCodeTracker.tsx`.

- [ ] **Step 4: Vérifier** — build PASS ; dev server : onglet Analytics, barres affichées, export CSV télécharge. Screenshot.

- [ ] **Step 5: Commit**

```bash
git add src/components/analytics/ src/App.tsx
git rm src/components/QRCodeTracker.tsx
git commit -m "feat(analytics): dashboard charte (barres horizontales) + CSV + i18n"
```

---

## Phase 5 — Backend : redirect serverless + Firestore + consolidation API

### Task 5.1 : Champ `shortCode` + lookup + fin du localStorage (TDD utils)

**Files:**
- Modify: `src/services/firebaseService.ts` (stocker `shortCode` à la création ; ajouter `getQRCodeByShortCode(code)`)
- Modify: `src/utils/urlShortener.ts` (supprimer `saveShortUrl`/`getOriginalUrl` localStorage ; `createShortUrl` retourne `{ shortCode, shortUrl }`)
- Create: `src/utils/urlShortener.test.ts`
- Modify: appelants de `createShortUrl`/`saveShortUrl` (générateur)

- [ ] **Step 1: Test `urlShortener.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { generateShortCode, validateUrl } from './urlShortener';

describe('urlShortener', () => {
  it('génère un code de 6 caractères alphanumériques', () => {
    expect(generateShortCode()).toMatch(/^[A-Za-z0-9]{6}$/);
  });
  it('valide les URLs', () => {
    expect(validateUrl('https://stars.mc')).toBe(true);
    expect(validateUrl('pas-une-url')).toBe(false);
  });
});
```

- [ ] **Step 2:** `npx vitest run src/utils/urlShortener.test.ts` → PASS.

- [ ] **Step 3:** Dans `firebaseService.ts` : `createQRCode` doit persister un champ `shortCode` (le code à 6 car.). Ajouter :

```ts
export const getQRCodeByShortCode = async (shortCode: string): Promise<QRCodeData | null> => {
  const q = query(collection(db, 'qrCodes'), where('shortCode', '==', shortCode));
  const snap = await getDocs(q);
  if (!snap.empty) { const d = snap.docs[0]; return { id: d.id, ...d.data() } as QRCodeData; }
  return null;
};
```

L'appelant (générateur) doit passer `shortCode` dans les données créées. Retirer `saveShortUrl`/`getOriginalUrl` de `urlShortener.ts` et leurs usages.

- [ ] **Step 4:** Nettoyer les `console.log` de debug dans `firebaseService.ts` (garder les `console.error`).

- [ ] **Step 5: Vérifier** `npm run build` PASS, `npm run test` PASS.

- [ ] **Step 6: Commit**

```bash
git add src/services/firebaseService.ts src/utils/urlShortener.ts src/utils/urlShortener.test.ts src/components/generator/
git commit -m "feat(scan): champ shortCode + lookup Firestore, fin du localStorage"
```

### Task 5.2 : Init Firebase serverless partagée

**Files:**
- Create: `api/_lib/firebase.js`

- [ ] **Step 1: `api/_lib/firebase.js`** (factorise l'init répétée dans chaque endpoint, avec nettoyage des env vars)

```js
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const clean = (v) => (v ? String(v).trim().replace(/[\r\n]/g, '') : v);

const config = {
  apiKey: clean(process.env.VITE_FIREBASE_API_KEY),
  authDomain: clean(process.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: clean(process.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: clean(process.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: clean(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: clean(process.env.VITE_FIREBASE_APP_ID),
};

const app = getApps().length ? getApps()[0] : initializeApp(config);
export const db = getFirestore(app);
```

- [ ] **Step 2: Commit** (avec Task 5.3).

### Task 5.3 : Fonction de redirection serverless `/api/r/[code].js`

**Files:**
- Create: `api/r/[code].js`

- [ ] **Step 1: `api/r/[code].js`** — lookup par `shortCode` (fallback `shortUrl`), 302, +1 compteur, log scan, notif email (best-effort).

```js
import { collection, query, where, getDocs, doc, updateDoc, addDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../_lib/firebase.js';

export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');

  try {
    // 1. Lookup par shortCode, fallback sur shortUrl complet (docs legacy)
    let snap = await getDocs(query(collection(db, 'qrCodes'), where('shortCode', '==', code)));
    if (snap.empty) {
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const proto = req.headers['x-forwarded-proto'] || 'https';
      const full = `${proto}://${host}/r/${code}`;
      snap = await getDocs(query(collection(db, 'qrCodes'), where('shortUrl', '==', full)));
    }
    if (snap.empty) return res.status(404).send('QR code introuvable');

    const docSnap = snap.docs[0];
    const data = docSnap.data();
    const target = data.fullUrl || data.originalUrl;

    // 2. Tracking best-effort (ne bloque pas la redirection)
    try {
      await updateDoc(doc(db, 'qrCodes', docSnap.id), { scanCount: increment(1), lastScanned: serverTimestamp(), updatedAt: serverTimestamp() });
      await addDoc(collection(db, 'qrCodeScans'), {
        qrCodeId: docSnap.id,
        userAgent: req.headers['user-agent'] || 'Unknown',
        referrer: req.headers.referer || 'Direct',
        ipAddress: (req.headers['x-forwarded-for'] || '').split(',')[0] || 'Unknown',
        timestamp: serverTimestamp(),
      });
    } catch (e) { console.error('scan tracking failed', e); }

    // 3. Notif email best-effort (réutilise l'endpoint existant)
    try {
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const proto = req.headers['x-forwarded-proto'] || 'https';
      await fetch(`${proto}://${host}/api/send-scan-notification`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeData: { id: docSnap.id, ...data }, scanData: { userAgent: req.headers['user-agent'], referrer: req.headers.referer } }),
      });
    } catch (e) { console.error('notify failed', e); }

    // 4. 302
    res.writeHead(302, { Location: target });
    res.end();
  } catch (err) {
    console.error('redirect error', err);
    res.status(500).send('Erreur de redirection');
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add api/_lib/firebase.js api/r/
git commit -m "feat(scan): redirection serverless /api/r/[code] (302 + tracking + notif)"
```

### Task 5.4 : `vercel.json` unique + routage redirect + suppression configs mortes

**Files:**
- Modify: `vercel.json`
- Delete: `vercel.dev.json`, `vercel.prod.json`

- [ ] **Step 1: Remplacer `vercel.json`**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/r/:code", "destination": "/api/r/:code" }
  ],
  "headers": [
    { "source": "/(.*)", "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
    ] }
  ],
  "functions": {
    "api/r/[code].js": { "maxDuration": 10 },
    "api/track-scan.js": { "maxDuration": 10 },
    "api/save-qr-code.js": { "maxDuration": 10 },
    "api/send-scan-notification.js": { "maxDuration": 10 },
    "api/extract-title.js": { "maxDuration": 10 },
    "api/hubspot-campaigns.js": { "maxDuration": 10 }
  }
}
```

- [ ] **Step 2:** `git rm vercel.dev.json vercel.prod.json`. Vérifier que `package.json` `build:dev`/`build:prod` ne référencent pas les configs supprimées (ils ne font que `vite build --mode` → OK).

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git rm vercel.dev.json vercel.prod.json
git commit -m "chore(config): vercel.json unique, routage /r vers serverless, HSTS"
```

### Task 5.5 : Consolider les endpoints + retirer la route client URLRedirect

**Files:**
- Delete: `api/save-qr-code-simple.js`, `api/save-qr-code-admin.js`, `api/save-qr-code-working.js`, `api/save-qr-code-public.js`, `api/save-qr-code-chrome.js`, `api/save-qr-code-extension.js`, `api/hubspot-debug.js`
- Modify: `api/save-qr-code.js` (utiliser `api/_lib/firebase.js`)
- Modify: `src/App.tsx` (retirer le bloc `redirectMatch` + l'import `URLRedirect`)
- Delete: `src/components/URLRedirect.tsx`

> Avant suppression, confirmer qu'aucune des variantes n'est référencée ailleurs : `grep -rn "save-qr-code-" src api extension`. L'extension sera repointée vers `save-qr-code.js` en Phase 7.

- [ ] **Step 1:** `api/save-qr-code.js` : remplacer l'init Firebase locale par `import { db } from './_lib/firebase.js';`. Garder la signature de requête (`url, filename, format, utmParams`).

- [ ] **Step 2:** Supprimer les 6 variantes + `hubspot-debug.js`.

- [ ] **Step 3:** Dans `App.tsx`, supprimer les lignes 16-23 (le `redirectMatch` + `return <URLRedirect/>`) et l'import ligne 6. Le `/r/:code` est désormais traité 100 % serverless.

- [ ] **Step 4:** `git rm src/components/URLRedirect.tsx`.

- [ ] **Step 5: Vérifier** `npm run build` PASS, `grep -rn "URLRedirect\|save-qr-code-" src api` → aucun résultat.

- [ ] **Step 6: Commit**

```bash
git add api/save-qr-code.js src/App.tsx
git rm api/save-qr-code-simple.js api/save-qr-code-admin.js api/save-qr-code-working.js api/save-qr-code-public.js api/save-qr-code-chrome.js api/save-qr-code-extension.js api/hubspot-debug.js src/components/URLRedirect.tsx
git commit -m "refactor(api): un seul save-qr-code, redirect 100% serverless, suppression variantes mortes"
```

---

## Phase 6 — Rangement

### Task 6.1 : Archiver les pages de test, retirer le bruit

**Files:**
- Move: `test-*.html`, `firebase-test.html` (racine) → `sandbox/`
- Move: `extension/chrome-extension/test-*.html` → `sandbox/extension/`
- Modify: divers (`console.log` de debug résiduels)

- [ ] **Step 1:** Créer `sandbox/` et déplacer les fichiers de test HTML :

```bash
mkdir -p sandbox/extension
git mv firebase-test.html test-email.html test-firestore.html test-hubspot-api.html test-hubspot-simple.html test-qr-tracking.html test-scan-analytics.html sandbox/ 2>/dev/null || true
git mv extension/chrome-extension/test-*.html sandbox/extension/ 2>/dev/null || true
```

(Adapter à la liste réelle via `ls test-*.html`.)

- [ ] **Step 2:** `grep -rn "console.log" src/` → retirer les logs de debug restants (garder `console.error`).

- [ ] **Step 3: Vérifier** `npm run build` PASS.

- [ ] **Step 4: Commit**

```bash
git add -A sandbox/ src/
git commit -m "chore: archiver les pages de test dans sandbox/, retirer logs de debug"
```

> Note : `git add -A` est ici limité à `sandbox/` et `src/` (chemins explicites), pas le repo entier.

---

## Phase 7 — Extension Chrome

### Task 7.1 : Consolider la source + restyler le popup

**Files:**
- Read/inventaire d'abord : `find extension -maxdepth 3 -type d` et comparer `extension/chrome-extension/` vs `extension/dist/` vs `extension/chrome-extension/build/`
- Modify: `extension/chrome-extension/popup/popup.html` + `popup.css` (charte)
- Modify: pointeur API du popup/background vers `/api/save-qr-code`
- Delete: copies redondantes (build/dist dupliqués) après confirmation

> **Prudence :** déterminer LA source canonique (celle chargée par Chrome via `manifest.json`) avant toute suppression. Ne supprimer que les copies générées/dupliquées.

- [ ] **Step 1:** Inventaire : localiser le `manifest.json` actif, identifier les dossiers réellement chargés. Documenter la source canonique.

- [ ] **Step 2:** Restyler `popup.css` à la charte : Montserrat, fond `#FBFAF7`, doré `#D8B11B` en accent sur le bouton principal, ink/slate pour le texte. Pas de gradient.

- [ ] **Step 3:** Vérifier l'endpoint appelé : pointer vers `/api/save-qr-code` (consolidé). Mettre à jour l'URL de base si nécessaire.

- [ ] **Step 4:** Supprimer les copies redondantes confirmées.

- [ ] **Step 5: Vérifier** : charger l'extension décompressée dans Chrome (`chrome://extensions`), ouvrir le popup → style charte, générer un QR → sauvegarde OK (appel `/api/save-qr-code`). Screenshot du popup.

- [ ] **Step 6: Commit**

```bash
git add extension/
git commit -m "feat(extension): consolidation source + popup à la charte Stars"
```

---

## Phase 8 — Vérification finale, revue & déploiement preview

### Task 8.1 : Vérification globale

- [ ] **Step 1:** `npm run build` → PASS (TS strict).
- [ ] **Step 2:** `npm run lint` → 0 warning.
- [ ] **Step 3:** `npm run test` → PASS.
- [ ] **Step 4:** Dev server : screenshots générateur (2 col), analytics, switcher FR/EN/IT.
- [ ] **Step 5:** Test live du 302 (après déploiement preview) : `curl -sI https://<preview>/r/<codeRéel>` → `HTTP/2 302` + `location:` correct ; vérifier l'incrément du compteur dans l'analytics.

### Task 8.2 : Revue de code

- [ ] **Step 1:** Invoquer `superpowers:requesting-code-review` sur le diff complet de `feat/qr-studio` (catch bugs, dead code, strings non traduites, inline styles dupliquant Tailwind).
- [ ] **Step 2:** Traiter les retours via `superpowers:receiving-code-review`.

### Task 8.3 : Déploiement preview Vercel

- [ ] **Step 1:** Vérifier l'absence de fichier sensible non gitignoré (`.env.backup*`, `*.pem`, `*.key`).
- [ ] **Step 2:** `vercel deploy --yes` (PREVIEW, pas `--prod`).
- [ ] **Step 3:** Donner l'URL de preview à Pierre pour validation. **Ne pas déployer en prod sans son accord.**

---

## Self-review (couverture de la spec)

- Charte (Montserrat, tokens, doré accent) → Phase 1 ✓
- Layout 2 colonnes (Option A) → Task 3.2 ✓
- i18n FR/EN/IT + switcher → Phase 2 ✓
- Redirect/scan serverless (302) → Task 5.3 ✓
- Consolidation 7 `save-qr-code*` → 1 → Task 5.5 ✓
- `api/r/[code]` + suppression route client → Task 5.3 / 5.5 ✓
- localStorage → Firestore → Task 5.1 ✓
- `vercel.json` unique → Task 5.4 ✓
- test-*.html archivés → Task 6.1 ✓
- Analytics barres horizontales + CSV → Task 4.1 ✓
- Extension consolidée + charte → Task 7.1 ✓
- Vérif build/lint/screenshots + preview → Phase 8 ✓
- Init Firebase factorisée → Task 5.2 ✓
