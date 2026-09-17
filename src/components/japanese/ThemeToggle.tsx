'use client';

import { useColorMode } from '@chakra-ui/react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <button className="oc-icon-button" type="button" onClick={toggleColorMode} aria-label={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`}>
      {colorMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
