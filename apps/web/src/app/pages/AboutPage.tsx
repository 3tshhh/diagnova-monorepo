import { PageHeader } from '../components/PageHeader';
import { Icon, type IconName } from '../components/Icon';
import { useTranslation } from 'react-i18next';
import { teamMembers } from '../constants/team';

type Model = {
  name: string;
  sub: string;
  icon: IconName;
  body: string;
  tags: string[];
};

type TranslatedModel = Omit<Model, 'icon'>;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
const linkedInPage = 'https://www.linkedin.com/in/';
const TEAM = teamMembers.map((m) => ({
  ...m,
  linkedin: `${linkedInPage}${m.LNusername}`,
  photo: `${API_BASE_URL}/team/avatar/${encodeURIComponent(m.LNusername)}`,
}));

export function AboutPage() {
  const { t } = useTranslation();
  const modelIcons: IconName[] = ['wind', 'bone'];
  const rawModels = t('about.models', { returnObjects: true });
  const models = (Array.isArray(rawModels) ? (rawModels as TranslatedModel[]) : []).map((model, index) => ({
    ...model,
    icon: modelIcons[index] ?? 'wind',
    tags: [...model.tags],
  }));

  return (
    <div className="fade-up">
      <PageHeader
        eyebrow={t('about.eyebrow')}
        title={t('about.title')}
      />

      <div
        className="card"
        style={{
          padding: 40,
          marginBottom: 24,
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-700) 100%)',
          color: '#fff',
          border: 'none',
        }}
      >
        <div className="eyebrow" style={{ color: '#5EEAD4', marginBottom: 12 }}>
          {t('about.missionEyebrow')}
        </div>
        <h2
          style={{
            fontSize: 'clamp(24px, 3vw, 34px)',
            fontWeight: 600,
            letterSpacing: '-0.025em',
            margin: '0 0 14px',
            maxWidth: 760,
            lineHeight: 1.15,
            textWrap: 'balance',
          }}
        >
          {t('about.missionTitle')}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.6, maxWidth: 680, margin: 0 }}>
          {t('about.missionBody')}
        </p>
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', margin: '32px 0 16px' }}>
        {t('about.aiTitle')}
      </h3>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}
        className="models-grid"
      >
        {models.map((m) => (
          <div key={m.name} className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'var(--accent-50)',
                  border: '1px solid var(--border-strong)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={m.icon} size={22} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-0.015em' }}>{m.name}</div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {m.sub}
                </div>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
              {m.body}
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {m.tags.map((t) => (
                <span key={t} className="badge badge-neutral mono" style={{ fontSize: 11 }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', margin: '32px 0 16px' }}>{t('about.teamTitle')}</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {TEAM.map((m) => (
          <a
            key={m.name}
            href={`${m.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="card"
            style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                flexShrink: 0,
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 14,
                overflow: 'hidden',
              }}
            >
              {m.photo
                ? <img src={m.photo} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : m.initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 14, letterSpacing: '-0.01em' }}>{m.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.5 }}><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                {t('about.linkedin')}
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="card" style={{ padding: 24, background: '#FFFBEB', borderColor: '#FDE68A' }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <Icon name="alert-triangle" size={20} color="#B45309" />
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 600, color: '#78350F', margin: '0 0 6px' }}>
              {t('about.disclaimerTitle')}
            </h4>
            <p style={{ fontSize: 13, color: '#92400E', lineHeight: 1.6, margin: 0 }}>
              {t('about.disclaimerBody')}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) { .models-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
