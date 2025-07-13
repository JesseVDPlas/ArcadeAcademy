import { colors, fonts } from '@/theme';
import React, { ReactNode } from 'react';
import { Pressable, PressableProps, StyleSheet, Text } from 'react-native';

export interface RetroButtonProps extends PressableProps {
  variant?: 'primary' | 'danger' | 'success';
  selected?: boolean;
  children: ReactNode;
}

export const RetroButton: React.FC<RetroButtonProps> = ({
  variant = 'primary',
  selected = false,
  children,
  style,
  ...rest
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'danger':
        return styles.danger;
      case 'success':
        return styles.success;
      case 'primary':
      default:
        return selected ? styles.selected : styles.primary;
    }
  };

  const getLabelStyle = () => {
    switch (variant) {
      case 'danger':
      case 'success':
        return styles.selectedLabel;
      default:
        return selected ? styles.selectedLabel : styles.label;
    }
  };

  return (
    <Pressable
      style={(pressableProps) => [
        styles.base,
        getVariantStyle(),
        typeof style === 'function' ? style(pressableProps) : style,
      ]}
      {...rest}
    >
      <Text style={getLabelStyle()}>{children}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.neon,
    backgroundColor: '#111',
    margin: 8,
  },
  primary: {
    backgroundColor: '#111',
  },
  selected: {
    backgroundColor: colors.neon,
  },
  danger: {
    backgroundColor: colors.red,
  },
  success: {
    backgroundColor: colors.green,
  },
  label: {
    fontFamily: fonts.arcade,
    color: colors.neon,
    fontSize: 18,
  },
  selectedLabel: {
    fontFamily: fonts.arcade,
    color: colors.selectedText,
    fontSize: 18,
  },
});

export default RetroButton; 