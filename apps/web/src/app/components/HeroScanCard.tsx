import { Icon } from './Icon';

export function HeroScanCard() {
  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: -18,
          right: 24,
          zIndex: 3,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(8px)',
          padding: '10px 14px',
          borderRadius: 10,
          color: 'var(--primary)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: 'var(--success)',
            boxShadow: '0 0 0 4px rgba(16,185,129,0.2)',
          }}
        />
        Analysis complete · 6.4s
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(12px)',
          borderRadius: 18,
          padding: 18,
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            color: 'rgba(255,255,255,0.7)',
            fontSize: 12,
          }}
          className="mono"
        >
          <span>STUDY · CXR-2026-04812</span>
          <span>PA VIEW</span>
        </div>
        <div
          style={{
            aspectRatio: '4 / 5',
            borderRadius: 10,
            position: 'relative',
            overflow: 'hidden',
            background:
              'radial-gradient(60% 70% at 50% 45%, #1a3d3a 0%, #0a1f1d 60%, #050f0e 100%)',
          }}
        >
          <svg
            viewBox="0 0 100 125"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4 }}
          >
            <defs>
              <radialGradient id="lung" cx="50%" cy="40%" r="40%">
                <stop offset="0%" stopColor="#1f5f5b" stopOpacity="0.6" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <ellipse cx="34" cy="55" rx="14" ry="22" fill="url(#lung)" />
            <ellipse cx="66" cy="55" rx="14" ry="22" fill="url(#lung)" />
            {[30, 38, 46, 54, 62, 70].map((y) => (
              <path
                key={y}
                d={`M 18 ${y} Q 50 ${y - 3} 82 ${y}`}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="0.4"
                fill="none"
              />
            ))}
            <line x1="50" y1="20" x2="50" y2="105" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          </svg>
          <div
            style={{
              position: 'absolute',
              top: '38%',
              left: '22%',
              width: '22%',
              height: '20%',
              border: '1.5px solid #5EEAD4',
              borderRadius: 4,
              boxShadow: '0 0 0 4px rgba(94, 234, 212, 0.15)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -22,
                left: -1,
                fontSize: 10,
                background: '#5EEAD4',
                color: '#0A2A28',
                padding: '2px 6px',
                borderRadius: 3,
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 500,
              }}
            >
              OPACITY
            </div>
          </div>
          {[
            { top: 8, left: 8, borderTop: '1px solid', borderLeft: '1px solid' },
            { top: 8, right: 8, borderTop: '1px solid', borderRight: '1px solid' },
            { bottom: 8, left: 8, borderBottom: '1px solid', borderLeft: '1px solid' },
            { bottom: 8, right: 8, borderBottom: '1px solid', borderRight: '1px solid' },
          ].map((c, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 14,
                height: 14,
                borderColor: 'rgba(94, 234, 212, 0.6)',
                ...c,
              }}
            />
          ))}
        </div>
        <div
          style={{
            marginTop: 14,
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 6,
            }}
            className="mono"
          >
            Findings
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 14 }}>
            <span style={{ width: 6, height: 6, background: '#EF4444', borderRadius: 999 }} />
            Right lower-lobe consolidation
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: -20,
          left: -12,
          zIndex: 3,
          background: 'rgba(255,255,255,0.96)',
          padding: '10px 14px',
          borderRadius: 10,
          color: 'var(--primary)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        <Icon name="shield-check" size={16} color="var(--accent)" />
        14 pathologies screened
      </div>
    </div>
  );
}
