export const opencodeTokens = {
  colors: {
    // Backgrounds
    background: {
      base: 'var(--bg)',
      surface: 'var(--surface)',
      glass: 'var(--surface)',
      glassLight: 'var(--surface-2)',
      glassDark: 'var(--bg-2)',
    },
    // Primary Accents
    accent: {
      sakura: '#f0a8b8',
      sakuraHover: '#ffd0dc',
      ivory: '#fff1ec',
      purple: '#c04a67',
      purpleHover: '#a83853',
      purpleMuted: 'rgba(240, 168, 184, 0.14)',
      ember: '#ff8f6b',
      emberLight: '#c9532b',
    },
    // Leaderboard Ranks
    rank: {
      gold: '#ffd700',
      silver: '#c0c0c0',
      bronze: '#cd7f32',
    },
    // Text
    text: {
      primary: 'var(--fg)',
      secondary: 'var(--muted)',
      muted: 'var(--subtle)',
      inverse: 'var(--accent-ink)',
    },
    // Borders
    border: {
      light: 'var(--line)',
      medium: 'var(--border-strong)',
      primary: 'var(--border-strong)',
    },
  },
  typography: {
    fontFamily: 'var(--f-body), sans-serif',
    display: 'var(--f-display), serif',
    jp: 'var(--f-jp), serif',
    mono: 'var(--f-mono), monospace',
    letterSpacing: {
      widest: '0.28em',
      wider: '0.14em',
      normal: '0',
    },
  },
  shadows: {
    glass: 'var(--shadow)',
    glow: '0 12px 36px -10px var(--accent)',
  },
  borders: {
    radius: {
      sm: '8px',
      md: '14px',
      lg: '18px',
      xl: 'var(--r)',
      full: '9999px',
    },
  },
  glass: {
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--line)',
    background: 'var(--surface)',
  },
};
