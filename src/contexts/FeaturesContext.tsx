'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { fetchPlatformFeatures, updatePlatformFeaturesInDb } from 'api/admin/admin';

export interface FeaturesConfig {
  showWinners: boolean;
  showMilestones: boolean;
  showRPlace: boolean;
  showRepositories: boolean;
  showLeaderboard: boolean;
  flagshipEvent?: string | null;
}

interface FeaturesContextType {
  features: FeaturesConfig;
  toggleFeature: (key: keyof FeaturesConfig, value: boolean) => Promise<boolean>;
  setFlagshipEvent: (eventName: string | null) => Promise<boolean>;
  refreshFeatures: () => Promise<void>;
}

const STORAGE_KEY = 'oc-feature-flags';

const DEFAULT_FEATURES: FeaturesConfig = {
  showWinners: true,
  showMilestones: true,
  showRepositories: true,
  showRPlace: true,
  showLeaderboard: true,
  flagshipEvent: 'Rift CTF',
};

const FeaturesContext = createContext<FeaturesContextType>({
  features: DEFAULT_FEATURES,
  toggleFeature: async () => false,
  setFlagshipEvent: async () => false,
  refreshFeatures: async () => {},
});

export function FeaturesProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<FeaturesConfig>(DEFAULT_FEATURES);

  const refreshFeatures = useCallback(async () => {
    try {
      // 1. Try to fetch directly from backend database API
      const backendData = await fetchPlatformFeatures();
      if (backendData) {
        setFeatures((prev) => {
          const next = {
            ...prev,
            showWinners: typeof backendData.showWinners === 'boolean' ? backendData.showWinners : prev.showWinners,
            showMilestones: typeof backendData.showMilestones === 'boolean' ? backendData.showMilestones : prev.showMilestones,
            showRPlace: typeof backendData.showRPlace === 'boolean' ? backendData.showRPlace : prev.showRPlace,
            showRepositories: typeof backendData.showRepositories === 'boolean' ? backendData.showRepositories : prev.showRepositories,
            showLeaderboard: typeof backendData.showLeaderboard === 'boolean' ? backendData.showLeaderboard : prev.showLeaderboard,
          };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
        return;
      }
    } catch (e) {
      console.warn('[FeaturesContext] Backend direct fetch failed, trying proxy:', e);
    }

    // 2. Fallback to Next.js API proxy
    try {
      const res = await fetch('/api/features');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setFeatures((prev) => {
            const next = {
              showWinners: typeof data.showWinners === 'boolean' ? data.showWinners : prev.showWinners,
              showMilestones: typeof data.showMilestones === 'boolean' ? data.showMilestones : prev.showMilestones,
              showRPlace: typeof data.showRPlace === 'boolean' ? data.showRPlace : prev.showRPlace,
              showRepositories: typeof data.showRepositories === 'boolean' ? data.showRepositories : prev.showRepositories,
              showLeaderboard: typeof data.showLeaderboard === 'boolean' ? data.showLeaderboard : prev.showLeaderboard,
              flagshipEvent: data.flagshipEvent !== undefined ? data.flagshipEvent : prev.flagshipEvent,
            };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {}
            return next;
          });
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFeatures((prev) => ({ ...prev, ...JSON.parse(stored) }));
      }
    } catch {
      // localStorage unavailable
    }
    refreshFeatures();
  }, [refreshFeatures]);

  const toggleFeature = useCallback(async (key: keyof FeaturesConfig, value: boolean) => {
    let previousState: FeaturesConfig = DEFAULT_FEATURES;
    setFeatures((prev) => {
      previousState = prev;
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    let backendSuccess = false;
    try {
      // Update in database via backend API
      await updatePlatformFeaturesInDb({ [key]: value });
      backendSuccess = true;
    } catch (dbErr) {
      console.warn('[FeaturesContext] updatePlatformFeaturesInDb warning:', dbErr);
    }

    // Also sync with Next.js local route for proxy cache consistency
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('/api/features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ [key]: value }),
      });
      if (res.ok) {
        backendSuccess = true;
      }
    } catch (proxyErr) {
      console.warn('[FeaturesContext] Next.js features proxy update warning:', proxyErr);
    }

    if (!backendSuccess) {
      // Rollback to previous state on total failure
      setFeatures(previousState);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(previousState));
      } catch {}
      return false;
    }

    return true;
  }, []);

  const setFlagshipEvent = useCallback(async (eventName: string | null) => {
    setFeatures((prev) => {
      const next = { ...prev, flagshipEvent: eventName };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('/api/features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ flagshipEvent: eventName }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  return (
    <FeaturesContext.Provider value={{ features, toggleFeature, setFlagshipEvent, refreshFeatures }}>
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeatures() {
  return useContext(FeaturesContext);
}
