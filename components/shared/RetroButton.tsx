import { colors, fonts, radius, spacing } from '@/theme';
import React, { ReactNode } from 'react';
import { Pressable, PressableProps, StyleSheet, Text } from 'react-native';

export interface RetroButtonProps extends PressableProps {
  variant?: 'primary' | 'danger';
  children: ReactNode;
}

export const RetroButton: React.FC<RetroButtonProps> = ({
  variant = 'primary',
  children,
  style,
  ...rest
}) => {
  return (
    <Pressable
      style={[styles.base, variant === 'danger' ? styles.danger : styles.primary, style]}
      {...rest}
    >
      <Text style={styles.label}>{children}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pixel,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.neon,
  },
  danger: {
    backgroundColor: colors.red,
  },
  label: {
    fontFamily: fonts.arcade,
    color: colors.deep,
    fontSize: 12,
  },
});

export default RetroButton; 