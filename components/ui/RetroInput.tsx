import React, { useEffect, useRef } from 'react';
import { View, TextInput, TextInputProps, StyleSheet, Animated } from 'react-native';
import { colors, typography, spacing, radii, glows } from '@/theme';

export interface RetroInputProps extends TextInputProps {
  /** Show blinking cursor sprite */
  showCursor?: boolean;
  /** Error state styling */
  error?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

/**
 * RetroInput - Arcade-style input field with blinking cursor
 * Dark background, neon border, pixel-art aesthetic
 */
export const RetroInput: React.FC<RetroInputProps> = ({
  showCursor = true,
  error = false,
  size = 'medium',
  style,
  ...textInputProps
}) => {
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const [isFocused, setIsFocused] = React.useState(false);

  // Blinking cursor animation
  useEffect(() => {
    if (showCursor && isFocused) {
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      blinkAnimation.start();
      return () => blinkAnimation.stop();
    } else {
      cursorOpacity.setValue(1);
    }
  }, [showCursor, isFocused, cursorOpacity]);

  const sizeStyles = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  };

  const textSizeStyles = {
    small: styles.textSmall,
    medium: styles.textMedium,
    large: styles.textLarge,
  };

  return (
    <View style={[styles.container, sizeStyles[size], error && styles.error, style]}>
      <TextInput
        {...textInputProps}
        style={[styles.input, textSizeStyles[size]]}
        placeholderTextColor={colors.grey[600]}
        onFocus={(e) => {
          setIsFocused(true);
          textInputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          textInputProps.onBlur?.(e);
        }}
      />
      {showCursor && isFocused && (
        <Animated.View
          style={[
            styles.cursor,
            {
              opacity: cursorOpacity,
            },
          ]}
          pointerEvents="none"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.neonGreen,
    borderRadius: radii.m,
    ...glows.small.green,
  },
  small: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    minHeight: 36,
  },
  medium: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    minHeight: 44,
  },
  large: {
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.xl,
    minHeight: 52,
  },
  input: {
    ...typography.body,
    color: colors.neonGreen,
    fontFamily: typography.body.fontFamily,
    padding: 0, // Remove default padding
    margin: 0,
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  cursor: {
    position: 'absolute',
    right: spacing.m,
    top: '50%',
    width: 2,
    height: 20,
    backgroundColor: colors.neonGreen,
    marginTop: -10,
    ...glows.small.green,
  },
  error: {
    borderColor: colors.error,
    ...glows.small.pink,
  },
});

export default RetroInput;

