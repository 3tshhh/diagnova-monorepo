import { Logo } from './Logo';

type WordmarkProps = {
  light?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export function Wordmark({ light = false, size = 'md' }: WordmarkProps) {
  const dim = size === 'lg' ? 40 : size === 'sm' ? 24 : 32;
  const fontSize = size === 'lg' ? 24 : size === 'sm' ? 16 : 19;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Logo size={dim} light={light} />
      <span
        style={{
          fontSize,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: light ? '#fff' : '#134E4A',
        }}
      >
        Diagnova
      </span>
    </div>
  );
}
