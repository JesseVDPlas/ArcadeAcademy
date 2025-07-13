import { useToast } from '@/contexts/ToastContext';
import { DailyStatus, SubjectId, useUser } from '@/contexts/UserContext';
import { colors, fonts, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import LevelTile from './LevelTile';

export const SUBJECT_LABELS: Record<SubjectId, string> = {
  hist: 'Geschiedenis',
  nl: 'Nederlands',
  math: 'Wiskunde',
  geo: 'Aardrijkskunde',
};

const GAP = 12;
const MAX_TILE = 140;

const DailyChallengeMap: React.FC = () => {
  const { width } = useWindowDimensions();
  const tileSize = Math.min(MAX_TILE, (width - GAP * 3) / 2);
  const labelFontSize = tileSize <= 80 ? 10 : 12;
  const router = useRouter();
  const toast = useToast();
  const { dailyChallenge } = useUser();
  const { order, progress } = dailyChallenge;

  return (
    <View style={styles.container}>
      <Text style={styles.mapTitle}>Daily Challenge</Text>
      <View style={[styles.grid, { width: tileSize * 2 + GAP, height: tileSize * 2 + GAP }]}> 
        {order.map((subjectId, idx) => (
          <LevelTile
            key={subjectId}
            id={subjectId as SubjectId}
            status={progress[subjectId] as DailyStatus}
            tileSize={tileSize}
            labelFontSize={labelFontSize}
            onPress={() => {
              if (progress[subjectId] === 'current') {
                router.push(`/quiz/intro/${subjectId}?daily=true`);
              } else if (progress[subjectId] === 'locked') {
                toast.show('Voltooi eerst het vorige vak!', 'error');
              }
            }}
          />
        ))}
      </View>
      <View style={{ paddingBottom: 24 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark,
    borderRadius: 8,
    marginBottom: spacing.l,
    alignItems: 'center',
  },
  mapTitle: {
    fontFamily: fonts.arcade,
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: GAP,
  },
});

export default DailyChallengeMap; 