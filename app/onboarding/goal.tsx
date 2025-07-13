import { colors, fonts } from '@/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const GOALS = [
  { label: '🔁 Dagelijks oefenen', value: 'daily' },
  { label: '⚡ Snel kennis bijspijkeren', value: 'fast' },
  { label: '🎮 Speels leren via levels', value: 'playful' },
];

export default function OnboardingGoal() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (goal: string) => {
    setSelected(goal);
    console.log('Gekozen doel:', goal);
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
      <Pressable style={styles.button} onPress={() => router.push('/onboarding/topic')}>
        <Text style={styles.buttonText}>Ga verder</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: colors.neon,
    fontSize: 24,
    fontFamily: fonts.arcade,
    marginBottom: 24,
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  option: {
    borderColor: colors.neon,
    borderWidth: 2,
    borderRadius: 10,
    padding: 16,
    margin: 8,
    backgroundColor: '#111',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#111',
    borderColor: colors.neon,
    shadowColor: colors.neon,
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  optionText: {
    color: colors.neon,
    fontSize: 18,
    fontFamily: fonts.arcade,
    textAlign: 'center',
  },
  selectedText: {
    color: colors.deep,
  },
  button: {
    backgroundColor: '#111',
    borderColor: colors.neon,
    borderWidth: 2,
    borderRadius: 10,
    padding: 16,
    marginTop: 24,
  },
  buttonText: {
    color: colors.neon,
    fontSize: 18,
    fontFamily: fonts.arcade,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 