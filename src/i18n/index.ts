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
