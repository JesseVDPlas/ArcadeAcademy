import { colors, fonts, spacing, radii, glows } from '@/theme';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, PressableProps, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface BigPlayButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  onPress: () => void;
  hapticsEnabled?: boolean;
}

/**
 * BigPlayButton - Huge primary button with neon glow, press-scale animation, and haptic feedback
 * Designed for the Core Loop MVP home screen
 */
export const BigPlayButton: React.FC<BigPlayButtonProps> = ({
  label,
  onPress,
  hapticsEnabled = true,
  ...rest
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePress = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.button, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      {...rest}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.label}>{label}</Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    maxWidth: 320,
    minHeight: 80,
    backgroundColor: colors.neonGreen,
    borderWidth: 3,
    borderColor: colors.neonGreen,
    borderRadius: radii.l,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...glows.strong.green,
  },
  label: {
    fontFamily: fonts.arcade,
    fontSize: 28,
    color: colors.textOnAccent,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default BigPlayButton;

