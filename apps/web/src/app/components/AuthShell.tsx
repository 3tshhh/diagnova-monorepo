import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Wordmark } from './Wordmark';
import { LanguageSwitcher } from './LanguageSwitcher';

type AuthShellProps = {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  sub?: string;
  footer?: ReactNode;
};

export function AuthShell({ children, eyebrow, title, sub, footer }: AuthShellProps) {
  const { t } = useTranslation();

  return (
    <div className="auth-shell">
      <div className="auth-side">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Wordmark light size="lg" />
        </div>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 460 }}>
          <div className="eyebrow" style={{ color: '#5EEAD4' }}>
            {eyebrow || t('authShell.defaultEyebrow')}
          </div>
          <h1
            style={{
              fontSize: 'clamp(32px, 4vw, 44px)',
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: '-0.025em',
              margin: '14px 0 16px',
              color: '#fff',
            }}
          >
            {title || t('authShell.defaultTitle')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 16, lineHeight: 1.55, margin: 0 }}>
            {sub || t('authShell.defaultSub')}
          </p>
        </div>
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            color: 'rgba(255,255,255,0.6)',
            fontSize: 12,
          }}
          className="mono"
        >
          <span>{t('authShell.version')}</span>
          <span style={{ width: 4, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 999 }} />
          <span>{t('authShell.compliance')}</span>
          <span style={{ width: 4, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 999 }} />
          <span>{t('authShell.preview')}</span>
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.08,
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>
      <div className="auth-form-wrap" style={{ position: 'relative' }}>
        <LanguageSwitcher variant="auth" />
        <div className="auth-form fade-up">
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 28 }} className="lg:hidden">
            <Wordmark size="md" />
          </div>
          {children}
          {footer && <div style={{ marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>{footer}</div>}
        </div>
      </div>
    </div>
  );
}
