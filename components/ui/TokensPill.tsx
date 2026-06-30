import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, radii, glows, typography, animations, getAnimationDuration } from '@/theme';

export interface TokensPillProps {
  /** Current token count */
  count: number;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Show glow effect */
  showGlow?: boolean;
  /** Animate on count change */
  animateOnChange?: boolean;
}

/**
 * TokensPill - Display token count with diamond icon
 * Shows current token balance with optional glow and bounce animation
 */
export const TokensPill: React.FC<TokensPillProps> = ({
  count,
  size = 'medium',
  showGlow = true,
  animateOnChange = true,
}) => {
  const scale = useSharedValue(1);
  const previousCount = React.useRef(count);

  // Bounce animation when count changes
  useEffect(() => {
    if (animateOnChange && count !== previousCount.current) {
      const duration = getAnimationDuration(animations.durations.fast);
      
      if (duration > 0) {
        // Quick bounce
        scale.value = withSpring(1.2, animations.springs.bouncy);
        setTimeout(() => {
          scale.value = withSpring(1, animations.springs.gentle);
        }, duration);
      }
    }
    
    previousCount.current = count;
  }, [count, animateOnChange, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
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

  const iconSizeStyles = {
    small: { fontSize: 12 },
    medium: { fontSize: 16 },
    large: { fontSize: 20 },
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        sizeStyles[size],
        showGlow && styles.containerGlow,
        animatedStyle,
      ]}
      accessible
      accessibilityLabel={`${count} tokens`}
      accessibilityRole="text"
    >
      {/* Diamond icon */}
      <Text style={[styles.icon, iconSizeStyles[size]]}>💎</Text>

      {/* Token count */}
      <Text style={[styles.count, textSizeStyles[size]]}>{count}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.neonGreen,
    borderRadius: radii.l,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.m,
    gap: spacing.xs,
  },
  
  containerGlow: {
    ...glows.small.green,
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
  
  icon: {
    lineHeight: 20,
  },
  
  count: {
    ...typography.titleSmall,
    color: colors.neonGreen,
    fontWeight: '700',
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

export default TokensPill;

