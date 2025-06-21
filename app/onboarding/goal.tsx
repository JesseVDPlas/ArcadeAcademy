import { fonts } from '@/theme';
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
        {GOALS.map((goal) => (
          <Pressable
            key={goal.value}
            style={[styles.option, selected === goal.value && styles.selected]}
            onPress={() => handleSelect(goal.value)}
          >
            <Text style={styles.optionText}>{goal.label}</Text>
          </Pressable>
        ))}
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
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#39FF14',
    fontSize: 28,
    fontFamily: fonts.arcade,
    marginBottom: 32,
    textAlign: 'center',
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
  options: {
    width: '100%',
    marginBottom: 48,
    alignItems: 'center',
  },
  option: {
    backgroundColor: '#111',
    borderColor: '#39FF14',
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 36,
    marginVertical: 10,
    width: 280,
    alignItems: 'center',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  selected: {
    backgroundColor: '#39FF14',
    borderColor: '#FF00FF',
  },
  optionText: {
    color: '#39FF14',
    fontSize: 20,
    fontFamily: fonts.arcade,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  button: {
    backgroundColor: '#111',
    borderColor: '#39FF14',
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 36,
    marginTop: 16,
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  buttonText: {
    color: '#39FF14',
    fontSize: 20,
    fontFamily: fonts.arcade,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
}); 