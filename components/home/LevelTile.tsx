import Body from '@/components/ui/Body';
import { useToast } from '@/contexts/ToastContext';
import { colors, radii, spacing } from '@/theme';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, View } from 'react-native';

// Pixel art subject icons
const SUBJECT_IMAGES: Record<string, any> = {
  nl: require('@/assets/images/subjects/nl.png'),
  math: require('@/assets/images/subjects/math.png'),
  engels: require('@/assets/images/subjects/engels.png'),
  hist: require('@/assets/images/subjects/hist.png'),
  geo: require('@/assets/images/subjects/geo.png'),
  biologie: require('@/assets/images/subjects/biologie.png'),
  natuurkunde: require('@/assets/images/subjects/natuurkunde.png'),
};
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export type LevelStatus = 'done' | 'current' | 'locked';

export interface LevelTileProps {
  subjectId: string;
  label: string;
  status: LevelStatus;
  onPress?: () => void;
}

const LevelTile: React.FC<LevelTileProps> = ({ subjectId, label, status, onPress }) => {
  const [screenWidth] = useState(Dimensions.get('window').width);
  const tileSize = screenWidth <= 350 ? 80 : 100;
  const scale = useSharedValue(1);
  const toast = useToast();

  // Pulse animation for 'current' status
  useEffect(() => {
    if (status === 'current') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [status, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (status === 'locked') {
      toast.show('Voltooi eerst het vorige vak!', 'error');
      return;
    }
    onPress?.();
  };

  const getBgColor = () => {
    if (status === 'current') return 'rgba(57, 255, 20, 0.1)'; // Neon green tint
    if (status === 'done') return 'rgba(255, 255, 255, 0.04)';
    return 'rgba(128, 0, 255, 0.08)'; // Purple for locked
  };

  const getBorderColor = () => {
    if (status === 'current') return colors.neon;
    if (status === 'done') return colors.grey[600];
    return '#666';
  };

  const getLabelColor = () => {
    if (status === 'current') return colors.neon;
    return colors.grey[600];
  };

  const iconSize = tileSize * 0.45;

  return (
    <Pressable onPress={handlePress} style={{ width: tileSize, height: tileSize }}>
      <Animated.View
        style={[
          styles.tile,
          {
            width: tileSize,
            height: tileSize,
            backgroundColor: getBgColor(),
            borderColor: getBorderColor(),
          },
          animatedStyle,
        ]}
      >
        {/* Locked overlay */}
        {status === 'locked' && (
          <View style={styles.lockedOverlay}>
            <FontAwesome name="lock" size={tileSize * 0.24} color="rgba(255, 255, 255, 0.4)" />
          </View>
        )}

        {/* Done badge */}
        {status === 'done' && (
          <View style={styles.doneBadge}>
            <FontAwesome name="check" size={12} color={colors.dark} />
          </View>
        )}

        {/* Subject icon - Pixel Art */}
        {status !== 'locked' && SUBJECT_IMAGES[subjectId] && (
          <Image 
            source={SUBJECT_IMAGES[subjectId]}
            style={{ width: iconSize, height: iconSize, marginBottom: spacing.xs }}
            resizeMode="contain"
          />
        )}

        {/* Label */}
        <Body
          style={[
            styles.label,
            {
              fontSize: tileSize <= 80 ? 9 : 10,
              color: getLabelColor(),
            },
          ]}
          numberOfLines={2}
        >
          {label}
        </Body>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tile: {
    borderRadius: radii.m,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.s,
    position: 'relative',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(128, 0, 255, 0.25)',
    borderRadius: radii.m,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  doneBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    backgroundColor: colors.neon,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  doneBadgeText: {
    fontSize: 14,
  },
  label: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default LevelTile;
