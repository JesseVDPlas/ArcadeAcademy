import RetroButton from '@/components/shared/RetroButton';
import { useSound } from '@/contexts/SoundContext';
import { ChallengeDef, ChallengeState } from '@/types/challenges';
import { colors, fonts, spacing } from '@/theme';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface ChallengeCardProps {
  def: ChallengeDef;
  state: ChallengeState;
  onClaim: () => void;
  loading?: boolean;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  def,
  state,
  onClaim,
  loading = false,
}) => {
  const { play } = useSound();
  const [showConfetti, setShowConfetti] = useState(false);
  const progressWidth = useSharedValue(0);
  const tokenCounter = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);

  // Animate progress bar
  useEffect(() => {
    const target = (state.progress / def.target) * 100;
    progressWidth.value = withSpring(Math.min(target, 100), {
      damping: 15,
      stiffness: 150,
    });
  }, [state.progress, def.target]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleClaim = () => {
    play('coin');
    setShowConfetti(true);
    tokenCounter.value = withTiming(state.reward, { duration: 800 });
    confettiOpacity.value = withTiming(1, { duration: 200 });
    
    setTimeout(() => {
      confettiOpacity.value = withTiming(0, { duration: 500 });
      setTimeout(() => setShowConfetti(false), 500);
    }, 1500);

    onClaim();
  };

  const getStatusChip = () => {
    switch (state.status) {
      case 'completed':
        return { text: 'Completed', color: colors.green };
      case 'claimed':
        return { text: 'Claimed', color: colors.neon };
      default:
        return { text: 'In Progress', color: colors.grey[600] };
    }
  };

  const statusChip = getStatusChip();

  if (loading) {
    return (
      <View style={[styles.card, styles.skeleton]}>
        <View style={styles.skeletonBar} />
        <View style={styles.skeletonBar} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{def.title}</Text>
        <View
          style={[
            styles.statusChip,
            {
              backgroundColor: statusChip.color + '20',
              borderColor: statusChip.color,
            },
          ]}
        >
          <Text style={[styles.statusText, { color: statusChip.color }]}>
            {statusChip.text}
          </Text>
        </View>
      </View>

      <Text style={styles.desc}>{def.desc}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <Text style={styles.progressText}>
          {state.progress} / {def.target}
        </Text>
      </View>

      <View style={styles.rewardContainer}>
        <FontAwesome name="diamond" size={14} color={colors.neon} />
        <Text style={styles.rewardText}>{def.reward}</Text>
      </View>

      {showConfetti && (
        <Animated.View
          style={[
            styles.confetti,
            {
              opacity: confettiOpacity,
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.confettiText}>🎉</Text>
        </Animated.View>
      )}

      <RetroButton
        onPress={handleClaim}
        disabled={state.status !== 'completed'}
        style={styles.claimButton}
      >
        {state.status === 'completed'
          ? 'Claim Reward'
          : state.status === 'claimed'
          ? 'Claimed ✓'
          : 'In Progress...'}
      </RetroButton>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.deep,
    padding: spacing.m,
    borderRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neon + '30',
    gap: spacing.s,
    position: 'relative',
  },
  skeleton: {
    minHeight: 120,
    justifyContent: 'center',
    gap: spacing.m,
  },
  skeletonBar: {
    height: 12,
    backgroundColor: colors.dark,
    borderRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.arcade,
    fontSize: 14,
    color: colors.neon,
    flex: 1,
  },
  statusChip: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: fonts.arcade,
    fontSize: 8,
  },
  desc: {
    fontFamily: fonts.arcade,
    fontSize: 10,
    color: colors.grey[600],
    lineHeight: 14,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.dark,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.neon,
  },
  progressText: {
    fontFamily: fonts.arcade,
    fontSize: 10,
    color: colors.white,
    minWidth: 50,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.deep,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neon + '30',
  },
  rewardText: {
    fontFamily: fonts.arcade,
    fontSize: 12,
    color: colors.neon,
  },
  claimButton: {
    marginTop: spacing.xs,
  },
  confetti: {
    position: 'absolute',
    top: -20,
    right: 20,
    zIndex: 1000,
  },
  confettiText: {
    fontSize: 32,
  },
});

