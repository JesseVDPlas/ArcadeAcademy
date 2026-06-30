import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, radii, glows, typography, animations, getAnimationDuration } from '@/theme';

export interface XPBarProps {
  /** Current XP value */
  current: number;
  /** XP required for next level */
  max: number;
  /** Current level number */
  level: number;
  /** Show glow effect on the fill bar */
  showGlow?: boolean;
  /** Compact mode (smaller height, no level label) */
  compact?: boolean;
}

/**
 * XPBar - Animated experience bar with level display
 * Shows progress toward next level with neon glow effect
 */
export const XPBar: React.FC<XPBarProps> = ({
  current,
  max,
  level,
  showGlow = true,
  compact = false,
}) => {
  const percentage = Math.min(Math.max((current / max) * 100, 0), 100);
  // Initialize with current percentage so it's visible immediately
  const progress = useSharedValue(percentage);

  // Animate progress bar when values change
  useEffect(() => {
    const duration = getAnimationDuration(animations.durations.slow);
    
    if (duration === 0) {
      // Reduced motion: instant
      progress.value = percentage;
    } else {
      // Normal: smooth animation
      progress.value = withSpring(percentage, animations.springs.gentle);
    }
  }, [percentage, progress]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View style={styles.container}>
      {/* Level indicator */}
      {!compact && (
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv {level}</Text>
        </View>
      )}

      {/* Progress bar container */}
      <View style={[styles.barContainer, compact && styles.barContainerCompact]}>
        {/* Background track */}
        <View style={styles.barTrack} />
        
        {/* Animated fill */}
        <Animated.View
          style={[
            styles.barFill,
            showGlow && styles.barFillGlow,
            animatedFillStyle,
          ]}
        />

        {/* XP text overlay */}
        <View style={styles.textOverlay}>
          <Text style={styles.xpText}>
            {current} / {max} XP
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  
  levelBadge: {
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.neonGreen,
    borderRadius: radii.s,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
    minWidth: 60,
    alignItems: 'center',
    ...glows.small.green,
  },
  
  levelText: {
    ...typography.titleSmall,
    color: colors.neonGreen,
    fontSize: 12,
  },
  
  barContainer: {
    flex: 1,
    height: 32,
    position: 'relative',
    justifyContent: 'center',
    minHeight: 32, // Ensure minimum height for visibility
  },
  
  barContainerCompact: {
    height: 24,
    minHeight: 24,
  },
  
  barTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.grey[700],
    borderRadius: radii.s,
    overflow: 'hidden',
  },
  
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    height: '100%',
    backgroundColor: colors.neonGreen,
    borderRadius: radii.s - 2,
    minWidth: 4,
    opacity: 1,
    shadowColor: colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
    elevation: 1,
  },
  
  barFillGlow: {
    ...glows.medium.green,
  },
  
  textOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    pointerEvents: 'none',
  },
  
  xpText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 10,
    textShadowColor: colors.black,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default XPBar;
