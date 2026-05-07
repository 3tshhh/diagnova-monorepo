import { useState } from 'react';
import { useParams } from 'react-router';
import { AuthShell } from '../components/AuthShell';
import { Icon } from '../components/Icon';
import { LangLink, useLangNavigate } from '../hooks/useLang';
import { resetPassword } from '../api/auth';
import { useTranslation } from 'react-i18next';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useLangNavigate();
  const { tokenId = '' } = useParams();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenId) {
      setError(t('errors.missingResetToken'));
      return;
    }
    if (!form.password) {
      setError(t('errors.passwordRequired'));
      return;
    }
    if (form.password !== form.confirm) {
      setError(t('errors.passwordsDoNotMatch'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await resetPassword(tokenId, form.password);
      setMessage(response.message || t('messages.passwordUpdated'));
      window.setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const text = err instanceof Error ? err.message : t('errors.unableToResetPassword');
      setError(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow={t('password.resetShellEyebrow')}
      title={t('password.resetShellTitle')}
      sub={t('password.resetShellSub')}
    >
      <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
        {t('password.resetTitle')}
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 24px' }}>
        {t('password.resetSub')}
      </p>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="field-label">{t('fields.newPassword')}</label>
          <input
            className="input"
            type="password"
            placeholder={t('placeholders.password')}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">{t('fields.confirmPassword')}</label>
          <input
            className="input"
            type="password"
            placeholder={t('placeholders.password')}
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
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

        {message && (
          <div
            style={{
              fontSize: 13,
              color: '#047857',
              background: 'var(--success-50)',
              padding: '8px 12px',
              borderRadius: 8,
            }}
          >
            {message}
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? t('common.actions.saving') : t('common.actions.savePassword')} {!loading && <Icon name="arrow-right" size={16} />}
        </button>
      </form>

      <div
        style={{
          marginTop: 18,
          padding: 14,
          background: '#FAFCFC',
          border: '1px solid var(--border)',
          borderRadius: 12,
          fontSize: 13,
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}
      >
        {t('password.resetHint')}
      </div>

      <div style={{ marginTop: 24, fontSize: 14 }}>
        <LangLink to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="arrow-left" size={14} /> {t('common.actions.backToLogin')}
        </LangLink>
      </div>
    </AuthShell>
  );
}
