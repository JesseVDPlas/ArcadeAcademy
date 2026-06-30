import { colors, coreStyles, fonts, radii, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const GOALS = [
  { label: 'Dagelijks oefenen', value: 'daily' },
  { label: 'Snel kennis bijspijkeren', value: 'fast' },
  { label: 'Speels leren via levels', value: 'playful' },
];

export default function OnboardingGoal() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (goal: string) => {
    setSelected(goal);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wat is je leerdoel?</Text>
      <View style={styles.options}>
        {GOALS.map((goal) => {
          const isSelected = selected === goal.value;
          return (
            <Pressable
              key={goal.value}
              style={[styles.option, isSelected && styles.selected]}
              onPress={() => handleSelect(goal.value)}
            >
              <Text style={[styles.optionText, isSelected && styles.selectedText]}>{goal.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        style={[styles.button, !selected && { opacity: 0.5 }]}
        disabled={!selected}
        onPress={() => router.replace('/(tabs)/home')}
      >
        <Text style={styles.buttonText}>Volgende</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: coreStyles.screenBg, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.neonGreen, fontSize: 24, fontFamily: fonts.arcade, marginBottom: spacing.xl },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: spacing.xl },
  option: {
    borderColor: colors.neonGreen,
    borderWidth: 1,
    borderRadius: radii.m,
    padding: spacing.l,
    margin: spacing.s,
    backgroundColor: coreStyles.buttonBg,
  },
  selected: { backgroundColor: colors.neonGreen },
  optionText: { color: colors.neonGreen, fontSize: 18, fontFamily: fonts.arcade },
  selectedText: { color: colors.selectedText, fontFamily: fonts.arcade },
  button: {
    backgroundColor: coreStyles.buttonBg,
    borderColor: coreStyles.buttonBorder,
    borderWidth: 1,
    borderRadius: radii.m,
    padding: spacing.l,
  },
  buttonText: { color: colors.neonGreen, fontSize: 18, fontFamily: fonts.arcade, fontWeight: 'bold' },
});
