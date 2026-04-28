type LogoProps = {
  size?: number;
  light?: boolean;
};

export function Logo({ size = 32, light = false }: LogoProps) {
  const stroke = light ? '#FFFFFF' : '#134E4A';
  const accent = light ? '#5EEAD4' : '#0D9488';
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="28" height="28" rx="8" stroke={stroke} strokeWidth="1.5" />
      <path
        d="M9 16 L13 16 L15 11 L17 21 L19 16 L23 16"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="23" cy="16" r="1.6" fill={accent} />
    </svg>
  );
}
