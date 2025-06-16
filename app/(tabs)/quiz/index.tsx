import RetroButton from '@/components/shared/RetroButton';
import { SUBJECTS } from '@/constants/subjects';
import { colors } from '@/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function QuizTab() {
  const router = useRouter();
  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 40 },
  list: { alignItems: 'center', paddingBottom: 40 },
  button: {
    borderColor: colors.neon,
    borderWidth: 2,
    borderRadius: 10,
    marginVertical: 12,
    backgroundColor: '#111',
    width: 240,
    alignItems: 'center',
  },
}); 