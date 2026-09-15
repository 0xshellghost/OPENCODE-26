export const opencodeTokens = {
  colors: {
    // Backgrounds
    background: {
      base: '#1a1625', // Deeper midnight navy
      surface: '#211d27',
      glass: 'rgba(33, 29, 39, 0.4)',
      glassLight: 'rgba(255, 255, 255, 0.05)',
      glassDark: 'rgba(15, 23, 42, 0.4)',
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
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      muted: 'rgba(255, 255, 255, 0.5)',
      inverse: '#0f172a',
    },
    // Borders
    border: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.2)',
      primary: 'rgba(233, 167, 178, 0.4)', // sakura tinted
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
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.03)',
  },
};
