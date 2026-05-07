import { useState } from 'react';
import { AuthShell } from '../components/AuthShell';
import { Icon } from '../components/Icon';
import { LangLink } from '../hooks/useLang';
import { requestPasswordReset } from '../api/auth';
import { useTranslation } from 'react-i18next';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  return (
    <AuthShell
      eyebrow={t('password.forgotShellEyebrow')}
      title={t('password.forgotShellTitle')}
      sub={t('password.forgotShellSub')}
    >
      {!sent ? (
        <>
          <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            {t('password.forgotTitle')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 24px' }}>
            {t('password.forgotSub')}
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError('');

              try {
                const response = await requestPasswordReset(email);
                setMessage(response.message);
                setSent(true);
              } catch (err) {
                const text = err instanceof Error ? err.message : t('errors.unableToSendResetLink');
                setError(text);
              } finally {
                setLoading(false);
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div>
              <label className="field-label">{t('fields.email')}</label>
              <input
                className="input"
                type="email"
                placeholder={t('placeholders.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && (
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--danger)',
                  background: 'var(--danger-50)',
                  padding: '8px 12px',
                  borderRadius: 8,
                }}
              >
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 6 }} disabled={loading}>
              {t('common.actions.sendResetLink')} <Icon name="send" size={16} />
            </button>
          </form>
          <div style={{ marginTop: 24, fontSize: 14 }}>
            <LangLink to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="arrow-left" size={14} /> {t('common.actions.backToLogin')}
            </LangLink>
          </div>
        </>
      ) : (
        <div className="fade-up">
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'var(--success-50)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #A7F3D0',
              marginBottom: 20,
            }}
          >
            <Icon name="mail-check" size={28} color="#047857" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            {t('password.checkEmailTitle')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.55, margin: 0 }}>
            {message || t('messages.resetInstructionsSent')} to{' '}
            <b style={{ color: 'var(--text)' }} className="mono">
              {email || t('password.inboxFallback')}
            </b>
            . {t('password.linkExpiry')}
          </p>
          <div
            style={{
              marginTop: 24,
              padding: 16,
              background: '#FAFCFC',
              border: '1px solid var(--border)',
              borderRadius: 12,
              fontSize: 13,
              color: 'var(--text-muted)',
            }}
          >
            {t('password.retryPrompt')}{' '}
            <a onClick={() => setSent(false)} style={{ cursor: 'pointer' }}>
              {t('password.tryDifferentEmail')}
            </a>
            .
          </div>
          <div style={{ marginTop: 24 }}>
            <LangLink to="/login" className="btn btn-outline">
              <Icon name="arrow-left" size={14} /> {t('common.actions.backToLogin')}
            </LangLink>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
