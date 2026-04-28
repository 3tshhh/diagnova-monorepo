import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AuthShell } from '../components/AuthShell';
import { Icon } from '../components/Icon';
import { login } from '../api/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', pw: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({
        email: form.email,
        password: form.pw,
      });
      navigate('/app');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to login';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Pick up where you left off."
      sub="Your case list and reading history sync across devices."
    >
      <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Login</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 24px' }}>
        New to Diagnova? <Link to="/signup">Create an account</Link>
      </p>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="field-label">Email</label>
          <input
            className="input"
            type="email"
            placeholder="jane@hospital.org"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label className="field-label">Password</label>
            <Link to="/forgot-password" style={{ fontSize: 13 }}>
              Forgot password?
            </Link>
          </div>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
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
          <input type="checkbox" /> Keep me signed in on this device
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
          Login <Icon name="arrow-right" size={16} />
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
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} /> OR
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        <button type="button" className="btn btn-outline btn-lg">
          <Icon name="building-2" size={16} /> Continue with hospital SSO
        </button>
      </form>
    </AuthShell>
  );
}
