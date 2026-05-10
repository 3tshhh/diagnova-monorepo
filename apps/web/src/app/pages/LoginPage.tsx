import { useState } from 'react';
import { AuthShell } from '../components/AuthShell';
import { Icon } from '../components/Icon';
import { LangLink, useLangNavigate } from '../hooks/useLang';
import { login } from '../api/auth';
import { useTranslation } from 'react-i18next';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useLangNavigate();
  const [form, setForm] = useState({ email: '', pw: '', keep: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email: form.email, password: form.pw }, form.keep);
      navigate('/app');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.unableToLogin');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow={t('login.shellEyebrow')}
      title={t('login.shellTitle')}
      sub={t('login.shellSub')}
    >
      <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>{t('login.title')}</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 24px' }}>
        {t('login.signupPrompt')} <LangLink to="/signup">{t('common.actions.createAccount')}</LangLink>
      </p>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="field-label">{t('fields.email')}</label>
          <input
            className="input"
            type="email"
            placeholder={t('placeholders.email')}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label className="field-label">{t('fields.password')}</label>
            <LangLink to="/forgot-password" style={{ fontSize: 13 }}>
              {t('login.forgotPassword')}
            </LangLink>
          </div>
          <input
            className="input"
            type="password"
            placeholder={t('placeholders.password')}
            value={form.pw}
            onChange={(e) => setForm({ ...form, pw: e.target.value })}
          />
        </div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            color: 'var(--text-muted)',
            marginTop: 4,
          }}
        >
          <input
            type="checkbox"
            checked={form.keep}
            onChange={(e) => setForm({ ...form, keep: e.target.checked })}
          /> {t('login.keepSignedIn')}
        </label>

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
          {t('common.actions.login')} <Icon name="arrow-right" size={16} />
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '8px 0',
            color: 'var(--text-subtle)',
            fontSize: 12,
          }}
        >
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} /> {t('login.divider')}
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        <button type="button" className="btn btn-outline btn-lg">
          <Icon name="building-2" size={16} /> {t('login.sso')}
        </button>
      </form>
    </AuthShell>
  );
}
