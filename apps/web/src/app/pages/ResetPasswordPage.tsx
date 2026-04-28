import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { AuthShell } from '../components/AuthShell';
import { Icon } from '../components/Icon';
import { resetPassword } from '../api/auth';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { tokenId = '' } = useParams();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenId) {
      setError('Reset token is missing.');
      return;
    }
    if (!form.password) {
      setError('Please enter a new password.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await resetPassword(tokenId, form.password);
      setMessage(response.message || 'Password updated successfully.');
      window.setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Unable to reset password';
      setError(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="New password"
      title="Set a fresh password for your workspace."
      sub="Use at least 8 characters to complete your reset."
    >
      <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
        Reset password
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 24px' }}>
        Choose a new password, then sign in again.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="field-label">New password</label>
          <input
            className="input"
            type="password"
            placeholder="........"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Confirm password</label>
          <input
            className="input"
            type="password"
            placeholder="........"
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
          {loading ? 'Saving...' : 'Save password'} {!loading && <Icon name="arrow-right" size={16} />}
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
        Choose something unique to this account. Once updated, your old reset link will no longer work.
      </div>

      <div style={{ marginTop: 24, fontSize: 14 }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="arrow-left" size={14} /> Back to login
        </Link>
      </div>
    </AuthShell>
  );
}
