import DailyChallengeMap from '@/components/home/DailyChallengeMap';
import HUD from '@/components/hud/HUD';
import Screen from '@/components/layout/Screen';
import { Section } from '@/components/shared/Section';
import { Segmented, SegmentedOption } from '@/components/ui/Segmented';
import { SUBJECT_LABELS } from '@/constants/subjects';
import { SubjectId, useUser } from '@/contexts/UserContext';
import { flags } from '@/lib/flags';
import { colors, fonts, spacing, radii } from '@/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const QUESTS_SEGMENTS: SegmentedOption[] = [
  { label: 'Story', value: 'story' },
  { label: 'Daily', value: 'daily' },
  { label: 'Practice', value: 'practice' },
];

const QuestsScreen = () => {
  const router = useRouter();
  const { subjectsUnlocked } = useUser();
  const [activeSegment, setActiveSegment] = useState<string>('daily');

  useEffect(() => {
    if (!flags.show_non_mvp_tabs) {
      router.replace('/(tabs)/home');
    }
  }, [router]);

  if (!flags.show_non_mvp_tabs) {
    return null;
  }

  const handleSubjectPress = (subjectId: SubjectId) => {
    router.push({
      pathname: '/(tabs)/quiz/[subject]',
      params: { subject: subjectId },
    });
  };

  const renderStory = () => {
    // Placeholder for Story/Level map
    // TODO: Replace with actual StoryMap component when available
    return (
      <Section title="Story">
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Story mode coming soon</Text>
          <Text style={styles.placeholderSubtext}>
            Work through levels to unlock new content
          </Text>
        </View>
      </Section>
    );
  };

  const renderDaily = () => {
    return (
      <Section title="Dagelijkse Reeks">
        <DailyChallengeMap />
      </Section>
    );
  };

  const renderPractice = () => {
    const subjects: SubjectId[] = ['hist', 'nl', 'math', 'geo'];
    
    return (
      <Section title="Practice">
        <View style={styles.practiceGrid}>
          {subjects.map((subjectId) => {
            const label = SUBJECT_LABELS[subjectId] || subjectId;
            const isUnlocked = subjectsUnlocked || subjectId === 'hist'; // hist is always unlocked
            
            return (
              <TouchableOpacity
                key={subjectId}
                style={[
                  styles.practiceTile,
                  !isUnlocked && styles.practiceTileLocked,
                ]}
                onPress={() => isUnlocked && handleSubjectPress(subjectId)}
                disabled={!isUnlocked}
              >
                <Text style={[
                  styles.practiceTileText,
                  !isUnlocked && styles.practiceTileTextLocked,
                ]}>
                  {label}
                </Text>
                {!isUnlocked && (
                  <Text style={styles.lockIcon}>🔒</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>
    );
  };

  const renderContent = () => {
    switch (activeSegment) {
      case 'story':
        return renderStory();
      case 'daily':
        return renderDaily();
      case 'practice':
        return renderPractice();
      default:
        return renderDaily();
    }
  };

  return (
    <Screen header={<HUD compact />} padding="m" scroll>
      {/* Segmented Control */}
      <View style={styles.segmentedContainer}>
        <Segmented
          options={QUESTS_SEGMENTS}
          value={activeSegment}
          onChange={setActiveSegment}
        />
      </View>

      {/* Content based on active segment */}
      {renderContent()}
    </Screen>
  );
};

const styles = StyleSheet.create({
  segmentedContainer: {
    marginBottom: spacing.l,
  },
  placeholder: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.s,
  },
  placeholderText: {
    fontFamily: fonts.arcade,
    fontSize: 16,
    color: colors.white,
  },
  placeholderSubtext: {
    fontFamily: fonts.arcade,
    fontSize: 12,
    color: colors.grey[600],
    textAlign: 'center',
  },
  practiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
    justifyContent: 'center',
  },
  practiceTile: {
    width: '45%',
    minHeight: 100,
    backgroundColor: colors.cardBg,
    borderRadius: radii.m,
    borderWidth: 2,
    borderColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.m,
  },
  practiceTileLocked: {
    borderColor: colors.grey[700],
    opacity: 0.5,
  },
  practiceTileText: {
    fontFamily: fonts.arcade,
    fontSize: 14,
    color: colors.neonGreen,
    textAlign: 'center',
  },
  practiceTileTextLocked: {
    color: colors.grey[600],
  },
  lockIcon: {
    fontSize: 20,
    marginTop: spacing.xs,
  },
});

export default QuestsScreen;
