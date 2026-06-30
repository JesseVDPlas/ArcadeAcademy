import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useToastState } from '@/contexts/ToastContext';
import { colors, typography, spacing, radii, glows } from '@/theme';

/**
 * RetroToast - Arcade-style toast notification
 * Appears at the top of the screen with neon glow effect
 */
const RetroToast: React.FC = () => {
  const { toast, visible } = useToastState();
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && toast) {
      // Slide in and fade in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out and fade out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, toast, slideAnim, opacityAnim]);

  if (!toast) return null;

  const isError = toast.type === 'error';
  const iconLabel = isError ? 'ERR' : 'OK';
  const titleLabel = isError ? 'ERROR' : 'SUCCESS';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="none"
    >
      <View
        style={[
          styles.toast,
          isError ? styles.toastError : styles.toastSuccess,
        ]}
      >
        <Text style={[styles.icon, isError && styles.iconError]}>{iconLabel}</Text>
        <View style={styles.copyBlock}>
          <Text style={[styles.title, isError && styles.iconError]}>{titleLabel}</Text>
          <Text style={styles.message}>{toast.message}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Below status bar
    left: spacing.m,
    right: spacing.m,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    width: '100%',
    maxWidth: 560,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.neonGreen,
    borderRadius: radii.m,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    gap: spacing.m,
    minHeight: 52,
    ...glows.small.green,
  },
  toastSuccess: {
    borderColor: colors.neonGreen,
  },
  toastError: {
    borderColor: colors.error,
    ...glows.medium.pink,
  },
  icon: {
    ...typography.titleSmall,
    fontSize: 11,
    color: colors.neonGreen,
    minWidth: 28,
    textAlign: 'center',
  },
  iconError: {
    color: colors.error,
  },
  copyBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.titleSmall,
    fontSize: 9,
    color: colors.neonGreen,
    letterSpacing: 0.6,
  },
  message: {
    ...typography.body,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
});

export default RetroToast;
