'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

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
}

const STORAGE_KEY = 'oc-feature-flags';

const DEFAULT_FEATURES: FeaturesConfig = {
  showWinners: true,
  showMilestones: true,
  showRepositories: true,
  showRPlace: true,
  showLeaderboard: true,
  flagshipEvent: 'Opencode',
};

const FeaturesContext = createContext<FeaturesContextType>({
  features: DEFAULT_FEATURES,
  toggleFeature: async () => false,
  setFlagshipEvent: async () => false,
});

export function FeaturesProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<FeaturesConfig>(() => {
    if (typeof window === 'undefined') return DEFAULT_FEATURES;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_FEATURES, ...JSON.parse(stored) } : DEFAULT_FEATURES;
    } catch {
      return DEFAULT_FEATURES;
    }
  });

  useEffect(() => {
    fetch('/api/features')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
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
      })
      .catch(() => {});
  }, []);

  const toggleFeature = useCallback(async (key: keyof FeaturesConfig, value: boolean) => {
    setFeatures((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ [key]: value }),
      });
      return res.ok;
    } catch {
      return false;
    }
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
      const token = localStorage.getItem('token');
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
    <FeaturesContext.Provider value={{ features, toggleFeature, setFlagshipEvent }}>
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeatures() {
  return useContext(FeaturesContext);
}
