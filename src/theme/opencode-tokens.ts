export const opencodeTokens = {
  colors: {
    // Backgrounds
    background: {
      base: 'var(--bg)',
      surface: 'var(--surface)',
      glass: 'var(--surface)',
      glassLight: 'var(--surface-2)',
      glassDark: 'var(--card-bg)',
    },
    // Primary Accents
    accent: {
      sakura: 'var(--accent)',
      sakuraHover: 'var(--accent-hover)',
      ivory: 'var(--text)',
      purple: 'var(--accent)',
      purpleHover: 'var(--accent-hover)',
      purpleMuted: 'var(--accent-soft)',
      ember: 'var(--ember)',
      emberLight: 'var(--ember)',
    },
    // Secondary & Accent Colors
    secondary: {
      default: 'var(--secondary)',
      hover: 'var(--secondary-hover)',
      soft: 'var(--secondary-soft)',
      border: 'var(--secondary-border)',
    },
    status: {
      live: {
        bg: 'var(--status-live-bg)',
        text: 'var(--status-live-text)',
        border: 'var(--status-live-border)',
      },
      upcoming: {
        bg: 'var(--status-upcoming-bg)',
        text: 'var(--status-upcoming-text)',
        border: 'var(--status-upcoming-border)',
      },
      concluded: {
        bg: 'var(--status-concluded-bg)',
        text: 'var(--status-concluded-text)',
        border: 'var(--status-concluded-border)',
      },
    },
    // Leaderboard Ranks
    rank: {
      gold: '#F5C542',
      silver: '#94A3B8',
      bronze: '#D97706',
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
      primary: 'var(--border)',
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
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
  },
};
