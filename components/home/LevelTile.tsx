import { DailyStatus, SubjectId } from '@/contexts/UserContext';
import { colors, fonts, spacing } from '@/theme';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SUBJECT_LABELS } from './DailyChallengeMap';

interface LevelTileProps {
  id: SubjectId;
  status: DailyStatus;
  tileSize: number;
  labelFontSize: number;
  onPress: () => void;
}

const LevelTile: React.FC<LevelTileProps> = ({ id, status, tileSize, labelFontSize, onPress }) => {
  // Pulse animatie voor 'current'
  const pulse = useSharedValue(1);
  React.useEffect(() => {
    if (status === 'current') {
      pulse.value = withRepeat(withTiming(1.08, { duration: 500 }), -1, true);
    } else {
      pulse.value = 1;
    }
  }, [status]);

  const animatedStyle = useAnimatedStyle(() => {
    if (status === 'current') {
      return {
        borderColor: colors.neon,
        shadowColor: colors.neon,
        shadowRadius: 16,
        shadowOpacity: 0.7,
        borderWidth: 2,
        transform: [{ scale: pulse.value }],
      };
    }
    return {};
  });

  const baseStyle = [
    styles.tile,
    { width: tileSize, height: tileSize },
    status === 'done' && { backgroundColor: colors.neon, borderColor: colors.green },
    status === 'current' && { backgroundColor: colors.white },
    status === 'locked' && { backgroundColor: '#444', borderColor: '#666' },
  ];

  // Badge logica: done > current > locked
  let badge: React.ReactNode = null;
  if (status === 'done') {
    badge = (
      <View style={styles.badgeWrapper}>
        <FontAwesome name="check-circle" size={18} color={colors.neon} />
      </View>
    );
  } else if (status === 'locked') {
    badge = (
      <View style={styles.badgeWrapper}>
        <FontAwesome name="lock" size={18} color={colors.pink} />
      </View>
    );
  }

  return (
    <Pressable onPress={onPress} style={{ margin: 6 }}>
      <Animated.View style={[...baseStyle, animatedStyle, { justifyContent: 'center', alignItems: 'center' }]}> 
        {badge}
        <Text
          numberOfLines={2}
          adjustsFontSizeToFit
          style={[styles.label, { fontSize: labelFontSize }]}
        >
          {SUBJECT_LABELS[id]}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tile: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.s,
    borderWidth: 2,
    position: 'relative',
    backgroundColor: colors.dark,
  },
  label: {
    fontFamily: fonts.arcade,
    color: colors.deep,
    textAlign: 'center',
    lineHeight: 14,
  },
  badgeWrapper: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});

export default LevelTile; 