import { Link } from 'react-router';
import { Wordmark } from '../components/Wordmark';
import { APP_COPY } from '../constants/copy';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { t } = useTranslation(); 
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
        background: 'var(--bg)',
      }}
    >
      <Wordmark size="md" />
      <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 12 }}>{t('notFound.message')}</div>
      <Link to="/" className="btn btn-outline">
        {t('common.actions.goHome')}
      </Link>
    </div>
  );
} 
