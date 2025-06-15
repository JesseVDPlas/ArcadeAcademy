import { colors, fonts, radius, spacing } from '@/theme';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface XPBarProps {
  /** 0 → 1 */
  progress: number;
  showLevelUp?: boolean;
}

export const XPBar: React.FC<XPBarProps> = ({ progress, showLevelUp }) => {
  const animatedProgress = useSharedValue(progress);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 600 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${Math.min(Math.max(animatedProgress.value, 0), 1) * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.fill, animatedStyle]} />
      {showLevelUp && <Text style={styles.levelUp}>LEVEL UP!</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 12,
    backgroundColor: colors.deep,
    borderRadius: radius.pixel,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.neon,
  },
  levelUp: {
    position: 'absolute',
    top: -22,
    right: spacing.s,
    fontFamily: fonts.arcade,
    fontSize: 10,
    color: colors.neon,
  },
}); 