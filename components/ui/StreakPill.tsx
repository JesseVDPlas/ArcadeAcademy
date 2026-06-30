import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing, radii, glows, typography, animations, getAnimationDuration } from '@/theme';

export interface StreakPillProps {
  /** Current streak count */
  count: number;
  /** Show animated flame effect */
  animated?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

/**
 * StreakPill - Display current streak with flame icon
 * Shows streak count with optional pulse animation
 */
export const StreakPill: React.FC<StreakPillProps> = ({
  count,
  animated = true,
  size = 'medium',
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Pulse animation for active streaks
  useEffect(() => {
    if (animated && count > 0) {
      const duration = getAnimationDuration(animations.durations.normal);
      
      if (duration > 0) {
        // Pulse effect: scale and opacity
        scale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration }),
            withTiming(1, { duration })
          ),
          -1, // infinite
          false
        );
        
        opacity.value = withRepeat(
          withSequence(
            withTiming(0.8, { duration }),
            withTiming(1, { duration })
          ),
          -1,
          false
        );
      }
    } else {
      scale.value = 1;
      opacity.value = 1;
    }
  }, [animated, count, scale, opacity]);

  const animatedFlameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const sizeStyles = {
    small: styles.containerSmall,
    medium: styles.containerMedium,
    large: styles.containerLarge,
  };

  const textSizeStyles = {
    small: styles.textSmall,
    medium: styles.textMedium,
    large: styles.textLarge,
  };

  const isActive = count > 0;

  return (
    <View style={[
      styles.container, 
      sizeStyles[size],
      !isActive && styles.containerInactive,
    ]}>
      {/* Flame icon (using emoji for simplicity) */}
      <Animated.View style={animatedFlameStyle}>
        <Text style={[styles.flame, textSizeStyles[size], !isActive && styles.flameInactive]}>
          {isActive ? '🔥' : '❄️'}
        </Text>
      </Animated.View>

      {/* Streak count */}
      <Text style={[styles.count, textSizeStyles[size], !isActive && styles.countInactive]}>
        {count}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.warning,
    borderRadius: radii.l,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.m,
    gap: spacing.xs,
    ...glows.small.pink,
  },
  
  containerSmall: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
    gap: 4,
  },
  
  containerMedium: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.m,
    gap: spacing.xs,
  },
  
  containerLarge: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
    gap: spacing.s,
  },
  
  containerInactive: {
    borderColor: colors.grey[600],
    opacity: 0.6,
    ...glows.small.green, // Subtle glow even when inactive
  },
  
  flame: {
    fontSize: 16,
    lineHeight: 20,
  },
  
  flameInactive: {
    opacity: 0.5,
  },
  
  count: {
    ...typography.titleSmall,
    color: colors.warning,
    fontWeight: '700',
  },
  
  countInactive: {
    color: colors.grey[500],
  },
  
  textSmall: {
    fontSize: 12,
    lineHeight: 16,
  },
  
  textMedium: {
    fontSize: 14,
    lineHeight: 20,
  },
  
  textLarge: {
    fontSize: 18,
    lineHeight: 24,
  },
});

export default StreakPill;

