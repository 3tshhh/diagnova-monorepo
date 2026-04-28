/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#134E4A',
          700: '#0F3F3C',
          900: '#0A2A28',
        },
        accent: {
          DEFAULT: '#0D9488',
          600: '#0B8278',
          50: '#E6F4F2',
        },
        bg: '#F0F9F9',
        surface: '#FFFFFF',
        text: {
          DEFAULT: '#1F2937',
          muted: '#6B7280',
          subtle: '#9CA3AF',
        },
        border: {
          DEFAULT: '#E2EDEC',
          strong: '#C9DDDB',
        },
        success: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
        },
        danger: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
        },
        warn: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: {
        md: '10px',
        lg: '14px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(15, 63, 60, 0.04)',
        md: '0 4px 16px -4px rgba(15, 63, 60, 0.08), 0 2px 6px -2px rgba(15, 63, 60, 0.04)',
        lg: '0 24px 48px -16px rgba(15, 63, 60, 0.18), 0 8px 16px -8px rgba(15, 63, 60, 0.08)',
      },
      keyframes: {
        spin: { to: { transform: 'rotate(360deg)' } },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.35s ease both',
      },
    },
  },
  plugins: [],
};
