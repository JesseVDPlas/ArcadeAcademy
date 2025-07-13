import quizData from '@/assets/data/test_quiz_data_vwo1.json';
import { useUser } from '@/contexts/UserContext';
import { colors, fonts, radius, spacing } from '@/theme';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

type LevelStatus = 'done' | 'current' | 'locked';

interface LevelTileProps {
  title: string;
  status: LevelStatus;
  onPress: () => void;
}

const LevelTile: React.FC<LevelTileProps> = ({ title, status, onPress }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => {
    if (status === 'current') {
      return {
        borderColor: colors.neon,
        borderWidth: 2,
        shadowColor: colors.neon,
        shadowRadius: withRepeat(withSequence(withTiming(8), withTiming(4)), -1, true),
      };
    }
    return {};
  });

  const handlePress = () => {
    if (status === 'locked') {
      rotation.value = withSequence(
        withTiming(-5, { duration: 50 }),
        withRepeat(withTiming(5, { duration: 100 }), 5, true),
        withTiming(0, { duration: 50 })
      );
      Alert.alert('Level Locked!', 'Complete previous levels to unlock.');
    } else {
      onPress();
    }
  };

  const animatedShakeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const getStatusStyle = () => {
    switch (status) {
      case 'done':
        return styles.done;
      case 'current':
        return styles.current;
      case 'locked':
        return styles.locked;
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.tile, getStatusStyle(), animatedBorderStyle, animatedShakeStyle]}>
        {status === 'locked' && (
          <FontAwesome name="lock" size={24} color="#00000080" style={styles.lockIcon} />
        )}
        <Text style={styles.tileText}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
};

const LevelMap = () => {
  const router = useRouter();
  const { grade, level, completedQuizzes } = useUser();

  // For demo: hardcode one completed quiz
  const MOCK_COMPLETED = ['feniks_vwo_1_geschiedenis_h1'];
  const userCompletedQuizzes = completedQuizzes.length > 0 ? completedQuizzes : MOCK_COMPLETED;

  const combinedClassLevel = `${level || ''} ${grade || ''}`.trim();
  const levels = quizData.quizzes.filter(
    (q) => q.class_level.toLowerCase() === combinedClassLevel.toLowerCase()
  );

  const getLevelStatus = useCallback(
    (quizId: string, index: number): LevelStatus => {
      if (userCompletedQuizzes.includes(quizId)) return 'done';
      // The first non-completed quiz is 'current'
      const firstLockedIndex = levels.findIndex((l) => !userCompletedQuizzes.includes(l.quiz_id));
      if (index === firstLockedIndex) return 'current';
      return 'locked';
    },
    [userCompletedQuizzes, levels]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.mapTitle}>Level Select</Text>
      <View style={styles.mapGrid}>
        {levels.map((level, index) => {
          const status = getLevelStatus(level.quiz_id, index);
          return (
            <LevelTile
              key={level.quiz_id}
              title={level.subject}
              status={status}
              onPress={() => router.push(`/quiz/${level.subject}`)}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark,
    padding: spacing.m,
    borderRadius: radius.pixel,
    marginBottom: spacing.l,
  },
  mapTitle: {
    fontFamily: fonts.arcade,
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.m,
  },
  tile: {
    width: 100,
    height: 100,
    borderRadius: radius.pixel,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.s,
    borderWidth: 2,
  },
  tileText: {
    fontFamily: fonts.arcade,
    color: colors.deep,
    fontSize: 10,
    textAlign: 'center',
  },

  done: {
    backgroundColor: colors.neon,
    borderColor: colors.green,
  },
  current: {
    backgroundColor: colors.white,
  },
  locked: {
    backgroundColor: '#444',
    borderColor: '#666',
  },
  lockIcon: {
    position: 'absolute',
  },
});

export default LevelMap; 