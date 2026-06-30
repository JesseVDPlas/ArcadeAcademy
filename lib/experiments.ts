import React from 'react';
import { log } from './analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Experiment storage key
const EXPERIMENT_STORAGE_KEY = 'arcade_experiments';
const INSTALLATION_ID_KEY = 'arcade_installation_id';

// Experiment cache
let experimentCache: Record<string, string> = {};

async function getStableInstallationId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(INSTALLATION_ID_KEY);
    if (existing) return existing;

    const generated = `install_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(INSTALLATION_ID_KEY, generated);
    return generated;
  } catch (error) {
    if (__DEV__) {
      console.warn('[Experiments] Failed to load/save installation id:', error);
    }
    return 'install_fallback';
  }
}

/**
 * Get variant for an experiment
 * Uses consistent hashing based on user ID or device ID
 * Caches result in AsyncStorage for persistence
 */
export async function getVariant(
  experimentName: string,
  variants: string[]
): Promise<string> {
  // Check cache first
  if (experimentCache[experimentName]) {
    return experimentCache[experimentName];
  }

  try {
    // Try to load from storage
    const stored = await AsyncStorage.getItem(EXPERIMENT_STORAGE_KEY);
    if (stored) {
      const experiments = JSON.parse(stored);
      if (experiments[experimentName]) {
        experimentCache[experimentName] = experiments[experimentName];
        return experiments[experimentName];
      }
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[Experiments] Failed to load from storage:', error);
    }
  }

  // Generate variant using a stable installation ID
  const installationId = await getStableInstallationId();
  const hash = simpleHash(`${experimentName}_${installationId}`);
  const variantIndex = hash % variants.length;
  const variant = variants[variantIndex];

  // Cache and store
  experimentCache[experimentName] = variant;
  try {
    const stored = await AsyncStorage.getItem(EXPERIMENT_STORAGE_KEY);
    const experiments = stored ? JSON.parse(stored) : {};
    experiments[experimentName] = variant;
    await AsyncStorage.setItem(EXPERIMENT_STORAGE_KEY, JSON.stringify(experiments));
  } catch (error) {
    if (__DEV__) {
      console.warn('[Experiments] Failed to save to storage:', error);
    }
  }

  // Log assignment
  log('experiment_assign', {
    exp: experimentName,
    variant,
  });

  return variant;
}

/**
 * Simple hash function for consistent variant assignment
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Hook version for React components
 */
export function useExperiment(
  experimentName: string,
  variants: string[]
): string {
  const [variant, setVariant] = React.useState<string>(variants[0]);

  React.useEffect(() => {
    getVariant(experimentName, variants).then(setVariant);
  }, [experimentName, variants.join(',')]);

  return variant;
}
