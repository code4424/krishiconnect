import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import kn from './kn.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      kn: { translation: kn }
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'kn'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'krishi-lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    pluralSeparator: '_',
  });

// Handle number and currency formatting within i18n if needed, 
// but we'll primarily use our custom formatters.ts for more control.

export default i18n;
