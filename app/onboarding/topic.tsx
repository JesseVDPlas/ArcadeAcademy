import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuiz } from '../../contexts/QuizContext';

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
  const { startNewQuiz } = useQuiz();

  const handleSelect = (topic: string) => {
    startNewQuiz(topic);
    router.push('/quiz-screen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kies een onderwerp om mee te starten</Text>
      <ScrollView contentContainerStyle={styles.options} showsVerticalScrollIndicator={false}>
        {TOPICS.map((topic) => (
          <Pressable
            key={topic.value}
            style={styles.option}
            onPress={() => handleSelect(topic.value)}
          >
            <Text style={styles.optionText}>{topic.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
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
    fontFamily: 'Courier', // Vervang door pixel font als beschikbaar
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
    fontFamily: 'Courier', // Vervang door pixel font als beschikbaar
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
}); 