import { Link } from 'react-router';
import { Wordmark } from '../components/Wordmark';

export function NotFoundPage() {
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
      <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 12 }}>Page not found.</div>
      <Link to="/" className="btn btn-outline">
        Go home
      </Link>
    </div>
  );
}
