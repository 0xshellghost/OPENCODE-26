import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";
import { extendTheme } from '@chakra-ui/react';

export const globalStyles = {
  fonts: {
    heading: "var(--f-display), 'Cormorant Garamond', Georgia, serif",
    body: "var(--f-body), 'DM Sans', sans-serif",
    mono: "var(--f-mono), 'DM Mono', monospace",
  },
  colors: {
    brand: {
      50: '#fff1ec',
      100: '#fcd5df',
      200: '#f0a8b8',
      300: '#e58a9e',
      400: '#d96e85',
      500: '#c04a67',
      600: '#a83853',
      700: '#8c2c43',
      800: '#6f2134',
      900: '#2a1420',
    },
    purple: {
      50: '#fff1ec',
      100: '#fcd5df',
      200: '#f0a8b8',
      300: '#e58a9e',
      400: '#d96e85',
      500: '#c04a67',
      600: '#a83853',
      700: '#8c2c43',
      800: '#6f2134',
      900: '#2a1420',
    },
    navy: {
      50: '#fbf1f1',
      100: '#f4e3e6',
      200: '#c7b0b9',
      300: '#6b5560',
      400: '#5a3a62',
      500: '#3a2646',
      600: '#2d2036',
      700: '#241a2b',
      800: '#211726',
      900: '#1b1420',
    },
    gray: {
      50: '#fbf1f1',
      100: '#f4e3e6',
      200: '#e8d6da',
      300: '#c7b0b9',
      400: '#a8949e',
      500: '#8a7682',
      600: '#6b5560',
      700: '#483542',
      800: '#2a1a24',
      900: '#1b1420',
    },
    // keep semantic tokens for compatibility
    secondaryGray: {
      100: '#f4e3e6',
      200: '#e8d6da',
      300: '#fbf1f1',
      400: '#c7b0b9',
      500: '#8a7682',
      600: '#6b5560',
      700: '#483542',
      800: '#2a1a24',
      900: '#1b1420',
    },
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        overflowX: 'hidden',
        bg: 'var(--bg)',
        color: 'var(--fg)',
        fontFamily: "var(--f-body), 'DM Sans', sans-serif",
        letterSpacing: 'normal',
      },
      input: {
        color: 'var(--fg)',
      },
      html: {
        fontFamily: "var(--f-body), 'DM Sans', sans-serif",
      },
    }),
  },
};
