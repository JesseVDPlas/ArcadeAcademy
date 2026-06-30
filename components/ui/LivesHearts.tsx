import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Icon from '@/app/components/ui/Icon';
import { spacing, animations, getAnimationDuration } from '@/theme';

export interface LivesHeartsProps {
  /** Current number of lives (0-5) */
  current: number;
  /** Maximum number of lives to display */
  max?: number;
  /** Size of heart icons */
  size?: 'small' | 'medium' | 'large';
  /** Trigger shake animation when lives decrease */
  onLivesLost?: boolean;
}

/**
 * LivesHearts - Display lives as heart icons
 * Shows filled hearts for current lives, empty for lost lives
 * Shakes when lives are lost
 */
export const LivesHearts: React.FC<LivesHeartsProps> = ({
  current,
  max = 5,
  size = 'medium',
  onLivesLost = false,
}) => {
  const shakeX = useSharedValue(0);
  const previousLives = React.useRef(current);

  // Trigger shake animation when lives decrease
  useEffect(() => {
    if (current < previousLives.current && onLivesLost) {
      const duration = getAnimationDuration(animations.durations.fast);
      
      if (duration > 0) {
        // Shake animation: left-right-left
        shakeX.value = withSequence(
          withTiming(-8, { duration: duration / 4 }),
          withTiming(8, { duration: duration / 4 }),
          withTiming(-4, { duration: duration / 4 }),
          withTiming(0, { duration: duration / 4 })
        );
      }
      
      // Haptic feedback on life lost
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    
    previousLives.current = current;
  }, [current, onLivesLost, shakeX]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const heartSizes = {
    small: 24,
    medium: 24,
    large: 32,
  };

  const iconSize = heartSizes[size];

  // Generate array of hearts based on max lives
  const hearts = Array.from({ length: max }, (_, index) => {
    const isFilled = index < current;
    return (
      <View
        key={index}
        style={[styles.heart, { opacity: isFilled ? 1 : 0.35 }]}
        accessible={false}
      >
        <Icon name="heart" size={iconSize} />
      </View>
    );
  });

  return (
    <Animated.View 
      style={[styles.container, animatedContainerStyle]}
      accessible
      accessibilityLabel={`${current} van ${max} levens`}
      accessibilityRole="text"
    >
      {hearts}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  heart: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LivesHearts;
