import LevelTile from '@/components/home/LevelTile';
import { Section } from '@/components/shared/Section';
import Body from '@/components/ui/Body';
import { SUBJECT_LABELS, SUBJECTS } from '@/constants/subjects';
import { colors, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuizTab() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Section title="Kies je vak">
          <Body align="center" style={styles.subtitle}>
            Selecteer een vak om te oefenen
          </Body>
          
          <View style={styles.grid}>
            {SUBJECTS.map((subject) => (
              <LevelTile
                key={subject.id}
                subjectId={subject.id}
                label={SUBJECT_LABELS[subject.id] || subject.label}
                status="done"
                onPress={() => {
                  router.push({
                    pathname: '/(tabs)/quiz/[subject]',
                    params: { subject: subject.id },
                  });
                }}
              />
            ))}
          </View>
        </Section>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  content: {
    flex: 1,
    padding: spacing.m,
  },
  subtitle: {
    color: colors.grey[600],
    marginBottom: spacing.l,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 12,
  },
}); 
