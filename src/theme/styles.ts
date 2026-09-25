import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";
import { extendTheme } from '@chakra-ui/react';

export const globalStyles = {
  fonts: {
    heading: 'Poppins, sans-serif',
    body: 'Poppins, sans-serif',
  },
  colors: {
    brand: {
      50: '#FEF3ED',
      100: '#E8C0BB',
      200: '#CF9690',
      300: '#B88784',
      400: '#9D767E',
      500: '#785255',
      600: '#60434A',
      700: '#7D6C7E',
      800: '#665B6D',
      900: '#3E3843',
    },
    purple: {
      50: '#FEF3ED',
      100: '#E8C0BB',
      200: '#CF9690',
      300: '#B88784',
      400: '#9D767E',
      500: '#785255',
      600: '#60434A',
      700: '#7D6C7E',
      800: '#665B6D',
      900: '#3E3843',
    },
    navy: {
      50: '#CF9690',
      100: '#B88784',
      200: '#9D767E',
      300: '#785255',
      400: '#60434A',
      500: '#7D6C7E',
      600: '#665B6D',
      700: '#3E3843',
      800: '#312C34',
      900: '#291920',
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
