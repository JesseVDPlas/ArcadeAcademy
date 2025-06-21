import { fonts } from '@/theme';
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
  const { setUser, preferredSubjects = [] } = useUser();

  const toggleSubject = (subject: string) => {
    const updated = preferredSubjects.includes(subject)
      ? preferredSubjects.filter((s) => s !== subject)
      : [...preferredSubjects, subject];
    setUser({ preferredSubjects: updated });
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
        onPress={() => router.push('/onboarding/review' as any)}
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
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#39FF14',
    fontSize: 24,
    fontFamily: fonts.arcade,
    marginBottom: 24,
    textAlign: 'center',
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
  options: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  option: {
    backgroundColor: '#111',
    borderColor: '#39FF14',
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 36,
    marginVertical: 8,
    width: 280,
    alignItems: 'center',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  optionText: {
    color: '#39FF14',
    fontSize: 18,
    fontFamily: fonts.arcade,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  selected: {
    backgroundColor: '#39FF14',
  },
  button: {
    backgroundColor: '#39FF14',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 36,
    marginTop: 24,
    width: 280,
    alignItems: 'center',
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontFamily: fonts.arcade,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
}); 