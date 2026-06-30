import { colors, spacing, radii, glows } from '@/theme';
import React, { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, actionIcons } from '@/lib/icons';

export interface FABProps {
  onPress: () => void;
  icon?: ReactNode;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

/**
 * FAB - Floating Action Button
 * Round floating button with neon glow
 */
export const FAB: React.FC<FABProps> = ({
  onPress,
  icon,
  size = 'medium',
}) => {
  const sizeStyles = {
    small: styles.fabSmall,
    medium: styles.fabMedium,
    large: styles.fabLarge,
  };

  const iconSize = {
    small: 20,
    medium: 24,
    large: 28,
  };

  return (
    <TouchableOpacity
      style={[styles.fab, sizeStyles[size]]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon || (
        <Icon
          name={actionIcons.fab}
          size={iconSize[size]}
          color={colors.neonGreen}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.l,
    backgroundColor: colors.cardBg,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
    ...glows.medium.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  fabMedium: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  fabLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});

export default FAB;

