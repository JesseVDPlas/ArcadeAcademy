import { colors, fonts, spacing, radii, glows } from '@/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface StatusPillProps {
  /** Status type */
  type: 'cooldown' | 'active' | 'locked' | 'info';
  /** Status message */
  message: string;
  /** Optional countdown value */
  countdown?: number;
}

/**
 * StatusPill - Inline status indicator for cooldowns, active states, etc.
 * Clear visual feedback with appropriate colors
 */
export const StatusPill: React.FC<StatusPillProps> = ({
  type,
  message,
  countdown,
}) => {
  const getTypeStyle = () => {
    switch (type) {
      case 'cooldown':
        return styles.cooldown;
      case 'active':
        return styles.active;
      case 'locked':
        return styles.locked;
      case 'info':
        return styles.info;
      default:
        return styles.info;
    }
  };

  return (
    <View style={[styles.container, getTypeStyle()]}>
      <Text style={styles.message}>
        {countdown !== undefined ? `${message} (${countdown})` : message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: radii.s,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  cooldown: {
    backgroundColor: colors.warning + '20',
    borderColor: colors.warning,
  },
  active: {
    backgroundColor: colors.success + '20',
    borderColor: colors.success,
    ...glows.small.green,
  },
  locked: {
    backgroundColor: colors.grey[800] + '40',
    borderColor: colors.grey[700],
    opacity: 0.6,
  },
  info: {
    backgroundColor: colors.info + '20',
    borderColor: colors.info,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.white,
    letterSpacing: 0.2,
  },
});

export default StatusPill;

