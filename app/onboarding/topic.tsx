import { colors, fonts } from '@/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useUser } from '../../contexts/UserContext';

const TOPICS = [
  { label: '🏛️ Geschiedenis', value: 'geschiedenis' },
  { label: '📐 Wiskunde', value: 'wiskunde' },
  { label: '🌍 Aardrijkskunde', value: 'aardrijkskunde' },
  { label: '🔬 Natuurkunde', value: 'natuurkunde' },
  { label: '🧪 Scheikunde', value: 'scheikunde' },
  { label: '🧬 Biologie', value: 'biologie' },
  { label: '📚 Nederlands', value: 'nederlands' },
  { label: '🇬🇧 Engels', value: 'engels' },
  { label: '🇫🇷 Frans', value: 'frans' },
  { label: '🇩🇪 Duits', value: 'duits' },
  { label: '💻 Informatica', value: 'informatica' },
  { label: '🎨 Kunst', value: 'kunst' },
  { label: '🎵 Muziek', value: 'muziek' },
  { label: '🏃 Lichamelijke opvoeding', value: 'lo' },
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
        {TOPICS.map((topic) => (
          <Pressable
            key={topic.value}
            style={[styles.option, preferredSubjects.includes(topic.value) && styles.selected]}
            onPress={() => toggleSubject(topic.value)}
          >
            <Text style={styles.optionText}>
              {preferredSubjects.includes(topic.value) ? '✅ ' : ''}{topic.label}
            </Text>
          </Pressable>
        ))}
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
    backgroundColor: colors.neon,
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