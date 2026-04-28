import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AuthShell } from '../components/AuthShell';
import { Icon } from '../components/Icon';
import { register } from '../api/auth';

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', pw: '', confirm: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.pw) {
      setErr('Please complete all fields.');
      return;
    }
    if (form.pw !== form.confirm) {
      setErr('Passwords do not match.');
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
      navigate('/app');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create account';
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title="Start reading scans with AI assist."
      sub="Set up your Diagnova workspace. Free during research preview."
    >
      <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
        Create your account
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 24px' }}>
        Already have one? <Link to="/login">Login</Link>
      </p>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="field-label">Full name</label>
          <input
            className="input"
            placeholder="Dr. Jane Patel"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Work email</label>
          <input
            className="input"
            type="email"
            placeholder="jane@hospital.org"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="field-label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.pw}
              onChange={(e) => setForm({ ...form, pw: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Confirm</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
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
            I agree to the <a>Terms of Service</a> and acknowledge Diagnova is a research tool, not a substitute for clinical judgment.
          </span>
        </label>
        <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 6 }} disabled={loading}>
          Create account <Icon name="arrow-right" size={16} />
        </button>
      </form>
    </AuthShell>
  );
}
