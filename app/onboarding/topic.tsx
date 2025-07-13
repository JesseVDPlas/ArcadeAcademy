import { colors, fonts } from '@/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useUser } from '../../contexts/UserContext';

const TOPICS = [
  { label: '🏛️ Geschiedenis', value: 'hist' },
  { label: '📚 Nederlands', value: 'nl' },
  { label: '📐 Wiskunde', value: 'math' },
  { label: '🌍 Aardrijkskunde', value: 'geo' },
];

export default function OnboardingTopic() {
  const router = useRouter();
  const { setPreferredSubjects, preferredSubjects } = useUser();

  const toggleSubject = (subject: string) => {
    const updated = preferredSubjects.includes(subject)
      ? preferredSubjects.filter((s) => s !== subject)
      : [...preferredSubjects, subject];
    setPreferredSubjects(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kies je favoriete vakken</Text>
      <ScrollView contentContainerStyle={styles.options} showsVerticalScrollIndicator={false}>
        {TOPICS.map((topic) => {
          const isSelected = preferredSubjects.includes(topic.value);
          return (
            <Pressable
              key={topic.value}
              style={[styles.option, isSelected && styles.selected]}
              onPress={() => toggleSubject(topic.value)}
            >
              <Text style={[styles.optionText, isSelected && styles.selectedText]}>
                {isSelected ? '✅ ' : ''}{topic.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Pressable
        style={[styles.button, preferredSubjects.length === 0 && { opacity: 0.5 }]}
        onPress={() => router.replace('/(tabs)/home')}
        disabled={preferredSubjects.length === 0}
      >
        <Text style={styles.buttonText}>Volgende</Text>
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
    alignItems: 'center',
    paddingBottom: 32,
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
  optionText: {
    color: colors.neon,
    fontSize: 18,
    fontFamily: fonts.arcade,
    textAlign: 'center',
  },
  selected: {
    backgroundColor: '#111',
    borderColor: colors.neon,
    shadowColor: colors.neon,
    shadowOpacity: 0.5,
    shadowRadius: 8,
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
    alignItems: 'center',
  },
  buttonText: {
    color: colors.neon,
    fontSize: 18,
    fontFamily: fonts.arcade,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 