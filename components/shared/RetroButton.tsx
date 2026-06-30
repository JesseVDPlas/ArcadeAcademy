import { colors, typography, spacing, radii, glows } from '@/theme';
import { flags } from '@/lib/flags';
import { useHaptics } from '@/utils/haptics';
import React, { ReactNode } from 'react';
import { Pressable, PressableProps, StyleSheet, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface RetroButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  selected?: boolean;
  textStyle?: TextStyle;
  size?: 'small' | 'medium' | 'large';
  tone?: 'neutral' | 'success' | 'danger';
  children: ReactNode;
}

export const RetroButton: React.FC<RetroButtonProps> = ({
  variant = 'primary',
  selected = false,
  size = 'medium',
  textStyle,
  tone,
  children,
  style,
  onPress,
  ...rest
}) => {
  const haptics = useHaptics();
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  
  // Juice Pack: Press animations
  const handlePressIn = () => {
    if (flags.juice_pack) {
      scale.value = withSpring(0.97, {
        damping: 15,
        stiffness: 300,
      });
      glowOpacity.value = withTiming(0.3, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (flags.juice_pack) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  };

  const handlePress = (event: any) => {
    if (flags.juice_pack) {
      haptics.impact('medium');
    }
    onPress?.(event);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => {
    if (!flags.juice_pack || glowOpacity.value === 0) {
      return { opacity: 0 };
    }

    let glowColor = colors.neonGreen;
    if (tone === 'success') glowColor = colors.success;
    if (tone === 'danger') glowColor = colors.error;

    return {
      opacity: glowOpacity.value,
      shadowColor: glowColor,
      shadowOpacity: 0.55,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 1 },
    };
  });
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return selected ? styles.secondarySelected : styles.secondary;
      case 'danger':
        return styles.danger;
      case 'success':
        return styles.success;
      case 'ghost':
        return selected ? styles.ghostSelected : styles.ghost;
      case 'primary':
      default:
        return selected ? styles.primarySelected : styles.primary;
    }
  };

  const getLabelStyle = (): TextStyle => {
    const baseLabel = size === 'small' ? styles.labelSmall : 
                      size === 'large' ? styles.labelLarge : 
                      styles.label;
    
    switch (variant) {
      case 'secondary':
        // Secondary: outline style with semi-transparent background, use white text for visibility
        return { ...baseLabel, color: colors.white };
      case 'danger':
      case 'success':
        return { ...baseLabel, ...styles.labelOnAccent };
      case 'ghost':
        return selected 
          ? { ...baseLabel, ...styles.labelOnAccent } 
          : { ...baseLabel, color: colors.neonGreen };
      default:
        // Primary: solid background, so use textOnAccent
        return { ...baseLabel, ...styles.labelOnAccent };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'large':
        return styles.large;
      default:
        return styles.medium;
    }
  };

  const isDisabled = rest.disabled;
  const ButtonComponent = flags.juice_pack ? AnimatedPressable : Pressable;

  return (
    <ButtonComponent
      style={(pressableProps) => [
        styles.base,
        getSizeStyle(),
        getVariantStyle(),
        isDisabled && styles.disabled,
        flags.juice_pack && animatedStyle,
        typeof style === 'function' ? style(pressableProps) : style,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      {...rest}
      accessible
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {flags.juice_pack && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.glowOverlay, glowStyle]} pointerEvents="none" />
      )}
      {typeof children === 'string' ? (
        <Text 
          style={[getLabelStyle(), isDisabled && styles.disabledText, textStyle]}
          numberOfLines={3}
          adjustsFontSizeToFit={!textStyle?.fontSize}
          minimumFontScale={0.7}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </ButtonComponent>
  );
};

  const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    margin: spacing.xs,
    minHeight: 44, // Accessibility: minimum touch target
    overflow: 'hidden',
  },
  
  // Size variants
  small: {
    borderRadius: radii.m,
    paddingVertical: 6,
    paddingHorizontal: 10,
    minHeight: 40,
  },
  medium: {
    borderRadius: radii.m,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  large: {
    borderRadius: radii.m,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 54,
  },
  
  // Variant styles
  primary: {
    backgroundColor: colors.neonGreen,
    borderColor: colors.neonGreen,
    ...glows.small.green,
  },
  primarySelected: {
    backgroundColor: colors.neonGreen,
    borderColor: colors.neonGreen,
    ...glows.medium.green,
  },
  secondary: {
    backgroundColor: `${colors.bgDeep}CC`,
    borderColor: `${colors.electricPurple}B3`,
    borderWidth: 2,
  },
  secondarySelected: {
    backgroundColor: `${colors.electricPurple}D9`,
    borderColor: colors.electricPurple,
    ...glows.medium.purple,
  },
  danger: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  success: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  ghost: {
    backgroundColor: `${colors.bgDeep}80`,
    borderColor: `${colors.neonGreen}70`,
  },
  ghostSelected: {
    backgroundColor: colors.neonGreen + '20',
    borderColor: colors.neonGreen,
  },
  
  // Text styles
  label: {
    ...typography.button,
    color: colors.textOnAccent,
    fontSize: 13,
    letterSpacing: 0.4,
  },
  labelSmall: {
    ...typography.button,
    color: colors.textOnAccent,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  labelLarge: {
    ...typography.button,
    color: colors.textOnAccent,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  labelOnAccent: {
    color: colors.textOnAccent,
  },
  
  // States
  disabled: {
    opacity: 0.4,
    borderColor: colors.grey[700],
    backgroundColor: colors.grey[800] + '40', // Dimmed background
    // Remove glow on disabled
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  disabledText: {
    color: colors.grey[500],
  },
  glowOverlay: {
    borderRadius: radii.l,
    overflow: 'hidden',
  },
});

export default RetroButton; 
