import quizData from '@/assets/data/test_quiz_data_vwo1.json';
import { useUser } from '@/contexts/UserContext';
import { SUBJECTS } from '@/constants/subjects';
import { colors, fonts, radius, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LevelTile from './LevelTile';

const LevelMap = () => {
  const router = useRouter();
  const { grade, level, completedQuizzes } = useUser();

  const userCompletedQuizzes = useMemo<string[]>(() => {
    if (Array.isArray(completedQuizzes)) return completedQuizzes;
    if (completedQuizzes && typeof completedQuizzes === 'object') {
      return Object.values(completedQuizzes)
        .flat()
        .filter((quizId): quizId is string => typeof quizId === 'string');
    }
    return [];
  }, [completedQuizzes]);

  const combinedClassLevel = `${level || ''} ${grade || ''}`.trim();
  const levels = quizData.quizzes.filter(
    (q) => q.class_level.toLowerCase() === combinedClassLevel.toLowerCase()
  );

  const getLevelStatus = useCallback(
    (quizId: string, index: number) => {
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
          const subjectId =
            SUBJECTS.find((s) => s.label.toLowerCase() === level.subject.toLowerCase())?.id ??
            level.subject.toLowerCase().replace(/\s+/g, '');
          return (
            <LevelTile
              key={level.quiz_id}
              subjectId={subjectId}
              label={level.subject}
              status={status}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/quiz/[subject]',
                  params: { subject: subjectId },
                })
              }
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
});

export default LevelMap; 
