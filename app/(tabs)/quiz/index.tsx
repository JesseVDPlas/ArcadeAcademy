import RetroButton from '@/components/shared/RetroButton';
import ScreenWrapper from '@/components/shared/ScreenWrapper';
import { SUBJECTS } from '@/constants/subjects';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function QuizTab() {
  const router = useRouter();
  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.list}>
        {SUBJECTS.map(s => (
          <RetroButton
            key={s.id}
            style={styles.button}
            onPress={() => router.push({ pathname: '/quiz/[subject]', params: { subject: s.id } })}
          >
            {s.label}
          </RetroButton>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { alignItems: 'center', paddingBottom: 40, paddingTop: 20 },
  button: {
    marginVertical: 12,
    width: 240,
  },
}); 