import * as Haptics from 'expo-haptics';
import { useUser } from '@/contexts/UserContext';

export type HapticImpact = 'light' | 'medium' | 'heavy';

/**
 * Haptics utility that respects user settings
 * Returns a no-op function if haptics are disabled
 */
export function createHaptics() {
  // This will be called from components that have access to useUser
  return {
    impact: (style: HapticImpact, hapticsEnabled: boolean) => {
      if (!hapticsEnabled) return; // Respect settings
      
      try {
        switch (style) {
          case 'light':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
        }
      } catch (error) {
        // Silently fail if haptics not available
        if (__DEV__) {
          console.warn('[Haptics] Failed to trigger:', error);
        }
      }
    },
  };
}

/**
 * Hook version for components that have access to useUser
 */
export function useHaptics() {
  const { hapticsOn } = useUser();
  
  return {
    impact: (style: HapticImpact) => {
      if (!hapticsOn) return;
      
      try {
        switch (style) {
          case 'light':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('[Haptics] Failed to trigger:', error);
        }
      }
    },
  };
}

