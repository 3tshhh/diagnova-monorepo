import { useState } from 'react';
import { Link } from 'react-router';
import { AuthShell } from '../components/AuthShell';
import { Icon } from '../components/Icon';
import { requestPasswordReset } from '../api/auth';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Back into your workspace, fast."
      sub="We'll email a secure link valid for 30 minutes."
    >
      {!sent ? (
        <>
          <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            Forgot password
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 24px' }}>
            Enter the email tied to your account and we'll send reset instructions.
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
                const text = err instanceof Error ? err.message : 'Unable to send reset link';
                setError(text);
              } finally {
                setLoading(false);
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div>
              <label className="field-label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="jane@hospital.org"
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
              Send reset link <Icon name="send" size={16} />
            </button>
          </form>
          <div style={{ marginTop: 24, fontSize: 14 }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="arrow-left" size={14} /> Back to login
            </Link>
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
            Check your email
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.55, margin: 0 }}>
            {message || 'We sent reset instructions'} to{' '}
            <b style={{ color: 'var(--text)' }} className="mono">
              {email || 'your inbox'}
            </b>
            . The link expires in 30 minutes.
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
            Didn't get it? Check spam, or{' '}
            <a onClick={() => setSent(false)} style={{ cursor: 'pointer' }}>
              try a different email
            </a>
            .
          </div>
          <div style={{ marginTop: 24 }}>
            <Link to="/login" className="btn btn-outline">
              <Icon name="arrow-left" size={14} /> Back to login
            </Link>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
