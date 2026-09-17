import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";
import { extendTheme } from '@chakra-ui/react';

export const globalStyles = {
  fonts: {
    heading: 'Poppins, sans-serif',
    body: 'Poppins, sans-serif',
  },
  colors: {
    brand: {
      50: '#FFF5F7',
      100: '#FFE8ED',
      200: '#FCCDD6',
      300: '#F4AEBB',
      400: '#e9a7b2',
      500: '#d4909a',
      600: '#bf7a83',
      700: '#9a5f67',
      800: '#75444c',
      900: '#502b32',
    },
    purple: {
      50: '#F4EEFF',
      100: '#EADFFF',
      200: '#D1BBFF',
      300: '#B38AFF',
      400: '#8B5CF6',
      500: '#7C3AED',
      600: '#6D28D9',
      700: '#4B1A9B',
      800: '#37106F',
      900: '#240A45',
    },
    navy: {
      50: '#f0edf3',
      100: '#ddd8e3',
      200: '#b8b0c2',
      300: '#9389a2',
      400: '#6e6381',
      500: '#4a3f5c',
      600: '#3a3149',
      700: '#2d2737',
      800: '#272230',
      900: '#211d27',
    },
    gray: {
      50: '#f7f8fb',
      100: '#f1f3f8',
      200: '#e6e9f2',
      300: '#dfe6f6',
      400: '#cfd8ea',
      500: '#9aa4b8',
      600: '#6b7280',
      700: '#4b5563',
      800: '#111827',
      900: '#0b1220',
    },
    // keep semantic tokens for compatibility
    secondaryGray: {
      100: '#E0E5F2',
      200: '#E1E9F8',
      300: '#F4F7FE',
      400: '#E9EDF7',
      500: '#8F9BBA',
      600: '#A3AED0',
      700: '#707EAE',
      800: '#707EAE',
      900: '#1B2559',
    },
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        overflowX: 'hidden',
        bg: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: 'normal',
      },
      input: {
        color: 'var(--text)',
      },
      html: {
        fontFamily: "DM Sans",
      },
    }),
  },
};
