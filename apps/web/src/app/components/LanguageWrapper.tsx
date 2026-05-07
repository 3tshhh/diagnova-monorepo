import { useEffect } from 'react';
import { Navigate, Outlet, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

const SUPPORTED_LANGS = ['en', 'ar'];

export function LanguageWrapper() {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!lang || !SUPPORTED_LANGS.includes(lang)) return;
    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, i18n]);

  if (!lang || !SUPPORTED_LANGS.includes(lang)) {
    return <Navigate to="/en" replace />;
  }

  return <Outlet />;
}
