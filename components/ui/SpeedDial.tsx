import { Icon, actionIcons } from '@/lib/icons';
import { colors, spacing, radii, glows } from '@/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Animated, Text } from 'react-native';

export interface SpeedDialAction {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
  disabled?: boolean;
}

export interface SpeedDialProps {
  open: boolean;
  onToggle: () => void;
  actions: SpeedDialAction[];
}

/**
 * SpeedDial - Floating action button with expandable actions
 * Used in quiz screen for boosters
 */
export const SpeedDial: React.FC<SpeedDialProps> = ({
  open,
  onToggle,
  actions,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: open ? 1 : 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(opacityAnim, {
        toValue: open ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [open, scaleAnim, opacityAnim]);

  return (
    <View style={styles.container}>
      {/* Action buttons */}
      {open && (
        <View style={styles.actionsContainer}>
          {actions.map((action, index) => {
            const translateY = scaleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -(60 * (index + 1) + 8)],
            });

            return (
              <Animated.View
                key={action.id}
                style={[
                  styles.actionWrapper,
                  {
                    transform: [{ translateY }, { scale: scaleAnim }],
                    opacity: opacityAnim,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    action.disabled && styles.actionButtonDisabled,
                  ]}
                  onPress={() => {
                    if (!action.disabled) {
                      action.onPress();
                      onToggle();
                    }
                  }}
                  disabled={action.disabled}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={action.icon as any}
                    size={20}
                    color={action.disabled ? colors.grey[600] : colors.neonGreen}
                  />
                </TouchableOpacity>
                {action.label && (
                  <View style={styles.actionLabelContainer}>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </View>
                )}
              </Animated.View>
            );
          })}
        </View>
      )}

      {/* Main FAB */}
      <TouchableOpacity
        style={[styles.mainFab, open && styles.mainFabOpen]}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <Animated.View
          style={{
            transform: [{ rotate: scaleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '45deg'],
            }) }],
          }}
        >
          <Icon
            name={open ? 'close' : actionIcons.fab}
            size={24}
            color={colors.neonGreen}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.l,
    alignItems: 'center',
    zIndex: 1000,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 64,
    right: 0,
    alignItems: 'flex-end',
    gap: spacing.s,
  },
  actionWrapper: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
    ...glows.small.green,
  },
  actionButtonDisabled: {
    borderColor: colors.grey[700],
    opacity: 0.5,
  },
  actionLabelContainer: {
    backgroundColor: colors.cardBg,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: radii.xs,
    borderWidth: 1,
    borderColor: colors.neonGreen + '40',
  },
  actionLabel: {
    fontSize: 10,
    color: colors.neonGreen,
    fontFamily: 'System',
  },
  mainFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cardBg,
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
  mainFabOpen: {
    backgroundColor: colors.neonGreen + '20',
  },
});

export default SpeedDial;

