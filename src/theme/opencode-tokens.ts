export const opencodeTokens = {
  colors: {
    // Backgrounds
    background: {
      base: 'var(--bg)',
      surface: 'var(--card-strong)',
      glass: 'var(--card-bg)',
      glassLight: 'var(--card-soft)',
      glassDark: 'var(--card-bg)',
    },
    // Primary Accents
    accent: {
      sakura: '#e9a7b2',
      sakuraHover: '#f0b8c2',
      ivory: '#fff4ed',
      purple: '#7c3aed',
      purpleHover: '#8b5cf6',
      purpleMuted: 'rgba(124, 58, 237, 0.15)',
    },
    // Leaderboard Ranks
    rank: {
      gold: '#ffd700',
      silver: '#c0c0c0',
      bronze: '#cd7f32',
    },
    // Text
    text: {
      primary: 'var(--text)',
      secondary: 'var(--muted)',
      muted: 'var(--subtle)',
      inverse: 'var(--accent-ink)',
    },
    // Borders
    border: {
      light: 'var(--border)',
      medium: 'var(--border-strong)',
      primary: 'var(--border-strong)',
    },
  },
  typography: {
    fontFamily: 'var(--font-poppins), sans-serif',
    letterSpacing: {
      widest: '0.1em',
      wider: '0.05em',
      normal: '0',
    },
  },
  shadows: {
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
    glow: '0 0 15px rgba(233, 167, 178, 0.3)', // sakura glow
  },
  borders: {
    radius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      full: '9999px',
    },
  },
  glass: {
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--border)',
    background: 'var(--card-bg)',
  },
};
