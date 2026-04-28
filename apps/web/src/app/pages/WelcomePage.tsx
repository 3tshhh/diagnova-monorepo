import { Link } from 'react-router';
import { Wordmark } from '../components/Wordmark';
import { Icon } from '../components/Icon';
import { HeroScanCard } from '../components/HeroScanCard';

export function WelcomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(120% 70% at 0% 0%, rgba(13, 148, 136, 0.45) 0%, transparent 55%),' +
            'radial-gradient(70% 60% at 100% 30%, rgba(94, 234, 212, 0.18) 0%, transparent 55%),' +
            'linear-gradient(170deg, #0A2A28 0%, #134E4A 60%, #0F3F3C 100%)',
          color: '#fff',
          padding: '28px 0 100px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.07,
            pointerEvents: 'none',
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Wordmark light size="md" />
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/login" className="btn btn-ghost" style={{ color: '#fff' }}>
              Login
            </Link>
            <Link to="/signup" className="btn" style={{ background: '#fff', color: 'var(--primary)' }}>
              Get Started <Icon name="arrow-right" size={16} />
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 32px 0', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
              gap: 56,
              alignItems: 'center',
            }}
            className="hero-grid"
          >
            <div>
              <div className="eyebrow" style={{ color: '#5EEAD4' }}>
                AI-Powered Medical Imaging Analysis
              </div>
              <h1
                style={{
                  fontSize: 'clamp(40px, 5.5vw, 68px)',
                  fontWeight: 600,
                  lineHeight: 1.04,
                  letterSpacing: '-0.03em',
                  margin: '18px 0 22px',
                  color: '#fff',
                }}
              >
                Read radiographs<br />
                <span style={{ color: '#5EEAD4', fontStyle: 'italic', fontWeight: 500 }}>
                  in seconds, not hours.
                </span>
              </h1>
              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.55,
                  color: 'rgba(255,255,255,0.8)',
                  maxWidth: 540,
                  margin: 0,
                }}
              >
                Upload a chest X-ray or skeletal radiograph. Diagnova's deep-learning models surface findings — pneumonia, pleural effusion, fractures and more — so clinicians can spend more time on patients and less on the lightbox.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
                <Link to="/signup" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)' }}>
                  Get Started <Icon name="arrow-right" size={18} />
                </Link>
                <Link
                  to="/login"
                  className="btn btn-lg btn-ghost"
                  style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  Login
                </Link>
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
                {(
                  [
                    ['Cases reviewed', '1.2M+'],
                    ['Pathologies', '14'],
                    ['Avg. analysis', '< 8s'],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k}>
                    <div
                      className="mono"
                      style={{ fontSize: 24, color: '#fff', fontWeight: 500, letterSpacing: '-0.01em' }}
                    >
                      {v}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.55)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginTop: 4,
                      }}
                    >
                      {k}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <HeroScanCard />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="eyebrow">How It Works</div>
          <h2
            style={{
              fontSize: 'clamp(28px, 3.5vw, 40px)',
              fontWeight: 600,
              letterSpacing: '-0.025em',
              margin: '12px 0 12px',
              textWrap: 'balance',
            }}
          >
            Three steps from image to insight.
          </h2>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: 16,
              maxWidth: 560,
              margin: '0 auto',
              lineHeight: 1.55,
            }}
          >
            Designed to slot into any radiology workflow — clinic, hospital, or remote review.
          </p>
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}
          className="steps-grid"
        >
          {(
            [
              {
                n: '01',
                icon: 'upload-cloud' as const,
                title: 'Upload your scan',
                body: 'Drag and drop a DICOM, JPG, or PNG. We support chest X-rays and orthopedic radiographs in any common projection.',
              },
              {
                n: '02',
                icon: 'cpu' as const,
                title: 'AI analyzes the image',
                body: 'Two specialized convolutional models — one for thoracic disease, one for fracture detection — process the study end-to-end.',
              },
              {
                n: '03',
                icon: 'file-text' as const,
                title: 'Get a structured report',
                body: 'Receive a clean diagnostic summary with findings and location, exportable as a PDF for your records.',
              },
            ]
          ).map((s, i) => (
            <div key={s.n} className="card" style={{ padding: 28, position: 'relative' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'var(--accent-50)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 18,
                  border: '1px solid var(--border-strong)',
                }}
              >
                <Icon name={s.icon} size={22} color="var(--accent)" />
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 11,
                  color: 'var(--text-subtle)',
                  letterSpacing: '0.12em',
                  marginBottom: 6,
                }}
              >
                STEP {s.n}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px', letterSpacing: '-0.015em' }}>
                {s.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.55, margin: 0 }}>
                {s.body}
              </p>
              {i < 2 && (
                <div
                  style={{ position: 'absolute', right: -16, top: '50%', display: 'none' }}
                  className="step-arrow"
                >
                  <Icon name="arrow-right" size={20} color="var(--border-strong)" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 80,
            padding: '40px 48px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-700) 100%)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: 560 }}>
            <h3 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              Ready to run your first scan?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: 15 }}>
              Free during research preview. No credit card required.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/signup" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)' }}>
              Create account
            </Link>
            <Link
              to="/login"
              className="btn btn-lg btn-ghost"
              style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Login
            </Link>
          </div>
        </div>

        <div
          style={{
            marginTop: 64,
            paddingTop: 32,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <Wordmark size="sm" />
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }} className="mono">
            © 2026 Diagnova Research · Not a substitute for professional medical advice
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 901px) {
          .step-arrow { display: block !important; }
        }
      `}</style>
    </div>
  );
}
