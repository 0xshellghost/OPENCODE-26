'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import {
  fetchPlatformFeatures,
  updatePlatformFeaturesInDb,
} from 'api/admin/admin';

export interface FeaturesConfig {
  showWinners: boolean;
  showMilestones: boolean;
  showRPlace: boolean;
  showRepositories: boolean;
  showLeaderboard: boolean;
  showGeekstore: boolean;
  flagshipEvent: string | null;
}

export interface FeaturesContextType {
  features: FeaturesConfig;
  isLoading: boolean;
  error: Error | null;
  toggleFeature: (key: keyof FeaturesConfig, value: boolean) => Promise<boolean>;
  setFlagshipEvent: (eventName: string | null) => Promise<boolean>;
  updateFeatures: (patch: Partial<FeaturesConfig>) => Promise<boolean>;
  refreshFeatures: () => Promise<void>;
}

// Initial defaults before authoritative backend response is retrieved.
// Global settings are never assumed enabled before backend confirmation.
const DEFAULT_FEATURES: FeaturesConfig = {
  showWinners: false,
  showMilestones: false,
  showRepositories: false,
  showRPlace: false,
  showLeaderboard: false,
  showGeekstore: false,
  flagshipEvent: null,
};

const FeaturesContext = createContext<FeaturesContextType>({
  features: DEFAULT_FEATURES,
  isLoading: true,
  error: null,
  toggleFeature: async () => false,
  setFlagshipEvent: async () => false,
  updateFeatures: async () => false,
  refreshFeatures: async () => {},
});

export function FeaturesProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<FeaturesConfig>(DEFAULT_FEATURES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshFeatures = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch authoritative configuration directly from backend GET /api/v1/features
      const backendData = await fetchPlatformFeatures();
      if (backendData) {
        setFeatures({
          showWinners: Boolean(backendData.showWinners),
          showMilestones: Boolean(backendData.showMilestones),
          showLeaderboard: Boolean(backendData.showLeaderboard),
          showRepositories: Boolean(backendData.showRepositories),
          showRPlace: Boolean(backendData.showRPlace),
          showGeekstore: Boolean(backendData.showGeekstore),
          flagshipEvent: backendData.flagshipEvent ?? null,
        });
      }
    } catch (err: any) {
      console.error('[FeaturesContext] Failed to retrieve authoritative features configuration:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      // Note: We deliberately do NOT fall back to local storage or static mock files
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFeatures();
  }, [refreshFeatures]);

  const toggleFeature = useCallback(
    async (key: keyof FeaturesConfig, value: boolean): Promise<boolean> => {
      // 1. Partial payload for the targeted feature
      const patch: Partial<FeaturesConfig> = { [key]: value };

      // 2. Persist directly to backend authoritative API: PATCH /api/v1/admin/features
      try {
        const updatedConfig = await updatePlatformFeaturesInDb(patch);
        // 3. Update confirmed configuration ONLY using returned backend data
        if (updatedConfig) {
          setFeatures({
            showWinners: Boolean(updatedConfig.showWinners),
            showMilestones: Boolean(updatedConfig.showMilestones),
            showLeaderboard: Boolean(updatedConfig.showLeaderboard),
            showRepositories: Boolean(updatedConfig.showRepositories),
            showRPlace: Boolean(updatedConfig.showRPlace),
            showGeekstore: Boolean(updatedConfig.showGeekstore),
            flagshipEvent: updatedConfig.flagshipEvent ?? null,
          });
          return true;
        }
        return false;
      } catch (err) {
        console.error(`[FeaturesContext] Failed to update feature ${String(key)}:`, err);
        // Do NOT modify in-memory state on failure - keep last backend-confirmed configuration
        throw err;
      }
    },
    [],
  );

  const setFlagshipEvent = useCallback(
    async (eventName: string | null): Promise<boolean> => {
      const patch: Partial<FeaturesConfig> = { flagshipEvent: eventName };
      try {
        const updatedConfig = await updatePlatformFeaturesInDb(patch);
        if (updatedConfig) {
          setFeatures({
            showWinners: Boolean(updatedConfig.showWinners),
            showMilestones: Boolean(updatedConfig.showMilestones),
            showLeaderboard: Boolean(updatedConfig.showLeaderboard),
            showRepositories: Boolean(updatedConfig.showRepositories),
            showRPlace: Boolean(updatedConfig.showRPlace),
            showGeekstore: Boolean(updatedConfig.showGeekstore),
            flagshipEvent: updatedConfig.flagshipEvent ?? null,
          });
          return true;
        }
        return false;
      } catch (err) {
        console.error('[FeaturesContext] Failed to update flagship event:', err);
        throw err;
      }
    },
    [],
  );

  const updateFeatures = useCallback(
    async (patch: Partial<FeaturesConfig>): Promise<boolean> => {
      try {
        const updatedConfig = await updatePlatformFeaturesInDb(patch);
        if (updatedConfig) {
          setFeatures({
            showWinners: Boolean(updatedConfig.showWinners),
            showMilestones: Boolean(updatedConfig.showMilestones),
            showLeaderboard: Boolean(updatedConfig.showLeaderboard),
            showRepositories: Boolean(updatedConfig.showRepositories),
            showRPlace: Boolean(updatedConfig.showRPlace),
            showGeekstore: Boolean(updatedConfig.showGeekstore),
            flagshipEvent: updatedConfig.flagshipEvent ?? null,
          });
          return true;
        }
        return false;
      } catch (err) {
        console.error('[FeaturesContext] Failed to batch update features:', err);
        throw err;
      }
    },
    [],
  );

  return (
    <FeaturesContext.Provider
      value={{
        features,
        isLoading,
        error,
        toggleFeature,
        setFlagshipEvent,
        updateFeatures,
        refreshFeatures,
      }}
    >
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeatures() {
  return useContext(FeaturesContext);
}
