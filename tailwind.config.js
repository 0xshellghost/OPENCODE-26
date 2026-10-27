module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--f-display)', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--f-body)', 'DM Sans', 'sans-serif'],
        mono: ['var(--f-mono)', 'DM Mono', 'monospace'],
        jp: ['var(--f-jp)', 'Shippori Mincho', 'serif'],
      },
      colors: {
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          ink: 'var(--accent-ink)',
          soft: 'var(--accent-soft)',
          bold: 'var(--accent-bold)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          hover: 'var(--secondary-hover)',
          ink: 'var(--secondary-ink)',
          soft: 'var(--secondary-soft)',
          border: 'var(--secondary-border)',
        },
        cyan: {
          DEFAULT: 'var(--cyan)',
          soft: 'var(--cyan-soft)',
        },
        ember: 'var(--ember)',
        navy: {
          DEFAULT: 'var(--bg-2)',
          base: 'var(--bg)',
          surface: 'var(--surface)',
          surface2: 'var(--surface-2)',
          raised: 'var(--surface-raised)',
          50: '#E0EBE7',
          100: '#D9E2E8',
          200: '#AEBCC7',
          300: '#8FAFC4',
          400: '#58B99A',
          500: 'var(--navy-500)',
          600: '#0D2233',
          700: '#0B1C2A',
          800: '#07131F',
          900: '#050E17',
        },
        purple: {
          DEFAULT: 'var(--accent)',
          400: 'var(--purple-400)',
          500: 'var(--purple-500)',
          soft: 'var(--accent-soft)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
          raised: 'var(--surface-raised)',
        },
        appMuted: 'var(--muted)',
        appSubtle: 'var(--subtle)',
        appFg: 'var(--fg)',
        borderToken: 'var(--border)',
        borderStrong: 'var(--border-strong)',
        borderAccent: 'var(--border-accent)',
      },
      animation: {
        gradient: 'gradient 6s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
  corePlugins: {
    preflight: false,
  }

}