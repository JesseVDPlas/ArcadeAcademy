import { RetroButton } from '@/components/shared/RetroButton';
import { useUser } from '@/contexts/UserContext';
import { colors, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ReviewScreen() {
  const { name, grade, preferredSubjects } = useUser();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kloppen deze gegevens?</Text>

      <View style={styles.card}>
        <Text style={styles.line}>👤 Naam: {name}</Text>
        <Text style={styles.line}>🏫 Klas: {grade}</Text>
        <Text style={styles.line}>
          📚 Vakken: {preferredSubjects?.join(', ') || '–'}
        </Text>
      </View>

      <RetroButton onPress={() => router.back()}>
        Wijzig
      </RetroButton>
      <RetroButton
        style={{ marginTop: spacing.m }}
        onPress={() => router.replace('/home')}
      >
        Start!
      </RetroButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.l },
  title: { fontSize: 22, color: colors.neon, marginBottom: spacing.l, textAlign: 'center' },
  card: {
    width: '85%',
    borderWidth: 1,
    borderColor: colors.neon,
    padding: spacing.m,
    marginBottom: spacing.l,
  },
  line: { fontSize: 18, color: colors.neon, marginVertical: spacing.xs },
}); 