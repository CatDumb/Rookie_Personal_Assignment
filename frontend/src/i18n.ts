import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/english.json';
import vi from './locales/vietnamese.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
