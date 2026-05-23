import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './locales/en';

const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: deviceLanguage,
  fallbackLng: 'en',
  supportedLngs: ['en'],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
