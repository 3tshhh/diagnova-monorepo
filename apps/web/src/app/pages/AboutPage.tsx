import { PageHeader } from '../components/PageHeader';
import { Icon, type IconName } from '../components/Icon';

type Model = {
  name: string;
  sub: string;
  icon: IconName;
  body: string;
  tags: string[];
};

const TEAM = [
  { name: 'Dr. Amara Okoye', role: 'Co-founder, Chief Medical Officer', initials: 'AO' },
  { name: 'Rohan Chatterjee', role: 'Co-founder, ML Research Lead', initials: 'RC' },
  { name: 'Dr. Lena Mikkelsen', role: 'Head of Clinical Validation', initials: 'LM' },
  { name: 'Tomás Ferreira', role: 'Engineering Lead', initials: 'TF' },
  { name: 'Hana Saito', role: 'Product Design', initials: 'HS' },
  { name: 'Dr. Marcus Reyes', role: 'Radiology Advisor', initials: 'MR' },
];

const MODELS: Model[] = [
  {
    name: 'PulmoNet v3.1',
    sub: 'Lung X-ray model',
    icon: 'wind',
    body: 'A convolutional network trained on 480k de-identified chest radiographs across 14 thoracic pathologies — including pneumonia, pleural effusion, pneumothorax, and cardiomegaly. Validated against board-certified radiologist consensus on a held-out test set.',
    tags: ['ResNet-50 backbone', 'Multi-label', 'PA + AP views'],
  },
  {
    name: 'OssaNet v2.4',
    sub: 'Bone fracture model',
    icon: 'bone',
    body: 'A detection model trained on 220k orthopedic radiographs annotated by musculoskeletal radiologists. Localizes fractures and classifies type — transverse, oblique, spiral, comminuted, greenstick, and more — across major long bones and joints.',
    tags: ['Object detection', '11 classes', 'Bounding boxes'],
  },
];

export function AboutPage() {
  return (
    <div className="fade-up">
      <PageHeader
        eyebrow="About Diagnova"
        title="Building tools for radiologists, with radiologists."
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
          Our mission
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
          To make accurate radiographic interpretation accessible everywhere, especially where specialists are scarce.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.6, maxWidth: 680, margin: 0 }}>
          Around the world, billions of people live without timely access to a radiologist. Diagnova builds AI assistants that help frontline clinicians triage chest and skeletal radiographs in seconds, so patients aren't left waiting for answers.
        </p>
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', margin: '32px 0 16px' }}>
        How the AI works
      </h3>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}
        className="models-grid"
      >
        {MODELS.map((m) => (
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

      <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', margin: '32px 0 16px' }}>Team</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {TEAM.map((m) => (
          <div key={m.name} className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
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
              }}
            >
              {m.initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 14, letterSpacing: '-0.01em' }}>{m.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.role}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 24, background: '#FFFBEB', borderColor: '#FDE68A' }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <Icon name="alert-triangle" size={20} color="#B45309" />
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 600, color: '#78350F', margin: '0 0 6px' }}>
              Medical disclaimer
            </h4>
            <p style={{ fontSize: 13, color: '#92400E', lineHeight: 1.6, margin: 0 }}>
              Diagnova is a research tool and is not a substitute for professional medical diagnosis, advice, or treatment. Outputs from the system are intended to assist licensed clinicians and must always be reviewed in context of the full clinical picture. The system has not received FDA, CE, or other regulatory clearance for primary diagnostic use. Never disregard professional medical advice or delay seeking it because of information presented here.
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
