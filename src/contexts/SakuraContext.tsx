'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface SakuraContextType {
  enabled: boolean;
  toggle: () => void;
}

const SakuraContext = createContext<SakuraContextType>({ enabled: true, toggle: () => {} });

const STORAGE_KEY = 'oc-sakura-petals';

export function SakuraProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) setEnabled(stored === 'true');
    } catch {
      // localStorage unavailable
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  }, []);

  return (
    <SakuraContext.Provider value={{ enabled, toggle }}>
      {children}
    </SakuraContext.Provider>
  );
}

export function useSakura() {
  return useContext(SakuraContext);
}
