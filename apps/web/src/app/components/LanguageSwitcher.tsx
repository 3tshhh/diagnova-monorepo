import { useLocation, useNavigate, useParams } from 'react-router';

type Props = { variant: 'sidebar' | 'auth' };

export function LanguageSwitcher({ variant }: Props) {
  const { lang = 'en' } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const toggle = () => {
    const next = lang === 'en' ? 'ar' : 'en';
    const newPath = `/${next}${pathname.slice(lang.length + 1)}`;
    navigate(newPath);
  };

  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={toggle}
        className="sb-link"
        style={{ color: 'rgba(255,255,255,0.7)', background: 'transparent', textAlign: 'left' }}
      >
        <span
          style={{
            width: 17,
            height: 17,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.04em',
            border: '1.5px solid rgba(255,255,255,0.4)',
            borderRadius: 4,
            flexShrink: 0,
          }}
        >
          {lang === 'en' ? 'AR' : 'EN'}
        </span>
        <span>{lang === 'en' ? 'العربية' : 'English'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '5px 12px',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        color: 'var(--text-muted)',
        letterSpacing: '0.06em',
        zIndex: 10,
      }}
    >
      {lang === 'en' ? 'AR / عربي' : 'EN / English'}
    </button>
  );
}
