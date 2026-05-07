import { useState } from 'react';
import { AuthShell } from '../components/AuthShell';
import { Icon } from '../components/Icon';
import { LangLink, useLangNavigate } from '../hooks/useLang';
import { register } from '../api/auth';
import { useTranslation } from 'react-i18next';

export function SignupPage() {
  const { t } = useTranslation();
  const navigate = useLangNavigate();
  const [form, setForm] = useState({ name: '', email: '', pw: '', confirm: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.pw) {
      setErr(t('errors.validationCompleteAllFields'));
      return;
    }
    if (form.pw !== form.confirm) {
      setErr(t('errors.passwordsDoNotMatch'));
      return;
    }

    setErr('');
    setLoading(true);

    try {
      await register({
        fullName: form.name,
        email: form.email,
        password: form.pw,
      });
      navigate('/app/profile');
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.unableToCreateAccount');
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow={t('signup.shellEyebrow')}
      title={t('signup.shellTitle')}
      sub={t('signup.shellSub')}
    >
      <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
        {t('signup.title')}
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 24px' }}>
        {t('signup.loginPrompt')} <LangLink to="/login">{t('common.actions.login')}</LangLink>
      </p>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="field-label">{t('fields.fullName')}</label>
          <input
            className="input"
            placeholder={t('placeholders.fullName')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">{t('fields.workEmail')}</label>
          <input
            className="input"
            type="email"
            placeholder={t('placeholders.email')}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="field-label">{t('fields.password')}</label>
            <input
              className="input"
              type="password"
              placeholder={t('placeholders.password')}
              value={form.pw}
              onChange={(e) => setForm({ ...form, pw: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">{t('fields.confirm')}</label>
            <input
              className="input"
              type="password"
              placeholder={t('placeholders.password')}
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
          </div>
        </div>
        {err && (
          <div
            style={{
              fontSize: 13,
              color: 'var(--danger)',
              background: 'var(--danger-50)',
              padding: '8px 12px',
              borderRadius: 8,
            }}
          >
            {err}
          </div>
        )}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            fontSize: 13,
            color: 'var(--text-muted)',
            marginTop: 4,
          }}
        >
          <input type="checkbox" defaultChecked style={{ marginTop: 2 }} />
          <span>
            {t('signup.agreePrefix')} <a>{t('signup.terms')}</a> {t('signup.agreeSuffix')}
          </span>
        </label>
        <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 6 }} disabled={loading}>
          {t('common.actions.createAccount')} <Icon name="arrow-right" size={16} />
        </button>
      </form>
    </AuthShell>
  );
}
