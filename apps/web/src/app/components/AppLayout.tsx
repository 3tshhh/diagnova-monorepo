import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { Wordmark } from './Wordmark';
import { Icon, type IconName } from './Icon';
import { getProfile } from '../api/profile';
import { logout } from '../api/auth';
import type { PatientProfile } from '../api/types';

type NavItem = {
  to: string;
  label: string;
  icon: IconName;
};

const NAV_ITEMS: NavItem[] = [
  { to: '/app', label: 'Home', icon: 'layout-dashboard' },
  { to: '/app/upload', label: 'Upload Scan', icon: 'upload-cloud' },
  { to: '/app/history', label: 'Scan History', icon: 'history' },
  { to: '/app/profile', label: 'Profile', icon: 'user' },
  { to: '/app/about', label: 'About', icon: 'info' },
];

function getInitials(profile: PatientProfile | null): string {
  const source = (profile?.fullName || profile?.email || 'Diagnova').trim();
  return source
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
}

export function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const [profile, setProfile] = useState<PatientProfile | null>(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch {
        // Auth guard in pages will handle redirect flows.
      }
    };

    void loadProfile();
  }, []);

  const initials = useMemo(() => getInitials(profile), [profile]);
  const displayName = profile?.fullName || 'Diagnova user';
  const displayMeta = profile?.email || 'Signed in';

  const isActive = (to: string) => (to === '/app' ? pathname === '/app' : pathname.startsWith(to));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebar = (
    <aside
      style={{
        width: 264,
        flexShrink: 0,
        background: 'linear-gradient(180deg, var(--primary-900) 0%, var(--primary) 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 50,
        transform: isMobile && !mobileOpen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.25s ease',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ padding: '4px 12px 24px' }}>
        <Wordmark light size="md" />
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            padding: '8px 12px 6px',
          }}
          className="mono"
        >
          Workspace
        </div>
        {NAV_ITEMS.map((item) => (
          <Link key={item.to} to={item.to} className={'sb-link' + (isActive(item.to) ? ' active' : '')}>
            <Icon name={item.icon} size={17} color="currentColor" />
            <span>{item.label}</span>
            {isActive(item.to) && (
              <Icon name="chevron-right" size={14} color="currentColor" style={{ marginLeft: 'auto', opacity: 0.6 }} />
            )}
          </Link>
        ))}
      </nav>

      <div
        style={{
          margin: '16px 4px 12px',
          padding: 14,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {profile?.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={displayName}
              style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(94, 234, 212, 0.2)',
                color: '#5EEAD4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {initials}
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {displayName}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }} className="mono">
              {displayMeta}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void handleLogout()}
        className="sb-link"
        style={{ color: 'rgba(255,255,255,0.7)', background: 'transparent', textAlign: 'left' }}
      >
        <Icon name="log-out" size={17} color="currentColor" />
        <span>Logout</span>
      </button>
    </aside>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {sidebar}
      {isMobile && mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              background: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
              position: 'sticky',
              top: 0,
              zIndex: 30,
            }}
          >
            <button onClick={() => setMobileOpen(true)} className="btn btn-ghost btn-sm" aria-label="Open menu">
              <Icon name="menu" size={20} />
            </button>
            <Wordmark size="sm" />
            <div style={{ width: 36 }} />
          </div>
        )}

        <main style={{ flex: 1, padding: isMobile ? '24px 20px 48px' : '36px 48px 64px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
