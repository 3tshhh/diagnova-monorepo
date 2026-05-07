// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

function detectLangFromUrl(): string {
  const match = window.location.pathname.match(/^\/(en|ar)(\/|$)/);
  return match ? match[1] : 'en';
}

const initialLang = detectLangFromUrl();
document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = initialLang;

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: initialLang,
    fallbackLng: 'en',
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
