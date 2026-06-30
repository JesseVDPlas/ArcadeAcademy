import { SUBJECT_LABELS } from '@/constants/subjects';
import { useUser } from '@/contexts/UserContext';
import { spacing } from '@/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import LevelTile from './LevelTile';

const GAP = 12;

const DailyChallengeMap: React.FC = () => {
  const router = useRouter();
  const { dailyChallenge } = useUser();
  const { order, progress } = dailyChallenge;

  return (
    <View style={styles.grid}>
      {order.map((subjectId) => {
        const status = progress[subjectId];
        const label = SUBJECT_LABELS[subjectId] || subjectId;
        return (
          <LevelTile
            key={subjectId}
            subjectId={subjectId}
            label={label}
            status={status}
            onPress={
              status === 'current' || status === 'done'
                ? () => {
                    router.push({
                      pathname: '/(tabs)/quiz/[subject]',
                      params: {
                        subject: subjectId,
                        daily: '1',
                        dailySubjectId: subjectId,
                      },
                    });
                  }
                : undefined
            }
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: GAP,
    paddingVertical: spacing.s,
  },
});

export default DailyChallengeMap;
 
